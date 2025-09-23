import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripeSubscription, updateSubscriptionFromStripe } from '@/lib/stripe/service';
import { stripe } from '@/lib/stripe/client';

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

    // If no subscription at all, nothing to refresh
    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: null,
        message: 'No subscription found for user'
      });
    }

    // If we don't have a Stripe subscription ID yet but do have a customer ID,
    // recover it by looking up the latest subscription for this customer in Stripe
    if (!subscription.stripe_subscription_id && subscription.stripe_customer_id) {
      try {
        const list = await stripe.subscriptions.list({
          customer: subscription.stripe_customer_id,
          status: 'all',
          limit: 1,
        });

        const latest = list.data[0];
        if (latest) {
          await updateSubscriptionFromStripe({
            userId,
            stripeSubscription: latest,
            customerId: subscription.stripe_customer_id,
          });

          const { data: updated, error: verifyError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (verifyError) {
            console.error('Error verifying updated subscription after recovery:', verifyError);
          }

          return NextResponse.json({
            success: true,
            subscription: updated || subscription,
            message: 'Subscription recovered from Stripe by customer ID',
          });
        }
      } catch (e) {
        console.error('Error recovering subscription by customer ID:', e);
        // fall through to default no-subscription-to-refresh response
      }

      return NextResponse.json({
        success: true,
        subscription,
        message: 'No Stripe subscription found for this customer',
      });
    }

    // If no subscription or no Stripe subscription ID and no customer ID, return current state
    if (!subscription.stripe_subscription_id) {
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