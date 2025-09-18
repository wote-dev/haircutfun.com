-- Fix existing free users who have incorrect plan limits
-- This should be run once to correct the data

UPDATE public.usage_tracking 
SET plan_limit = 1 
WHERE user_id IN (
    SELECT u.id 
    FROM public.users u
    LEFT JOIN public.subscriptions s ON u.id = s.user_id 
    WHERE s.plan_type IS NULL OR s.plan_type = 'free'
) 
AND plan_limit > 1;

-- Also update any records where plan_limit is 2 or 3 for users without active subscriptions
UPDATE public.usage_tracking 
SET plan_limit = 1 
WHERE user_id NOT IN (
    SELECT DISTINCT user_id 
    FROM public.subscriptions 
    WHERE plan_type IN ('pro', 'premium') 
    AND status = 'active'
) 
AND plan_limit > 1;