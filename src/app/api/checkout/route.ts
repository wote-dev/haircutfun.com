import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '../../../lib/stripe/service';
import { createClient } from '../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json();

    if (!planType || !['pro', 'premium'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user already has an active subscription
    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      console.error('Error checking existing subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to check subscription status' },
        { status: 500 }
      );
    }

    if (existingSubscription) {
      if (existingSubscription.plan_type === planType) {
        return NextResponse.json(
          { 
            error: 'You already have an active subscription to this plan',
            code: 'EXISTING_SUBSCRIPTION_SAME_PLAN'
          },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { 
            error: 'You already have an active subscription. Please manage your subscription to change plans.',
            code: 'EXISTING_SUBSCRIPTION_DIFFERENT_PLAN'
          },
          { status: 409 }
        );
      }
    }

    // Get the origin for success/cancel URLs (port-aware)
    const { origin } = new URL(request.url);
    
    const successUrl = `${origin}/dashboard?success=true&plan=${planType}`;
    const cancelUrl = `${origin}/pricing?canceled=true`;

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.id,
      planType,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}