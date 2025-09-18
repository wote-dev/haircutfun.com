"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DebugDbPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testDatabaseQueries = async () => {
    if (!user) {
      setResults({ error: 'No user logged in' });
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const testResults: any = {};

    try {
      // Test 1: Basic connection
      console.log('Testing basic connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      testResults.connectionTest = { data: connectionTest, error: connectionError };

      // Test 2: User profile
      console.log('Testing user profile query...');
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      testResults.profileQuery = { data: profileData, error: profileError };

      // Test 3: Subscription
      console.log('Testing subscription query...');
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      testResults.subscriptionQuery = { data: subscriptionData, error: subscriptionError };

      // Test 4: Usage tracking
      console.log('Testing usage tracking query...');
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .maybeSingle();
      
      testResults.usageQuery = { data: usageData, error: usageError, currentMonth };

      // Test 5: Create missing records if needed
      console.log('Testing record creation...');
      
      // Create profile if missing
      if (!profileData && !profileError) {
        const { data: newProfile, error: createProfileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            email: user.email || null,
          })
          .select()
          .single();
        
        testResults.profileCreation = { data: newProfile, error: createProfileError };
      }

      // Create subscription if missing
      if (!subscriptionData && !subscriptionError) {
        const { data: newSubscription, error: createSubscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_type: 'free',
            status: 'active',
          })
          .select()
          .single();
        
        testResults.subscriptionCreation = { data: newSubscription, error: createSubscriptionError };
      }

      // Create usage if missing
      if (!usageData && !usageError) {
        const { data: newUsage, error: createUsageError } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: user.id,
            month_year: currentMonth,
            generations_used: 0,
            plan_limit: 2, // Free plan default
          })
          .select()
          .single();
        
        testResults.usageCreation = { data: newUsage, error: createUsageError };
      }

      setResults(testResults);
    } catch (error) {
      console.error('Database test error:', error);
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      testDatabaseQueries();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to test database</h1>
          <a href="/" className="text-primary hover:underline">Go back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Debug Tool</h1>
        
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify({
              id: user.id,
              email: user.email,
              created_at: user.created_at,
              user_metadata: user.user_metadata,
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Database Test Results</h2>
            <button
              onClick={testDatabaseQueries}
              disabled={loading}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Retest Database'}
            </button>
          </div>
          
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Running database tests...</span>
            </div>
          ) : (
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          )}
        </div>

        <div className="text-center">
          <a href="/dashboard" className="text-primary hover:underline mr-4">← Back to Dashboard</a>
          <a href="/" className="text-primary hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}