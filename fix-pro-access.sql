-- Fix Pro Access validation in database
-- This updates the can_user_generate function to properly prioritize Pro Access users

CREATE OR REPLACE FUNCTION public.can_user_generate(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_has_pro BOOLEAN DEFAULT FALSE;
    tries_used INTEGER DEFAULT 0;
BEGIN
    -- Check if user has pro access
    SELECT has_pro_access INTO user_has_pro
    FROM public.user_profiles
    WHERE user_id = p_user_id;
    
    -- Pro users have unlimited access - this should be checked FIRST
    IF user_has_pro IS TRUE THEN
        RETURN TRUE;
    END IF;
    
    -- Free users get 2 tries
    SELECT free_tries_used INTO tries_used
    FROM public.user_usage
    WHERE user_id = p_user_id;
    
    -- If no usage record exists, allow generation (first try)
    IF tries_used IS NULL THEN
        RETURN TRUE;
    END IF;
    
    RETURN tries_used < 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;