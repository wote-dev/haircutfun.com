import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '../../../lib/stripe/service';
import { createClient } from '../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json();

    if (!planType || planType !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid plan type. Only "pro" is supported.' },
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

    // Check if user already has pro access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('has_pro_access')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error checking existing pro access:', profileError);
      return NextResponse.json(
        { error: 'Failed to check pro access status' },
        { status: 500 }
      );
    }

    if (profile?.has_pro_access) {
      return NextResponse.json(
        { 
          error: 'You already have Pro access',
          code: 'EXISTING_PRO_ACCESS'
        },
        { status: 409 }
      );
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