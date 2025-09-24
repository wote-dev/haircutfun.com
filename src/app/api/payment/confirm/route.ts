import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { payment_intent_id } = await request.json();

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Verify the payment belongs to this user
    if (paymentIntent.metadata.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 403 }
      );
    }

    // Record the payment in database
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        stripe_payment_intent_id: payment_intent_id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded',
      });

    if (paymentError) {
      console.error('Error recording payment:', paymentError);
      // Continue anyway - we'll grant access even if recording fails
    }

    // Grant pro access
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        has_pro_access: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error granting pro access:', updateError);
      return NextResponse.json(
        { error: 'Failed to grant pro access' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pro access granted successfully',
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}