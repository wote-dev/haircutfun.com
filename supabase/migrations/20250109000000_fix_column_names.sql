-- Fix column name inconsistency in usage_tracking table
-- Ensure the table uses 'generations_used' consistently

-- First, check if the column exists and rename if needed
DO $$
BEGIN
    -- Check if haircut_generations column exists and rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usage_tracking' 
        AND column_name = 'haircut_generations'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.usage_tracking 
        RENAME COLUMN haircut_generations TO generations_used;
        RAISE NOTICE 'Renamed haircut_generations to generations_used';
    END IF;
    
    -- Ensure the generations_used column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usage_tracking' 
        AND column_name = 'generations_used'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.usage_tracking 
        ADD COLUMN generations_used INTEGER DEFAULT 0;
        RAISE NOTICE 'Added generations_used column';
    END IF;
END $$;

-- Ensure all RLS policies are properly set up
-- Drop existing policies if they exist to recreate them
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can update own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can delete own usage" ON public.usage_tracking;

-- Recreate RLS policies for usage_tracking
CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON public.usage_tracking
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own usage" ON public.usage_tracking
    FOR DELETE USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Do the same for subscriptions table
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscription" ON public.subscriptions;

-- Recreate RLS policies for subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscription" ON public.subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Add service role policies to allow backend operations
CREATE POLICY "Service role can manage usage_tracking" ON public.usage_tracking
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';