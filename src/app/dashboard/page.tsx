"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Check, Crown, Zap, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Component that handles search params
function DashboardContent() {
  const { user, subscription, usage, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const success = searchParams.get('success');
  const plan = searchParams.get('plan');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    if (success === 'true' && plan) {
      setShowSuccess(true);
      // Auto-hide success message after 10 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
        // Clean up URL parameters
        router.replace('/dashboard');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [success, plan, router]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const planType = subscription?.plan_type || 'free';
  const isPremiumUser = subscription?.status === 'active' && planType !== 'free';
  const remainingTries = usage?.plan_limit ? Math.max(0, usage.plan_limit - usage.generations_used) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-800">
                  🎉 Welcome to {plan === 'pro' ? 'Pro' : 'Premium'}!
                </h3>
                <p className="text-green-700">
                  Your subscription is now active. Start creating amazing haircuts!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canceled Message */}
      {canceled === 'true' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
          <div className="container mx-auto px-4 py-4">
            <div className="text-center">
              <p className="text-yellow-800">
                Payment was canceled. You can try again anytime from the pricing page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            {isPremiumUser 
              ? `You're on the ${planType.charAt(0).toUpperCase() + planType.slice(1)} plan`
              : 'You\'re on the free plan'
            }
          </p>
        </div>

        {/* Subscription Status Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className={`rounded-2xl p-6 ${
              isPremiumUser 
                ? 'bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20' 
                : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {isPremiumUser ? (
                    <Crown className="h-8 w-8 text-primary" />
                  ) : (
                    <Sparkles className="h-8 w-8 text-gray-500" />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {isPremiumUser ? `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan` : 'Free Plan'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isPremiumUser 
                        ? `Active until ${subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}`
                        : 'Limited features'
                      }
                    </p>
                  </div>
                </div>
                {!isPremiumUser && (
                  <Link
                    href="/pricing"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Upgrade
                  </Link>
                )}
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {isPremiumUser ? '∞' : remainingTries}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isPremiumUser ? 'Unlimited tries' : 'Remaining tries'}
                  </div>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {usage?.generations_used || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tries used this month
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-background border border-border rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/try-on"
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span className="font-medium">Try New Haircut</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                
                <Link
                  href="/gallery"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="font-medium text-foreground">Browse Gallery</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                
                {isPremiumUser && (
                  <button
                    onClick={() => {
                      // This would open customer portal
                      fetch('/api/customer-portal', { method: 'POST' })
                        .then(res => res.json())
                        .then(data => {
                          if (data.url) window.location.href = data.url;
                        });
                    }}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors w-full text-left"
                  >
                    <span className="font-medium text-foreground">Manage Subscription</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity or Upgrade Prompt */}
        {!isPremiumUser && remainingTries === 0 && (
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-dashed border-primary/20 rounded-2xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-6 flex items-center justify-center">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Ready for More?
              </h3>
              <p className="text-muted-foreground mb-6">
                You've used your free try! Upgrade to Pro or Premium to continue creating amazing haircuts.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
              >
                <span>View Plans</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Debug Section - Only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">🔧 Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">User Info:</h4>
                <pre className="bg-white p-3 rounded border text-xs overflow-auto">
                  {JSON.stringify({
                    id: user.id,
                    email: user.email,
                    created_at: user.created_at
                  }, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Subscription:</h4>
                <pre className="bg-white p-3 rounded border text-xs overflow-auto">
                  {JSON.stringify(subscription || 'No subscription', null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Usage Data:</h4>
                <pre className="bg-white p-3 rounded border text-xs overflow-auto">
                  {JSON.stringify(usage || 'No usage data', null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Computed Values:</h4>
                <pre className="bg-white p-3 rounded border text-xs overflow-auto">
                  {JSON.stringify({
                    isPremiumUser,
                    planType,
                    remainingTries,
                    hasSubscription: !!subscription,
                    subscriptionStatus: subscription?.status || 'none'
                  }, null, 2)}
                </pre>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-yellow-200">
              <Link
                href="/test-subscription"
                className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <span>🧪 Test Subscription Tools</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}