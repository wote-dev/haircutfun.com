const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://qwurjoehwlvxlijlizdg.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key_here';

if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === 'your_service_role_key_here') {
  console.error('❌ Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.log('You can find this in your Supabase dashboard under Settings > API');
  console.log('Run: SUPABASE_SERVICE_ROLE_KEY=your_key node fix-database-issues.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixDatabaseIssues() {
  console.log('🔧 Starting database fixes...\n');

  try {
    // Step 1: Check current table structure
    console.log('1️⃣ Checking current table structure...');
    
    const { data: usageData, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .limit(1);
    
    if (usageError) {
      console.log('❌ Error accessing usage_tracking:', usageError.message);
    } else {
      console.log('✅ usage_tracking table accessible');
      if (usageData && usageData.length > 0) {
        console.log('📋 Sample columns:', Object.keys(usageData[0]));
      }
    }

    // Step 2: Fix column name if needed
    console.log('\n2️⃣ Fixing column names...');
    
    const fixColumnSQL = `
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
          ELSE
              RAISE NOTICE 'Column haircut_generations does not exist or already renamed';
          END IF;
      END $$;
    `;

    const { error: columnError } = await supabase.rpc('exec', { sql: fixColumnSQL });
    if (columnError) {
      console.log('⚠️ Column fix result:', columnError.message);
    } else {
      console.log('✅ Column names fixed');
    }

    // Step 3: Fix RLS policies
    console.log('\n3️⃣ Fixing RLS policies...');
    
    const fixRLSSQL = `
      -- Drop and recreate RLS policies for usage_tracking
      DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
      DROP POLICY IF EXISTS "Users can update own usage" ON public.usage_tracking;
      DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_tracking;
      DROP POLICY IF EXISTS "Users can delete own usage" ON public.usage_tracking;
      DROP POLICY IF EXISTS "Service role can manage usage_tracking" ON public.usage_tracking;

      -- Recreate RLS policies for usage_tracking
      CREATE POLICY "Users can view own usage" ON public.usage_tracking
          FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can update own usage" ON public.usage_tracking
          FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert own usage" ON public.usage_tracking
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Service role can manage usage_tracking" ON public.usage_tracking
          FOR ALL USING (auth.role() = 'service_role');

      -- Drop and recreate RLS policies for subscriptions
      DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
      DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
      DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
      DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

      -- Recreate RLS policies for subscriptions
      CREATE POLICY "Users can view own subscription" ON public.subscriptions
          FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can update own subscription" ON public.subscriptions
          FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert own subscription" ON public.subscriptions
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
          FOR ALL USING (auth.role() = 'service_role');

      -- Ensure RLS is enabled
      ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
    `;

    const { error: rlsError } = await supabase.rpc('exec', { sql: fixRLSSQL });
    if (rlsError) {
      console.log('⚠️ RLS fix result:', rlsError.message);
    } else {
      console.log('✅ RLS policies fixed');
    }

    // Step 4: Test the fixes
    console.log('\n4️⃣ Testing the fixes...');
    
    // Test usage_tracking access
    const { data: testUsage, error: testUsageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .limit(1);
    
    if (testUsageError) {
      console.log('❌ usage_tracking test failed:', testUsageError.message);
    } else {
      console.log('✅ usage_tracking table accessible after fixes');
    }

    // Test subscriptions access
    const { data: testSubs, error: testSubsError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1);
    
    if (testSubsError) {
      console.log('❌ subscriptions test failed:', testSubsError.message);
    } else {
      console.log('✅ subscriptions table accessible after fixes');
    }

    console.log('\n🎉 Database fixes completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Test your application to see if the 406/401 errors are resolved');
    console.log('2. If issues persist, check your Supabase dashboard for any additional RLS policy conflicts');
    console.log('3. Ensure your application is using the correct column names (generations_used, not haircut_generations)');

  } catch (error) {
    console.error('❌ Error fixing database issues:', error);
    process.exit(1);
  }
}

fixDatabaseIssues();