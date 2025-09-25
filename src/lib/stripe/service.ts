import { stripe, getStripePriceId, PlanType } from './client';
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
 * Create a checkout session for one-time payment
 */
export async function createCheckoutSession({
  userId,
  planType,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  planType: 'pro';
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

  // Create checkout session for one-time payment
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'HaircutFun Pro Access',
            description: 'Unlimited AI haircut generations with one-time payment',
          },
          unit_amount: 399, // $3.99 in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
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
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}