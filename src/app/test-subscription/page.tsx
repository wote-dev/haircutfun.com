"use client";

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';

export default function TestSubscriptionPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const createTestSubscription = async (planType: 'pro' | 'premium') => {
    if (!user) {
      setResult('❌ No user logged in');
      return;
    }

    setLoading(true);
    setResult('Creating test subscription...');

    try {
      const supabase = createClient();
      
      // Create or update subscription
      const subscriptionData = {
        user_id: user.id,
        stripe_customer_id: 'test_customer_' + Date.now(),
        stripe_subscription_id: 'test_sub_' + Date.now(),
        status: 'active' as const,
        plan_type: planType,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        setResult(`❌ Error creating subscription: ${error.message}`);
        return;
      }

      // Update usage limits
      const limits = {
        pro: 25,
        premium: 75,
      };

      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const { error: usageError } = await supabase
        .from('usage_tracking')
        .upsert({
          user_id: user.id,
          month_year: currentMonth,
          plan_limit: limits[planType],
          generations_used: 0,
        }, {
          onConflict: 'user_id,month_year'
        });

      if (usageError) {
        setResult(`⚠️ Subscription created but usage update failed: ${usageError.message}`);
        return;
      }

      setResult(`✅ Test ${planType} subscription created successfully!\n\nSubscription ID: ${data.id}\nStatus: ${data.status}\nPlan: ${data.plan_type}\n\nNow try using the haircut generator to test if pro features are unlocked.`);
      
      // Refresh the page after 3 seconds to update auth context
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      setResult(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentSubscription = async () => {
    if (!user) {
      setResult('❌ No user logged in');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        setResult(`❌ Error checking subscription: ${error.message}`);
        return;
      }

      if (!subscription) {
        setResult('ℹ️ No subscription found for this user');
        return;
      }

      setResult(`📋 Current subscription:\n\nID: ${subscription.id}\nStatus: ${subscription.status}\nPlan: ${subscription.plan_type}\nStripe Customer ID: ${subscription.stripe_customer_id}\nStripe Subscription ID: ${subscription.stripe_subscription_id}\nCreated: ${subscription.created_at}\nUpdated: ${subscription.updated_at}\nPeriod: ${subscription.current_period_start} to ${subscription.current_period_end}`);

    } catch (error) {
      setResult(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscription = async () => {
    if (!user) {
      setResult('❌ No user logged in');
      return;
    }

    if (!confirm('Are you sure you want to delete the test subscription?')) {
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        setResult(`❌ Error deleting subscription: ${error.message}`);
        return;
      }

      setResult('✅ Subscription deleted successfully!');
      
      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      setResult(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to test subscriptions</h1>
          <a href="/" className="text-primary hover:underline">Go back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Subscription Testing Utility</h1>
        
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => createTestSubscription('pro')}
                disabled={loading}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                Create Test Pro Subscription
              </button>
              <button
                onClick={() => createTestSubscription('premium')}
                disabled={loading}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/90 disabled:opacity-50"
              >
                Create Test Premium Subscription
              </button>
              <button
                onClick={checkCurrentSubscription}
                disabled={loading}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 disabled:opacity-50"
              >
                Check Current Subscription
              </button>
              <button
                onClick={deleteSubscription}
                disabled={loading}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 disabled:opacity-50"
              >
                Delete Subscription
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto">
              {result || 'No action performed yet. Click a button above to test subscription functionality.'}
            </pre>
          )}
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-primary hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}