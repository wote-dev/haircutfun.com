import { stripe, STRIPE_PRICE_IDS, PlanType } from './client';
import { createClient } from '../supabase/client';
import { Database } from '../types/database';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

/**
 * Create a Stripe customer for a user
 */
export async function createStripeCustomer({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name?: string;
}) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  return customer;
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  planType,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  planType: 'pro' | 'premium';
  successUrl: string;
  cancelUrl: string;
}) {
  const supabase = createClient();
  
  // Get or create customer
  let customerId: string;
  
  // Check if user already has a subscription record with customer ID
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  if (existingSubscription?.stripe_customer_id) {
    customerId = existingSubscription.stripe_customer_id;
  } else {
    // Get user email from auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      throw new Error('User email not found');
    }

    // Create new customer
    const customer = await createStripeCustomer({
      userId,
      email: user.email,
      name: user.user_metadata?.full_name,
    });
    customerId = customer.id;

    // Update subscription record with customer ID
    await supabase
      .from('subscriptions')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', userId);
  }

  const priceId = STRIPE_PRICE_IDS[planType];
  if (!priceId) {
    throw new Error(`Price ID not configured for plan: ${planType}`);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planType,
    },
  });

  return session;
}

/**
 * Create a customer portal session for managing subscriptions
 */
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Get subscription details from Stripe
 */
export async function getStripeSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}

/**
 * Update subscription in database based on Stripe webhook data
 */
export async function updateSubscriptionFromStripe({
  userId,
  stripeSubscription,
  customerId,
}: {
  userId: string;
  stripeSubscription: any;
  customerId: string;
}) {
  const supabase = createClient();
  
  const planType = getPlanTypeFromPriceId(stripeSubscription.items.data[0]?.price?.id);
  
  const subscriptionUpdate: SubscriptionUpdate = {
    stripe_customer_id: customerId,
    stripe_subscription_id: stripeSubscription.id,
    status: stripeSubscription.status as any,
    plan_type: planType,
    current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('subscriptions')
    .update(subscriptionUpdate)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  // Update usage tracking with new plan limits
  await updateUsageLimits(userId, planType);
}

/**
 * Update usage limits based on plan type
 */
export async function updateUsageLimits(userId: string, planType: PlanType) {
  const supabase = createClient();
  
  const limits = {
    free: 1,
    pro: 25,
    premium: 75,
  };

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  const { error } = await supabase
    .from('usage_tracking')
    .upsert({
      user_id: userId,
      month_year: currentMonth,
      plan_limit: limits[planType],
      generations_used: 0, // Reset for new plan
    }, {
      onConflict: 'user_id,month_year'
    });

  if (error) {
    throw new Error(`Failed to update usage limits: ${error.message}`);
  }
}

/**
 * Helper function to determine plan type from Stripe price ID
 */
function getPlanTypeFromPriceId(priceId: string): PlanType {
  if (priceId === STRIPE_PRICE_IDS.pro) return 'pro';
  if (priceId === STRIPE_PRICE_IDS.premium) return 'premium';
  return 'free';
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}