import { createClient } from './src/lib/supabase/client.js';
import { getCachedSubscriptionStatus } from './src/lib/subscription-utils.js';

async function testSubscriptionStatus() {
  console.log('🔍 Testing subscription status detection...\n');
  
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ No authenticated user found');
      return;
    }
    
    console.log('👤 Current user:', user.email, 'ID:', user.id);
    
    // Check subscription status using the utility
    const subscriptionStatus = await getCachedSubscriptionStatus(user.id, true);
    
    console.log('\n📊 Subscription Status:');
    console.log('- isActive:', subscriptionStatus.isActive);
    console.log('- planType:', subscriptionStatus.planType);
    console.log('- status:', subscriptionStatus.status);
    console.log('- hasValidSubscription:', subscriptionStatus.hasValidSubscription);
    console.log('- isExpired:', subscriptionStatus.isExpired);
    console.log('- error:', subscriptionStatus.error);
    
    if (subscriptionStatus.subscription) {
      console.log('\n💳 Subscription Details:');
      console.log('- ID:', subscriptionStatus.subscription.id);
      console.log('- Plan Type:', subscriptionStatus.subscription.plan_type);
      console.log('- Status:', subscriptionStatus.subscription.status);
      console.log('- Stripe Customer ID:', subscriptionStatus.subscription.stripe_customer_id);
      console.log('- Stripe Subscription ID:', subscriptionStatus.subscription.stripe_subscription_id);
      console.log('- Period End:', subscriptionStatus.subscription.current_period_end);
    }
    
  } catch (error) {
    console.error('❌ Error testing subscription status:', error);
  }
}

testSubscriptionStatus();
