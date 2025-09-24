import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/service-client';
import { verifyWebhookSignature } from '@/lib/stripe/service';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Webhook event received:', event.type);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.user_id;
  
  if (!userId) {
    console.error('No user_id in payment intent metadata');
    return;
  }

  console.log(`Processing successful payment for user: ${userId}`);

  const supabase = createServiceClient();

  try {
    // Use type assertion to access payments table (not in current TypeScript definitions)
    const { error: paymentError } = await (supabase as any)
      .from('payments')
      .insert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded',
      });

    if (paymentError && paymentError.code !== '23505') { // Ignore duplicate key errors
      console.error('Error recording payment:', paymentError);
      // Continue anyway to grant access
    }

    // Grant pro access to the user - use type assertion since has_pro_access may not be in current types
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ 
        has_pro_access: true,
        updated_at: new Date().toISOString()
      } as any)
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      return;
    }

    console.log(`Successfully granted pro access to user: ${userId}`);
  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.user_id;
  
  if (!userId) {
    console.error('No user_id in payment intent metadata');
    return;
  }

  console.log(`Processing failed payment for user: ${userId}`);

  const supabase = createServiceClient();

  try {
    // Record the failed payment using type assertion
    const { error: paymentError } = await (supabase as any)
      .from('payments')
      .insert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'failed',
      });

    if (paymentError && paymentError.code !== '23505') { // Ignore duplicate key errors
      console.error('Error recording failed payment:', paymentError);
      return;
    }

    console.log(`Recorded failed payment for user: ${userId}`);
  } catch (error) {
    console.error('Error processing failed payment:', error);
  }
}