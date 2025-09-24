-- Simple migration to update the can_user_generate function only
-- Increase free trial limit from 1 to 2 tries

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
    
    -- Free users get 2 tries
    SELECT free_tries_used INTO tries_used
    FROM public.user_usage
    WHERE user_id = p_user_id;
    
    RETURN tries_used < 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;