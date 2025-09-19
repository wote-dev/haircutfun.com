const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!SERVICE_ROLE_KEY);
  console.error('\n💡 Please check your .env file and ensure these variables are set.');
  process.exit(1);
}

console.log('🔗 Supabase URL:', SUPABASE_URL);
console.log('🔑 Service Role Key:', SERVICE_ROLE_KEY ? 'Present' : 'Missing');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  try {
    console.log('🚀 Starting table creation process...');
    
    // Create user_profiles table
    console.log('\n📋 Creating user_profiles table...');
    const userProfilesSQL = `
      CREATE TABLE IF NOT EXISTS public.user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        email TEXT,
        full_name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: profileError } = await supabase.rpc('exec', { sql: userProfilesSQL });
    if (profileError) {
      console.log('⚠️  User profiles table might already exist or using direct SQL...');
    } else {
      console.log('✅ User profiles table created successfully');
    }
    
    // Create subscriptions table
    console.log('\n💳 Creating subscriptions table...');
    const subscriptionsSQL = `
      CREATE TABLE IF NOT EXISTS public.subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        stripe_price_id TEXT,
        status TEXT NOT NULL DEFAULT 'inactive',
        plan_name TEXT NOT NULL DEFAULT 'free',
        current_period_start TIMESTAMP WITH TIME ZONE,
        current_period_end TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: subscriptionError } = await supabase.rpc('exec', { sql: subscriptionsSQL });
    if (subscriptionError) {
      console.log('⚠️  Subscriptions table might already exist or using direct SQL...');
    } else {
      console.log('✅ Subscriptions table created successfully');
    }
    
    // Create usage_tracking table
    console.log('\n📊 Creating usage_tracking table...');
    const usageTrackingSQL = `
      CREATE TABLE IF NOT EXISTS public.usage_tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        month_year TEXT NOT NULL,
        generations_used INTEGER DEFAULT 0,
        plan_limit INTEGER DEFAULT 3,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, month_year)
      );
    `;
    
    const { error: usageError } = await supabase.rpc('exec', { sql: usageTrackingSQL });
    if (usageError) {
      console.log('⚠️  Usage tracking table might already exist or using direct SQL...');
    } else {
      console.log('✅ Usage tracking table created successfully');
    }
    
    console.log('\n🎉 Table creation process completed!');
    
    // Test table access
    console.log('\n🔍 Testing table access...');
    
    const { data: profileTest, error: profileTestError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (profileTestError) {
      console.error('❌ Cannot access user_profiles table:', profileTestError.message);
    } else {
      console.log('✅ user_profiles table accessible');
    }
    
    const { data: subscriptionTest, error: subscriptionTestError } = await supabase
      .from('subscriptions')
      .select('count')
      .limit(1);
    
    if (subscriptionTestError) {
      console.error('❌ Cannot access subscriptions table:', subscriptionTestError.message);
    } else {
      console.log('✅ subscriptions table accessible');
    }
    
    const { data: usageTest, error: usageTestError } = await supabase
      .from('usage_tracking')
      .select('count')
      .limit(1);
    
    if (usageTestError) {
      console.error('❌ Cannot access usage_tracking table:', usageTestError.message);
    } else {
      console.log('✅ usage_tracking table accessible');
    }
    
  } catch (error) {
    console.error('❌ Table creation failed:', error);
    process.exit(1);
  }
}

createTables();