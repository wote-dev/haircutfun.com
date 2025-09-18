-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
    generations_used INTEGER DEFAULT 0,
    plan_limit INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month_year ON public.usage_tracking(month_year);

-- Enable Row Level Security on tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for usage_tracking
CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON public.usage_tracking
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, full_name, avatar_url, email)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email
    );
    
    -- Create initial usage tracking record for current month
    INSERT INTO public.usage_tracking (user_id, month_year, generations_used, plan_limit)
    VALUES (
        NEW.id,
        TO_CHAR(NOW(), 'YYYY-MM'),
        0,
        1 -- Default free plan limit
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();