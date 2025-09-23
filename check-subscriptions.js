const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubscriptions() {
  console.log('🔍 Checking all subscription records...\n');

  try {
    // Get all subscriptions
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching subscriptions:', error);
      return;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('ℹ️ No subscriptions found in the database');
    } else {
      console.log(`📋 Found ${subscriptions.length} subscription(s):\n`);

      subscriptions.forEach((sub, index) => {
        console.log(`--- Subscription ${index + 1} ---`);
        console.log(`ID: ${sub.id}`);
        console.log(`User ID: ${sub.user_id}`);
        console.log(`Plan Type: ${sub.plan_type}`);
        console.log(`Status: ${sub.status}`);
        console.log(`Stripe Customer ID: ${sub.stripe_customer_id}`);
        console.log(`Stripe Subscription ID: ${sub.stripe_subscription_id}`);
        console.log(`Created: ${sub.created_at}`);
        console.log(`Updated: ${sub.updated_at}`);
        console.log(`Period: ${sub.current_period_start} to ${sub.current_period_end}`);
        console.log('');
      });
    }

    // Also check auth.users to see what users exist
    console.log('👥 Checking auth.users...\n');
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users.users.length} user(s):`);
    users.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.id} - ${user.email}`);
    });

    // If we have users but no subscriptions, create default subscriptions
    if (users.users.length > 0 && (!subscriptions || subscriptions.length === 0)) {
      console.log('\n🔧 Creating missing default subscriptions...\n');
      
      for (const user of users.users) {
        console.log(`Creating subscription for user: ${user.email}`);
        
        const { data: newSub, error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
            stripe_customer_id: null,
            stripe_subscription_id: null,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          })
          .select()
          .single();

        if (subError) {
          console.error(`❌ Error creating subscription for ${user.email}:`, subError);
        } else {
          console.log(`✅ Created subscription for ${user.email}: ${newSub.id}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSubscriptions();