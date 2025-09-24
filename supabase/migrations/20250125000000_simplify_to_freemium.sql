-- Simplify to freemium model with one-time payment
-- Add has_pro_access boolean to user_profiles table

-- Add has_pro_access column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS has_pro_access BOOLEAN DEFAULT FALSE;

-- Create simple usage tracking table for free users (1 try limit)
CREATE TABLE IF NOT EXISTS public.user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    free_tries_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table to track one-time pro purchases
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'usd',
    status TEXT CHECK (status IN ('succeeded', 'pending', 'failed')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON public.user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_usage
CREATE POLICY "Users can view own usage" ON public.user_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON public.user_usage
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.user_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update the handle_new_user function to create user_usage record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (user_id, full_name, avatar_url, email, has_pro_access)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email,
        FALSE
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        email = EXCLUDED.email,
        updated_at = NOW();
    
    -- Create initial usage record
    INSERT INTO public.user_usage (user_id, free_tries_used)
    VALUES (NEW.id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant pro access after successful payment
CREATE OR REPLACE FUNCTION public.grant_pro_access(p_user_id UUID, p_payment_intent_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    payment_exists BOOLEAN;
BEGIN
    -- Check if payment exists and succeeded
    SELECT EXISTS(
        SELECT 1 FROM public.payments 
        WHERE user_id = p_user_id 
        AND stripe_payment_intent_id = p_payment_intent_id 
        AND status = 'succeeded'
    ) INTO payment_exists;
    
    IF payment_exists THEN
        -- Grant pro access
        UPDATE public.user_profiles 
        SET has_pro_access = TRUE, updated_at = NOW()
        WHERE user_id = p_user_id;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can generate (for free users)
CREATE OR REPLACE FUNCTION public.can_user_generate(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_has_pro BOOLEAN;
    tries_used INTEGER;
BEGIN
    -- Check if user has pro access
    SELECT has_pro_access INTO user_has_pro
    FROM public.user_profiles
    WHERE user_id = p_user_id;
    
    -- Pro users have unlimited access
    IF user_has_pro THEN
        RETURN TRUE;
    END IF;
    
    -- Free users get 1 try
    SELECT COALESCE(free_tries_used, 0) INTO tries_used
    FROM public.user_usage
    WHERE user_id = p_user_id;
    
    RETURN tries_used < 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage for free users
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_has_pro BOOLEAN;
BEGIN
    -- Check if user has pro access
    SELECT has_pro_access INTO user_has_pro
    FROM public.user_profiles
    WHERE user_id = p_user_id;
    
    -- Don't track usage for pro users
    IF user_has_pro THEN
        RETURN TRUE;
    END IF;
    
    -- Increment free usage
    INSERT INTO public.user_usage (user_id, free_tries_used)
    VALUES (p_user_id, 1)
    ON CONFLICT (user_id) DO UPDATE SET
        free_tries_used = user_usage.free_tries_used + 1,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;