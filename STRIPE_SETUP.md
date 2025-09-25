# Stripe Integration Setup Guide

This guide will help you set up Stripe one-time payments for your Next.js application.

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
6. Select these events for one-time payments:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
7. Copy the webhook secret to your `.env.local` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. App Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

The application uses a simplified freemium model with one-time payments. The necessary tables are already created through migrations:

- `user_profiles` - User profile information with `has_pro_access` boolean
- `user_usage` - Tracks daily usage limits for free users
- `payments` - Records one-time payment transactions

No additional database setup is required as migrations handle the schema.

## Stripe Products Setup

### For One-Time Payments (Current Implementation)

The application uses dynamic pricing for one-time payments. No pre-configured products are needed in Stripe dashboard as the checkout session creates the product dynamically:

- **Pro Access**: $3.99 one-time payment for unlimited generations

### For Subscription Model (Future Implementation)

If you want to switch to a subscription model, you'll need to create products in your Stripe Dashboard:

#### Step 1: Create Products in Stripe Dashboard

1. Go to your Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Products** in the left sidebar
3. Click **"Add product"**

#### Recommended Product Structure:

**Product 1: HaircutFun Pro Monthly**
- Product name: `HaircutFun Pro Monthly`
- Description: `Monthly subscription for unlimited AI haircut generations`
- Pricing model: `Recurring`
- Price: `$9.99`
- Billing period: `Monthly`
- Product ID will be generated (e.g., `prod_xxxxx`)
- Price ID will be generated (e.g., `price_xxxxx`)

**Product 2: HaircutFun Pro Yearly**
- Product name: `HaircutFun Pro Yearly`
- Description: `Yearly subscription for unlimited AI haircut generations (2 months free)`
- Pricing model: `Recurring`
- Price: `$99.99`
- Billing period: `Yearly`
- Product ID will be generated (e.g., `prod_yyyyy`)
- Price ID will be generated (e.g., `price_yyyyy`)

#### Step 2: Update Environment Variables

Add the price IDs to your `.env.local` file:

```env
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_yyyyy
```

#### Step 3: Update Code for Subscriptions

You'll need to modify the following files:
- `src/lib/stripe/client.ts` - Update price ID functions
- `src/lib/stripe/service.ts` - Change from payment to subscription mode
- `src/app/api/checkout/route.ts` - Handle subscription creation
- `src/app/api/webhooks/stripe/route.ts` - Handle subscription events

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
- **Pricing Page**: `/pricing` - Displays one-time payment option
- **PaymentGate**: Blocks premium features for free users
- **UpgradePrompt**: Modal prompts for one-time upgrade

### API Endpoints
- `/api/checkout` - Creates Stripe checkout sessions for one-time payments
- `/api/webhooks/stripe` - Handles Stripe webhook events for payments

### Hooks
- `useAuth` - Authentication state management
- `useStripe` - Stripe operations (checkout)
- `useFreemiumAccess` - Track user access and freemium limits

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