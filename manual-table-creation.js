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

async function createTablesManually() {
  console.log('🚀 Creating tables manually...');
  
  // Since we can't execute raw SQL, let's try to create a user profile for the current user
  // and see if that triggers the creation or gives us more info
  
  console.log('\n🔍 First, let\'s check what we can access...');
  
  // Try to get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('Current user:', user ? user.id : 'No user');
  
  // Try to access auth.users (this might not work)
  try {
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(1);
    
    if (authError) {
      console.log('❌ Cannot access auth.users:', authError.message);
    } else {
      console.log('✅ Can access auth.users:', authUsers);
    }
  } catch (err) {
    console.log('❌ Error accessing auth.users:', err.message);
  }
  
  // Let's try to manually insert into user_profiles to see what happens
  console.log('\n🧪 Testing manual insertion...');
  
  // Get a test user ID (we'll use the one from the error logs)
  const testUserId = '1fb9fd80-0a61-4379-814c-5c622ba8755b';
  
  try {
    const { data: insertResult, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: testUserId,
        email: 'test@example.com',
        full_name: 'Test User'
      })
      .select();
    
    if (insertError) {
      console.log('❌ Cannot insert into user_profiles:', insertError.message);
      
      // If the table doesn't exist, the error will tell us
      if (insertError.message.includes('does not exist') || insertError.message.includes('schema cache')) {
        console.log('\n🔧 Table definitely doesn\'t exist. Need to create it via Supabase dashboard.');
        console.log('\n📋 MANUAL STEPS REQUIRED:');
        console.log('1. Go to https://supabase.com/dashboard/project/qwurjoehwlvxlijlizdg/editor');
        console.log('2. Click on "SQL Editor"');
        console.log('3. Copy and paste the following SQL:');
        console.log('\n--- SQL TO EXECUTE ---');
        console.log(`
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
    month_year TEXT NOT NULL,
    generations_used INTEGER DEFAULT 0,
    plan_limit INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- Enable Row Level Security
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
        `);
        console.log('--- END SQL ---\n');
        console.log('4. Click "Run" to execute the SQL');
        console.log('5. Refresh your dashboard to see the changes');
      }
    } else {
      console.log('✅ Successfully inserted into user_profiles:', insertResult);
    }
  } catch (err) {
    console.log('❌ Error inserting into user_profiles:', err.message);
  }
  
  // Try the same for usage_tracking
  try {
    const { data: usageResult, error: usageError } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: testUserId,
        month_year: '2025-09',
        generations_used: 0,
        plan_limit: 3
      })
      .select();
    
    if (usageError) {
      console.log('❌ Cannot insert into usage_tracking:', usageError.message);
    } else {
      console.log('✅ Successfully inserted into usage_tracking:', usageResult);
    }
  } catch (err) {
    console.log('❌ Error inserting into usage_tracking:', err.message);
  }
}

createTablesManually();