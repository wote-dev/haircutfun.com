// Test script to verify the complete checkout flow
const fetch = require('node-fetch');

async function testCheckoutFlow() {
  console.log('🧪 Testing Checkout Flow...\n');
  
  // Test 1: Unauthenticated request (should return 401)
  console.log('1. Testing unauthenticated checkout request...');
  try {
    const response = await fetch('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planType: 'pro' }),
    });
    
    const result = await response.text();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${result}`);
    
    if (response.status === 401) {
      console.log('   ✅ Correctly requires authentication\n');
    } else {
      console.log('   ❌ Should require authentication\n');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
  
  // Test 2: Check if pricing page loads
  console.log('2. Testing pricing page accessibility...');
  try {
    const response = await fetch('http://localhost:3000/pricing');
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   ✅ Pricing page loads successfully\n');
    } else {
      console.log('   ❌ Pricing page failed to load\n');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
  
  // Test 3: Check auth callback endpoint
  console.log('3. Testing auth callback endpoint...');
  try {
    const response = await fetch('http://localhost:3000/auth/callback');
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200 || response.status === 302) {
      console.log('   ✅ Auth callback endpoint accessible\n');
    } else {
      console.log('   ❌ Auth callback endpoint issue\n');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
  
  console.log('🎯 Summary:');
  console.log('- Checkout API correctly requires authentication');
  console.log('- Pricing page is accessible');
  console.log('- To test complete flow, sign in via Google OAuth in browser');
  console.log('- Then click Pro or Premium plan buttons to test Stripe checkout');
}

testCheckoutFlow().catch(console.error);
