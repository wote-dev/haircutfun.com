"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Check, Crown, Zap, ArrowRight, Sparkles, TrendingUp, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThreeDotLoader } from '@/components/ui/three-dot-loader';

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
          <ThreeDotLoader size="lg" className="mb-4" />
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
  
  // Use correct plan limits based on subscription type, not database plan_limit
  const planLimits = {
    free: 1,
    pro: 25,
    premium: 75
  };
  
  const currentPlanLimit = planLimits[planType as keyof typeof planLimits] || 1;
  const remainingTries = usage ? Math.max(0, currentPlanLimit - usage.generations_used) : currentPlanLimit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 pt-28 pb-8">
        {/* Success Message */}
        {showSuccess && (
          <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-green-800">
                    🎉 Welcome to {plan === 'pro' ? 'Pro' : 'Premium'}!
                  </h3>
                  <p className="text-green-700 mt-1">
                    Your subscription is now active. Start creating amazing haircuts!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Canceled Message */}
        {canceled === 'true' && (
          <Card className="mb-6 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-yellow-800">
                  Payment was canceled. You can try again anytime from the pricing page.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant={isPremiumUser ? "default" : "secondary"} className="text-sm">
              {isPremiumUser 
                ? `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`
                : 'Free Plan'
              }
            </Badge>
            {isPremiumUser && subscription?.current_period_end && (
              <span className="text-muted-foreground text-sm">
                • Active until {new Date(subscription.current_period_end).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Subscription Status Card */}
          <div className="lg:col-span-2">
            <Card className={isPremiumUser ? 'border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isPremiumUser ? (
                      <Crown className="h-8 w-8 text-primary" />
                    ) : (
                      <Sparkles className="h-8 w-8 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-xl">
                        {isPremiumUser ? `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan` : 'Free Plan'}
                      </CardTitle>
                      <CardDescription>
                        {isPremiumUser 
                          ? 'Enjoy unlimited access to all features'
                          : 'Limited features available'
                        }
                      </CardDescription>
                    </div>
                  </div>
                  {!isPremiumUser && (
                    <Button asChild>
                      <Link href="/pricing">
                        Upgrade
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Usage Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-background/50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {isPremiumUser ? '∞' : remainingTries}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {isPremiumUser ? 'Unlimited tries' : 'Remaining tries'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-accent" />
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {usage?.generations_used || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Tries used this month
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Get started with your haircut journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-between h-12" size="lg">
                  <Link href="/try-on">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span className="font-medium">Try New Haircut</span>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-between h-12" size="lg">
                  <Link href="/gallery">
                    <span className="font-medium">Browse Gallery</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                
                {isPremiumUser && (
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                    size="lg"
                    onClick={() => {
                      // This would open customer portal
                      fetch('/api/customer-portal', { method: 'POST' })
                        .then(res => res.json())
                        .then(data => {
                          if (data.url) window.location.href = data.url;
                        });
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4" />
                      <span className="font-medium">Manage Subscription</span>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upgrade Prompt */}
        {!isPremiumUser && remainingTries === 0 && (
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-accent mx-auto mb-6 flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Ready for More?
                </h3>
                <p className="text-muted-foreground mb-6">
                  You've used your free try! Upgrade to Pro or Premium to continue creating amazing haircuts.
                </p>
                <Button asChild size="lg" className="h-12">
                  <Link href="/pricing">
                    <span>View Plans</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Section - Only in development */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-8 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                🔧 Debug Information
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Development environment debugging data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-yellow-800">User Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify({
                        id: user.id,
                        email: user.email,
                        created_at: user.created_at
                      }, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-yellow-800">Subscription</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(subscription || 'No subscription', null, 2)}
                    </pre>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-yellow-800">Usage Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(usage || 'No usage data', null, 2)}
                    </pre>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-yellow-800">Computed Values</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify({
                        isPremiumUser,
                        planType,
                        remainingTries,
                        hasSubscription: !!subscription,
                        subscriptionStatus: subscription?.status || 'none'
                      }, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6 pt-4 border-t border-yellow-200">
                <Button asChild variant="outline" className="bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-600">
                  <Link href="/test-subscription">
                    <span>🧪 Test Subscription Tools</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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
          <ThreeDotLoader size="lg" className="mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}