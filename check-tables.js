const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTables() {
  console.log('🔍 Checking existing tables...');
  
  const tables = ['user_profiles', 'subscriptions', 'usage_tracking'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Table exists and accessible`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  console.log('\n🔧 Attempting to create missing tables using SQL...');
  
  // Try creating tables using raw SQL queries
  const createUserProfilesSQL = `
    CREATE TABLE IF NOT EXISTS public.user_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
      email TEXT,
      full_name TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for users to access their own profile
    CREATE POLICY "Users can view own profile" ON public.user_profiles
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own profile" ON public.user_profiles
      FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own profile" ON public.user_profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  `;
  
  const createUsageTrackingSQL = `
    CREATE TABLE IF NOT EXISTS public.usage_tracking (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      month_year TEXT NOT NULL,
      haircut_generations INTEGER DEFAULT 0,
      plan_limit INTEGER DEFAULT 3,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, month_year)
    );
    
    -- Enable RLS
    ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for users to access their own usage data
    CREATE POLICY "Users can view own usage" ON public.usage_tracking
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own usage" ON public.usage_tracking
      FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own usage" ON public.usage_tracking
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  `;
  
  try {
    console.log('\n📋 Creating user_profiles table...');
    const { error: profileError } = await supabase.rpc('exec_sql', { 
      sql: createUserProfilesSQL 
    });
    
    if (profileError) {
      console.log('❌ Failed to create user_profiles:', profileError.message);
    } else {
      console.log('✅ user_profiles table created successfully');
    }
  } catch (err) {
    console.log('❌ Error creating user_profiles:', err.message);
  }
  
  try {
    console.log('\n📊 Creating usage_tracking table...');
    const { error: usageError } = await supabase.rpc('exec_sql', { 
      sql: createUsageTrackingSQL 
    });
    
    if (usageError) {
      console.log('❌ Failed to create usage_tracking:', usageError.message);
    } else {
      console.log('✅ usage_tracking table created successfully');
    }
  } catch (err) {
    console.log('❌ Error creating usage_tracking:', err.message);
  }
  
  console.log('\n🔍 Re-checking tables after creation...');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Table exists and accessible`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

checkTables();