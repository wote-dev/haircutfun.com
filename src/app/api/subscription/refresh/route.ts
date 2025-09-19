import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripeSubscription } from '@/lib/stripe/service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get current subscription from database
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    // If no subscription or no Stripe subscription ID, return current state
    if (!subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json({
        success: true,
        subscription: subscription || null,
        message: 'No Stripe subscription to refresh'
      });
    }

    try {
      // Fetch latest data from Stripe
      const stripeSubscription = await getStripeSubscription(subscription.stripe_subscription_id);
      
      // Update subscription in database with latest Stripe data
      const updatedSubscription = {
        status: stripeSubscription.status as 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing',
        current_period_start: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error: updateError } = await supabase
        .from('subscriptions')
        .update(updatedSubscription)
        .eq('id', subscription.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        subscription: updated,
        message: 'Subscription refreshed from Stripe'
      });

    } catch (stripeError) {
      console.error('Error fetching from Stripe:', stripeError);
      
      // If Stripe subscription doesn't exist, mark as canceled
      if (stripeError instanceof Error && stripeError.message.includes('No such subscription')) {
        const { data: updated, error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating canceled subscription:', updateError);
        }

        return NextResponse.json({
          success: true,
          subscription: updated || subscription,
          message: 'Subscription marked as canceled (not found in Stripe)'
        });
      }

      return NextResponse.json(
        { error: 'Failed to refresh from Stripe' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Subscription refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}