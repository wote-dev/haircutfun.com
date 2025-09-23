-- Fix subscription table constraints to prevent multiple subscriptions per user
-- This migration addresses the issue where users can have multiple subscription records

-- First, clean up any duplicate subscriptions (keep the most recent one)
WITH ranked_subscriptions AS (
    SELECT 
        id,
        user_id,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, updated_at DESC) as rn
    FROM public.subscriptions
),
duplicates_to_delete AS (
    SELECT id 
    FROM ranked_subscriptions 
    WHERE rn > 1
)
DELETE FROM public.subscriptions 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Add unique constraint on user_id to prevent multiple subscriptions per user
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);

-- Update the handle_new_user function to use UPSERT instead of INSERT
-- This prevents conflicts if a subscription already exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (user_id, full_name, avatar_url, email)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        email = EXCLUDED.email,
        updated_at = NOW();
    
    -- Create or update subscription record using UPSERT
    INSERT INTO public.subscriptions (user_id, plan_type, status)
    VALUES (NEW.id, 'free', 'active')
    ON CONFLICT (user_id) DO UPDATE SET
        updated_at = NOW()
    WHERE subscriptions.plan_type = 'free'; -- Only update if still on free plan
    
    -- Create initial usage tracking record for current month
    INSERT INTO public.usage_tracking (user_id, month_year, generations_used, plan_limit)
    VALUES (
        NEW.id,
        TO_CHAR(NOW(), 'YYYY-MM'),
        0,
        1 -- Free plan limit
    )
    ON CONFLICT (user_id, month_year) DO UPDATE SET
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a function to safely update subscription plan_type
CREATE OR REPLACE FUNCTION public.update_subscription_plan(
    p_user_id UUID,
    p_plan_type TEXT,
    p_stripe_customer_id TEXT DEFAULT NULL,
    p_stripe_subscription_id TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'active'
)
RETURNS public.subscriptions AS $$
DECLARE
    result_subscription public.subscriptions;
BEGIN
    -- Validate plan_type
    IF p_plan_type NOT IN ('free', 'pro', 'premium') THEN
        RAISE EXCEPTION 'Invalid plan_type: %', p_plan_type;
    END IF;
    
    -- Validate status
    IF p_status NOT IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing') THEN
        RAISE EXCEPTION 'Invalid status: %', p_status;
    END IF;
    
    -- Update or insert subscription
    INSERT INTO public.subscriptions (
        user_id, 
        plan_type, 
        status,
        stripe_customer_id,
        stripe_subscription_id,
        current_period_start,
        current_period_end,
        updated_at
    )
    VALUES (
        p_user_id,
        p_plan_type,
        p_status,
        p_stripe_customer_id,
        p_stripe_subscription_id,
        CASE WHEN p_plan_type != 'free' THEN NOW() ELSE NULL END,
        CASE WHEN p_plan_type != 'free' THEN NOW() + INTERVAL '30 days' ELSE NULL END,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        plan_type = EXCLUDED.plan_type,
        status = EXCLUDED.status,
        stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, subscriptions.stripe_customer_id),
        stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, subscriptions.stripe_subscription_id),
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW()
    RETURNING * INTO result_subscription;
    
    -- Update usage limits based on new plan
    INSERT INTO public.usage_tracking (
        user_id, 
        month_year, 
        generations_used, 
        plan_limit
    )
    VALUES (
        p_user_id,
        TO_CHAR(NOW(), 'YYYY-MM'),
        0,
        CASE p_plan_type
            WHEN 'pro' THEN 25
            WHEN 'premium' THEN 75
            ELSE 1
        END
    )
    ON CONFLICT (user_id, month_year) DO UPDATE SET
        plan_limit = CASE p_plan_type
            WHEN 'pro' THEN 25
            WHEN 'premium' THEN 75
            ELSE 1
        END,
        updated_at = NOW();
    
    RETURN result_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_subscription_plan TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscription_plan TO service_role;