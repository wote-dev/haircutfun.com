import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user already has pro access
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('has_pro_access')
      .eq('user_id', user.id)
      .single();

    if (profile?.has_pro_access) {
      return NextResponse.json(
        { error: 'User already has pro access' },
        { status: 400 }
      );
    }

    // Create payment intent for $4.99
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 499, // $4.99 in cents
      currency: 'usd',
      metadata: {
        user_id: user.id,
        product: 'pro_unlock',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}