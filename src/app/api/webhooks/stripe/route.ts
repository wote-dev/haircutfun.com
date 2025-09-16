import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature, updateSubscriptionFromStripe } from '../../../../lib/stripe/service';
import { createClient } from '../../../../lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature);

    console.log('Stripe webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        
        // Find user by customer ID
        const supabase = createClient();
        const { data: userSubscription } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!userSubscription) {
          console.error('User not found for customer:', customerId);
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        await updateSubscriptionFromStripe({
          userId: userSubscription.user_id,
          stripeSubscription: subscription,
          customerId,
        });

        console.log('Subscription updated for user:', userSubscription.user_id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        
        // Find user by customer ID
        const supabase = createClient();
        const { data: userSubscription } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!userSubscription) {
          console.error('User not found for customer:', customerId);
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Update subscription to canceled and downgrade to free
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan_type: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userSubscription.user_id);

        // Update usage limits to free tier
        const currentMonth = new Date().toISOString().slice(0, 7);
        await supabase
          .from('usage_tracking')
          .upsert({
            user_id: userSubscription.user_id,
            month_year: currentMonth,
            plan_limit: 2, // Free tier limit
            generations_used: 0,
          }, {
            onConflict: 'user_id,month_year'
          });

        console.log('Subscription canceled for user:', userSubscription.user_id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Payment succeeded for invoice:', invoice.id);
        // Additional logic for successful payments if needed
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;
        
        // Find user by customer ID
        const supabase = createClient();
        const { data: userSubscription } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userSubscription) {
          // Update subscription status to past_due
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userSubscription.user_id);

          console.log('Payment failed for user:', userSubscription.user_id);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}