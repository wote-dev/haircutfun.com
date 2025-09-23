#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testPrices() {
  try {
    console.log('🔍 Testing Stripe Price IDs...\n');
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment');
      return;
    }
    
    if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      console.warn('⚠️  Warning: This doesn\'t appear to be a test key!');
    }
    
    console.log('Testing Pro Price ID:', process.env.STRIPE_PRO_PRICE_ID);
    try {
      const proPrice = await stripe.prices.retrieve(process.env.STRIPE_PRO_PRICE_ID);
      console.log('✅ Pro price exists:', proPrice.id, '- Amount: $' + (proPrice.unit_amount/100), proPrice.currency.toUpperCase());
      console.log('   Product:', proPrice.product);
      console.log('   Recurring:', proPrice.recurring?.interval);
    } catch (error) {
      console.error('❌ Pro price error:', error.message);
      if (error.code === 'resource_missing') {
        console.log('   💡 This price ID does not exist in your Stripe account');
      }
    }
    
    console.log('\nTesting Premium Price ID:', process.env.STRIPE_PREMIUM_PRICE_ID);
    try {
      const premiumPrice = await stripe.prices.retrieve(process.env.STRIPE_PREMIUM_PRICE_ID);
      console.log('✅ Premium price exists:', premiumPrice.id, '- Amount: $' + (premiumPrice.unit_amount/100), premiumPrice.currency.toUpperCase());
      console.log('   Product:', premiumPrice.product);
      console.log('   Recurring:', premiumPrice.recurring?.interval);
    } catch (error) {
      console.error('❌ Premium price error:', error.message);
      if (error.code === 'resource_missing') {
        console.log('   💡 This price ID does not exist in your Stripe account');
      }
    }
    
    console.log('\n🔗 If prices don\'t exist, run: node create-test-products.js');
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

testPrices();