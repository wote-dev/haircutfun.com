#!/usr/bin/env node

/**
 * Script to create test products and prices in Stripe
 * Run this script to set up your test environment with the correct price IDs
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createTestProducts() {
  try {
    console.log('🚀 Creating Stripe test products...');

    // Create Pro Plan Product
    const proProduct = await stripe.products.create({
      name: 'Pro Plan',
      description: '25 virtual haircut tries per month plus premium features',
      metadata: {
        plan_type: 'pro'
      }
    });

    // Create Pro Plan Price
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 499, // $4.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_type: 'pro'
      }
    });

    // Create Premium Plan Product
    const premiumProduct = await stripe.products.create({
      name: 'Premium Plan',
      description: '75 virtual haircut tries per month plus all premium features',
      metadata: {
        plan_type: 'premium'
      }
    });

    // Create Premium Plan Price
    const premiumPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 1299, // $12.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_type: 'premium'
      }
    });

    console.log('✅ Products created successfully!');
    console.log('\n📋 Update your .env.local file with these price IDs:');
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`STRIPE_PREMIUM_PRICE_ID=${premiumPrice.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=${premiumPrice.id}`);

    console.log('\n🔗 Product Details:');
    console.log(`Pro Product ID: ${proProduct.id}`);
    console.log(`Pro Price ID: ${proPrice.id}`);
    console.log(`Premium Product ID: ${premiumProduct.id}`);
    console.log(`Premium Price ID: ${premiumPrice.id}`);

  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n💡 Make sure your STRIPE_SECRET_KEY is set correctly in .env.local');
      console.log('   It should start with "sk_test_" for test mode');
    }
  }
}

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is not set');
  console.log('💡 Make sure to run: source .env.local or set the environment variable');
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.warn('⚠️  Warning: This doesn\'t appear to be a test key. Make sure you\'re using test mode!');
}

createTestProducts();