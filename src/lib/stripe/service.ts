import { stripe, getStripePriceId, STRIPE_PRICE_IDS, PlanType } from './client';
import { createClient } from '../supabase/server';
import { createServiceClient } from '../supabase/service-client';
import { Database } from '../types/database';
import Stripe from 'stripe';

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
  const supabase = await createClient();
  const service = createServiceClient();
  
  // Get or create customer
  let customerId: string;
  
  // Check if user already has a subscription record with customer ID
  const { data: existingSubscription } = await service
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  if (existingSubscription?.stripe_customer_id) {
    customerId = existingSubscription.stripe_customer_id;
  } else {
    // Get user email from auth (cookie-based client)
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

    // Update subscription record with customer ID (service role)
    await service
      .from('subscriptions')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', userId);
  }

  const priceId = getStripePriceId(planType);

  // Validate that the price exists in the current Stripe mode (test vs live)
  try {
    await stripe.prices.retrieve(priceId);
  } catch (e: any) {
    const isTestKey = !!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
    const mode = isTestKey ? 'TEST' : 'LIVE';
    const underlying = e instanceof Error ? e.message : String(e);
    const hint = `Your STRIPE_SECRET_KEY is ${mode} mode, but the price ${priceId} likely belongs to the other mode. Ensure STRIPE_PRO_PRICE_ID/STRIPE_PREMIUM_PRICE_ID and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY match the same mode as STRIPE_SECRET_KEY in Vercel for this deployment.`;
    throw new Error(`Invalid Stripe price for current mode: ${priceId}. ${hint} Underlying: ${underlying}`);
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
    // Ensure the resulting Subscription carries planType in its metadata for future updates
    subscription_data: {
      metadata: {
        planType,
      },
    },
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
  planTypeOverride,
}: {
  userId: string;
  stripeSubscription: Stripe.Subscription;
  customerId: string;
  planTypeOverride?: PlanType;
}) {
  const service = createServiceClient();
  
  const priceId = stripeSubscription.items.data[0]?.price?.id as string | undefined;
  if (!priceId) {
    throw new Error('No price ID found in subscription');
  }
  
  // Prefer explicit override, then metadata embedded on the Subscription, then heuristics
  const metadataOverride =
    stripeSubscription.metadata?.planType === 'pro' || stripeSubscription.metadata?.planType === 'premium'
      ? (stripeSubscription.metadata.planType as PlanType)
      : undefined;

  const computedPlan = await determinePlanType(priceId, planTypeOverride ?? metadataOverride);

  // Load existing subscription to avoid accidental downgrades when inference fails
  const { data: existingSub } = await service
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let effectivePlan: PlanType = computedPlan;
  const stripeStatus = stripeSubscription.status as Subscription['status'];
  const isStripeActiveish = ['active', 'trialing', 'past_due', 'incomplete'].includes(stripeStatus);
  const wasPaid = existingSub?.plan_type === 'pro' || existingSub?.plan_type === 'premium';

  if (computedPlan === 'free' && isStripeActiveish && wasPaid) {
    // Preserve previously paid plan to prevent flicker/downgrade when we can't infer plan confidently
    effectivePlan = existingSub!.plan_type as PlanType;
    console.warn('updateSubscriptionFromStripe: Preserving existing paid plan due to ambiguous inference', {
      userId,
      preservedPlan: effectivePlan,
      priceId,
      stripeStatus,
    });
  }
  
  const subscriptionUpdate: SubscriptionUpdate = {
    stripe_customer_id: customerId,
    stripe_subscription_id: stripeSubscription.id,
    status: stripeStatus,
    plan_type: effectivePlan,
    current_period_start: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await service
    .from('subscriptions')
    .update(subscriptionUpdate)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  // Update usage limits with new plan limits
  await updateUsageLimits(userId, effectivePlan);
}

/**
 * Resolve plan type using multiple strategies for robustness across live/test environments
 */
async function determinePlanType(priceId: string, override?: PlanType): Promise<PlanType> {
  // 1) Trust explicit override (e.g., from Checkout Session metadata)
  if (override === 'pro' || override === 'premium') return override;

  // 2) Match environment-configured price IDs
  if (priceId === STRIPE_PRICE_IDS.pro) return 'pro';
  if (priceId === STRIPE_PRICE_IDS.premium) return 'premium';

  // 3) Try to infer from Price object (lookup_key, nickname)
  try {
    const price = await stripe.prices.retrieve(priceId);
    const keyish = `${price.lookup_key || ''} ${price.nickname || ''}`.toLowerCase();
    if (keyish.includes('premium')) return 'premium';
    if (keyish.includes('pro')) return 'pro';

    // 4) Try to infer from Product name/metadata
    const productId = typeof price.product === 'string' ? price.product : price.product?.id;
    if (productId) {
      const product = await stripe.products.retrieve(productId);
      const nameish = `${product.name || ''} ${JSON.stringify(product.metadata || {})}`.toLowerCase();
      if (nameish.includes('premium')) return 'premium';
      if (nameish.includes('pro')) return 'pro';
    }
  } catch (e) {
    // Swallow and fallback to free
  }

  // 5) Default fallback
  return 'free';
}

/**
 * Update usage limits based on plan type
 */
export async function updateUsageLimits(userId: string, planType: PlanType) {
  const service = createServiceClient();
  
  const limits = {
    free: 1,
    pro: 25,
    premium: 75,
  };

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  const { error } = await service
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