import { NextRequest, NextResponse } from 'next/server';
import { createCustomerPortalSession } from '../../../lib/stripe/service';
import { createClient } from '../../../lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's subscription to find customer ID
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Get the origin for return URL
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const returnUrl = `${origin}/dashboard`;

    // Create customer portal session
    const session = await createCustomerPortalSession({
      customerId: subscription.stripe_customer_id,
      returnUrl,
    });

    return NextResponse.json({ 
      url: session.url 
    });
  } catch (error) {
    console.error('Customer portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    );
  }
}