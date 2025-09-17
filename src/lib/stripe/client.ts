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

// Stripe price IDs (these should be set in your environment variables)
export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || '',
} as const;

// Runtime validation for Stripe price IDs
export function validateStripePriceIds(): void {
  if (!process.env.STRIPE_PRO_PRICE_ID) {
    throw new Error('STRIPE_PRO_PRICE_ID is not set in environment variables');
  }
  if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
    throw new Error('STRIPE_PREMIUM_PRICE_ID is not set in environment variables');
  }
}

// Get validated price ID for a plan
export function getStripePriceId(planType: 'pro' | 'premium'): string {
  const priceId = STRIPE_PRICE_IDS[planType];
  if (!priceId) {
    throw new Error(`STRIPE_${planType.toUpperCase()}_PRICE_ID is not set in environment variables`);
  }
  return priceId;
}

// Plan configurations
export const PLAN_CONFIGS = {
  free: {
    name: 'Free Trial',
    price: 0,
    generationsLimit: 1,
    features: [
      '1 free virtual haircut try',
      'Basic hairstyle gallery',
      'Standard photo upload',
      'Basic hair analysis',
      'Community support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 4.99,
    generationsLimit: 25,
    features: [
      '25 virtual haircut tries per month',
      'Access to ALL premium hairstyles',
      'HD photo processing',
      'Advanced AI hair analysis',
      'Priority processing speed',
      'Multiple angle views',
      'Save & compare results',
      'Priority customer support'
    ]
  },
  premium: {
    name: 'Premium',
    price: 12.99,
    generationsLimit: 75,
    features: [
      '75 virtual haircut tries per month',
      'Everything in Pro plan',
      'Exclusive celebrity hairstyles',
      'Custom hair color simulation',
      'Professional stylist consultation',
      'Personalized style recommendations',
      'Early access to new features',
      'White-glove customer support',
      'Commercial usage rights'
    ]
  }
} as const;

export type PlanType = keyof typeof PLAN_CONFIGS;