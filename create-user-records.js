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

async function createUserRecords() {
  console.log('🔍 Checking for existing user records...');
  
  try {
    // First, let's see what users exist in auth.users
    console.log('\n👥 Checking auth users...');
    
    // Get all users from auth (this requires service role)
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }
    
    console.log(`✅ Found ${users.length} users in auth.users`);
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Please sign up first at http://localhost:3000/auth/signin');
      return;
    }
    
    // Check each user for missing records
    for (const user of users) {
      console.log(`\n🔍 Checking user: ${user.email} (${user.id})`);
      
      // Check user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error(`❌ Error checking profile for ${user.email}:`, profileError.message);
      } else if (!profile) {
        console.log(`📝 Creating profile for ${user.email}...`);
        
        const { data: newProfile, error: createProfileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null
          })
          .select()
          .single();
        
        if (createProfileError) {
          console.error(`❌ Error creating profile:`, createProfileError.message);
        } else {
          console.log(`✅ Profile created for ${user.email}`);
        }
      } else {
        console.log(`✅ Profile exists for ${user.email}`);
      }
      
      // Check subscriptions
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (subscriptionError) {
        console.error(`❌ Error checking subscription for ${user.email}:`, subscriptionError.message);
      } else if (!subscription) {
        console.log(`💳 Creating subscription for ${user.email}...`);
        
        const { data: newSubscription, error: createSubscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            status: 'active',
            plan_type: 'free'
          })
          .select()
          .single();
        
        if (createSubscriptionError) {
          console.error(`❌ Error creating subscription:`, createSubscriptionError.message);
        } else {
          console.log(`✅ Subscription created for ${user.email}`);
        }
      } else {
        console.log(`✅ Subscription exists for ${user.email} (${subscription.plan_type})`);
      }
      
      // Check usage_tracking for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: usage, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .maybeSingle();
      
      if (usageError) {
        console.error(`❌ Error checking usage for ${user.email}:`, usageError.message);
      } else if (!usage) {
        console.log(`📊 Creating usage tracking for ${user.email} (${currentMonth})...`);
        
        const { data: newUsage, error: createUsageError } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: user.id,
            month_year: currentMonth,
            generations_used: 0,
            plan_limit: 1 // Default free plan limit
          })
          .select()
          .single();
        
        if (createUsageError) {
          console.error(`❌ Error creating usage tracking:`, createUsageError.message);
        } else {
          console.log(`✅ Usage tracking created for ${user.email}`);
        }
      } else {
        console.log(`✅ Usage tracking exists for ${user.email} (${usage.generations_used}/${usage.plan_limit})`);
      }
    }
    
    console.log('\n🎉 User record check/creation completed!');
    console.log('\n🔄 Now try refreshing your dashboard at http://localhost:3000/dashboard');
    
  } catch (error) {
    console.error('❌ Error in createUserRecords:', error);
  }
}

createUserRecords();