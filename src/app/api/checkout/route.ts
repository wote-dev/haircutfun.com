import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '../../../lib/stripe/service';
import { createClient } from '../../../lib/supabase/client';

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
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the origin for success/cancel URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    
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
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}