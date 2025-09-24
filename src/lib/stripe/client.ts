import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

// Lazy initialization of Stripe instance
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    
    // Initialize Stripe without forcing an invalid/future API version.
    // This uses the account's default API version set in the Stripe Dashboard,
    // ensuring compatibility with the installed stripe SDK.
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  
  return stripeInstance;
}

// Legacy export for backward compatibility - now uses lazy loading
export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    return getStripe()[prop as keyof Stripe];
  }
});

// Client-side publishable key with runtime validation
export function getStripePublishableKey(): string {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

// Legacy export for backward compatibility
export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Get validated price ID for a plan (only pro is supported for one-time payments)
export function getStripePriceId(planType: 'pro'): string {
  // For one-time payments, we don't use predefined price IDs
  // The price is created dynamically in the checkout session
  if (planType !== 'pro') {
    throw new Error(`Unsupported plan type: ${planType}. Only 'pro' is supported.`);
  }
  return 'pro'; // Return the plan type as identifier
}

// Plan configurations
export const PLAN_CONFIGS = {
  free: {
    name: 'Free Trial',
    price: 0,
    generationsLimit: 2,
    features: [
      '2 free virtual haircut tries',
      'Basic hairstyle gallery',
      'Standard photo upload',
      'Basic hair analysis',
      'Community support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 4.99,
    generationsLimit: Infinity,
    features: [
      'Unlimited virtual haircut generations',
      'Access to ALL premium hairstyles',
      'Priority processing speed',
      'Save & compare results',
      'Priority customer support',
      'No monthly fees ever'
    ]
  }
} as const;

export type PlanType = 'free' | 'pro';