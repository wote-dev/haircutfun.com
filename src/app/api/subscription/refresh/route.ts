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
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      console.error('Refresh: Error fetching subscription:', subscriptionError);
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
        console.log('Refresh: Attempting recovery by stored customer ID', {
          customerId: subscription.stripe_customer_id,
        });
        const list = await stripe.subscriptions.list({
          customer: subscription.stripe_customer_id,
          status: 'all',
          limit: 10,
        });

        const latest = list.data?.[0];
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
            console.error('Refresh: Error verifying updated subscription after recovery:', verifyError);
          }

          return NextResponse.json({
            success: true,
            subscription: updated || subscription,
            message: 'Subscription recovered from Stripe by stored customer ID',
          });
        }

        console.warn('Refresh: No subscriptions returned for stored customer ID. Falling back to search by email...');

        // Fallback: search Stripe customers by email and scan their subscriptions
        if (user.email) {
          const customers = await stripe.customers.list({ email: user.email, limit: 10 });
          for (const c of customers.data) {
            try {
              const subList = await stripe.subscriptions.list({ customer: c.id, status: 'all', limit: 10 });
              if (subList.data && subList.data.length > 0) {
                const found = subList.data[0];
                console.log('Refresh: Found subscription via email-based customer search', { customerId: c.id, subscriptionId: found.id });
                await updateSubscriptionFromStripe({
                  userId,
                  stripeSubscription: found,
                  customerId: c.id,
                });

                const { data: updated, error: verifyError2 } = await supabase
                  .from('subscriptions')
                  .select('*')
                  .eq('user_id', userId)
                  .single();

                if (verifyError2) {
                  console.error('Refresh: Error verifying updated subscription after email search:', verifyError2);
                }

                return NextResponse.json({
                  success: true,
                  subscription: updated || subscription,
                  message: 'Subscription recovered via email-based customer search',
                });
              }
            } catch (inner) {
              console.warn('Refresh: Failed listing subscriptions for candidate customer', { candidateCustomerId: c.id, error: (inner as Error).message });
            }
          }
        } else {
          console.warn('Refresh: Cannot search by email because user has no email');
        }
      } catch (e) {
        console.error('Refresh: Error during recovery by customer ID:', e);
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
      
      // Update subscription in database with latest Stripe data, including plan_type
      await updateSubscriptionFromStripe({
        userId,
        stripeSubscription,
        customerId: subscription.stripe_customer_id || (stripeSubscription.customer as string),
      });

      const { data: updated, error: updateError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscription.id)
        .single();

      if (updateError) {
        console.error('Refresh: Error verifying updated subscription:', updateError);
        return NextResponse.json(
          { error: 'Failed to verify updated subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        subscription: updated,
        message: 'Subscription refreshed from Stripe'
      });

    } catch (stripeError) {
      console.error('Refresh: Error fetching from Stripe:', stripeError);
      
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
          console.error('Refresh: Error updating canceled subscription:', updateError);
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