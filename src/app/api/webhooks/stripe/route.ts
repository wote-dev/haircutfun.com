import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature, updateSubscriptionFromStripe } from '../../../../lib/stripe/service';
import { createServiceClient } from '../../../../lib/supabase/service-client';
import { stripe } from '../../../../lib/stripe/client';
import Stripe from 'stripe';

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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId = session.metadata?.userId;
        
        console.log('🎉 Checkout session completed:', {
          sessionId: session.id,
          customerId,
          userId,
          planType: session.metadata?.planType,
          subscriptionId: session.subscription
        });
        
        if (!userId) {
          console.error('❌ No userId found in session metadata');
          break;
        }

        // Get the subscription from the session
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          console.log('📋 Retrieved subscription details:', {
             subscriptionId: subscription.id,
             status: subscription.status,
             priceId: subscription.items.data[0]?.price?.id,
             currentPeriodStart: (subscription as any).current_period_start,
             currentPeriodEnd: (subscription as any).current_period_end
           });
          
          const service = createServiceClient();
          await updateSubscriptionFromStripe({
            userId,
            stripeSubscription: subscription,
            customerId,
            planTypeOverride: (session.metadata?.planType === 'pro' || session.metadata?.planType === 'premium') ? session.metadata?.planType : undefined,
          });

          console.log('✅ Subscription created/updated for user:', userId, 'with plan:', session.metadata?.planType);
          
          // Verify the subscription was saved correctly
          const { data: savedSubscription, error } = await service
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (error) {
            console.error('❌ Error verifying saved subscription:', error);
          } else if (savedSubscription) {
            console.log('✅ Verified saved subscription:', {
              userId: savedSubscription.user_id,
              status: savedSubscription.status,
              planType: savedSubscription.plan_type,
              stripeSubscriptionId: savedSubscription.stripe_subscription_id
            });
          } else {
            console.warn('⚠️ No subscription row found after update');
          }
        } else {
          console.error('❌ No subscription found in completed session');
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by customer ID (service client to bypass RLS)
        const service = createServiceClient();
        const { data: userSubscription } = await service
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
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by customer ID
        const service = createServiceClient();
        const { data: userSubscription } = await service
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
        await service
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan_type: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userSubscription.user_id);

        // Update usage limits to free tier
        const currentMonth = new Date().toISOString().slice(0, 7);
        await service
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
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for invoice:', invoice.id);
        // Additional logic for successful payments if needed
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        // Find user by customer ID
        const service = createServiceClient();
        const { data: userSubscription } = await service
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userSubscription) {
          // Update subscription status to past_due
          await service
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