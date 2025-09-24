"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useFreemiumAccess } from '@/hooks/useFreemiumAccess';
import { Check, Crown, Zap, ArrowRight, Sparkles, TrendingUp, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThreeDotLoader } from '@/components/ui/three-dot-loader';

// Component that handles search params
function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasProAccess, freeTriesUsed, canGenerate } = useFreemiumAccess();
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

  // After successful checkout, proactively refresh user data
  useEffect(() => {
    const doRefresh = async () => {
      if (success === 'true' && user?.id) {
        try {
          // Refresh user profile data
          const resp = await fetch('/api/user/profile', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const json = await resp.json();
          console.log('🔄 Post-checkout profile refresh result:', json);
        } catch (e) {
          console.error('Failed to refresh profile after checkout:', e);
        }
      }
    };
    doRefresh();
  }, [success, user?.id]);

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

  const isPremiumUser = hasProAccess;
  
  // Debug: Log freemium data
  console.log('Dashboard freemium data:', {
    hasProAccess,
    freeTriesUsed,
    canGenerate,
    user_id: user?.id
  });
  
  const remainingTries = hasProAccess ? '∞' : (freeTriesUsed === 0 ? 1 : 0);

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
                    Your Pro access is now active. Start creating amazing haircuts!
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
              {isPremiumUser ? 'Pro Plan' : 'Free Plan'}
            </Badge>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pro Status Card */}
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
                        {isPremiumUser ? 'Pro Plan' : 'Free Plan'}
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
                            {freeTriesUsed}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Free tries used
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
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Tips to get best results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Use a clear, well-lit photo of your face</li>
                  <li>• Try different angles for better accuracy</li>
                  <li>• Experiment with multiple styles</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Premium Benefits */}
        {!isPremiumUser && (
          <Card className="bg-background/50">
            <CardHeader>
              <CardTitle>Why go Premium?</CardTitle>
              <CardDescription>Unlock advanced features and more generations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">More Tries</h4>
                  <p className="text-sm text-muted-foreground">Get 25-75 tries per month to find your perfect look.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Premium Styles</h4>
                  <p className="text-sm text-muted-foreground">Access exclusive, trending haircut styles updated weekly.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Priority Processing</h4>
                  <p className="text-sm text-muted-foreground">Faster results and priority support for subscribers.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function DashboardPageInner() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ThreeDotLoader size="lg" className="mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

export default function DashboardPage() {
  return <DashboardPageInner />;
}