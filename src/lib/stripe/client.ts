import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
}

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

// Client-side publishable key
export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Stripe price IDs (these should be set in your environment variables)
export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || '',
} as const;

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
    price: 9.99,
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
    price: 19.99,
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