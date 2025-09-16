# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for your Next.js application.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. A Supabase project (sign up at https://supabase.com)
3. Node.js and npm installed

## Environment Variables Setup

### 1. Supabase Configuration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy the following values to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Stripe Configuration

1. Go to your Stripe dashboard: https://dashboard.stripe.com
2. Go to Developers > API keys
3. Copy the following values to your `.env.local` file:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

4. For webhook secret, go to Developers > Webhooks
5. Create a new webhook endpoint: `http://localhost:3000/api/webhooks/stripe`
6. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
7. Copy the webhook secret to your `.env.local` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. App Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

Run the following SQL in your Supabase SQL editor to create the necessary tables:

```sql
-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT,
  plan_type TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');
```

## Stripe Products Setup

1. Go to Stripe dashboard > Products
2. Create two products:
   - **Pro Plan**: $9.99/month
   - **Premium Plan**: $19.99/month
3. Note down the price IDs and update them in `/src/lib/stripe/config.ts`

## Testing

1. Use Stripe test cards: https://stripe.com/docs/testing
2. Test card: `4242 4242 4242 4242`
3. Use any future expiry date and any 3-digit CVC

## Features Implemented

### Authentication
- Google OAuth integration with Supabase
- Protected routes and components
- User session management

### Payment Components
- **Pricing Page**: `/pricing` - Displays plans with Stripe checkout
- **PaymentGate**: Blocks premium features for free users
- **UpgradePrompt**: Modal prompts for upgrades

### API Endpoints
- `/api/checkout` - Creates Stripe checkout sessions
- `/api/customer-portal` - Creates customer portal sessions
- `/api/webhooks/stripe` - Handles Stripe webhook events

### Hooks
- `useAuth` - Authentication state management
- `useStripe` - Stripe operations (checkout, portal)
- `useUsageTracker` - Track user usage and limits

## Deployment Notes

1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Update Stripe webhook endpoint to your production URL
3. Use production Stripe keys for live payments
4. Ensure all environment variables are set in your hosting platform

## Troubleshooting

### Common Issues

1. **Supabase client error**: Check that all Supabase environment variables are set correctly
2. **Stripe webhook failures**: Ensure webhook URL is accessible and secret is correct
3. **Authentication issues**: Verify Google OAuth is configured in Supabase

### Support

For issues with:
- Stripe: https://stripe.com/docs
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs