import { NextRequest, NextResponse } from 'next/server';
import { createCustomerPortalSession } from '../../../lib/stripe/service';
import { createClient } from '../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Customer portal API called');
    
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('👤 User auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message 
    });

    if (authError || !user) {
      console.log('❌ Authentication failed');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's subscription to find customer ID
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, status, plan_type')
      .eq('user_id', user.id)
      .single();

    console.log('💳 Subscription check:', { 
      subscription, 
      subError: subError?.message,
      hasCustomerId: !!subscription?.stripe_customer_id
    });

    // Check if user has an active paid subscription
    const hasActivePaidSubscription = subscription?.status === 'active' && 
                                     subscription?.plan_type !== 'free' && 
                                     subscription?.stripe_customer_id;

    if (subError || !hasActivePaidSubscription) {
      console.log('❌ No active paid subscription found');
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Get the origin for return URL
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const returnUrl = `${origin}/dashboard`;

    console.log('🌐 Creating customer portal session:', {
      customerId: subscription.stripe_customer_id,
      returnUrl
    });

    // Create customer portal session
    const session = await createCustomerPortalSession({
      customerId: subscription.stripe_customer_id,
      returnUrl,
    });

    console.log('✅ Customer portal session created:', { url: session.url });

    return NextResponse.json({ 
      url: session.url 
    });
  } catch (error) {
    console.error('❌ Customer portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    );
  }
}