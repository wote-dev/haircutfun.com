"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useFeatureAccess } from '@/hooks/useSubscriptionStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionGuardProps {
  children: ReactNode;
  requiredPlan: 'free' | 'pro' | 'premium';
  fallback?: ReactNode;
  redirectTo?: string;
  showUpgrade?: boolean;
  feature?: string;
}

/**
 * Component that guards content based on subscription status
 */
export function SubscriptionGuard({
  children,
  requiredPlan,
  fallback,
  redirectTo,
  showUpgrade = true,
  feature
}: SubscriptionGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { canAccessFeature, planType, isActive, hasProAccess, hasPremiumAccess } = useFeatureAccess();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle redirect if specified
  useEffect(() => {
    if (mounted && !authLoading && user && !canAccessFeature(requiredPlan) && redirectTo) {
      router.push(redirectTo);
    }
  }, [mounted, authLoading, user, canAccessFeature, requiredPlan, redirectTo, router]);

  // Show loading state
  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // User not logged in
  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle>Sign In Required</CardTitle>
          <CardDescription>
            You need to sign in to access {feature || 'this feature'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/auth/signin">
            <Button className="w-full">
              Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Check if user has required access
  const hasAccess = canAccessFeature(requiredPlan);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (showUpgrade) {
    return <UpgradePrompt requiredPlan={requiredPlan} currentPlan={planType} feature={feature} />;
  }

  // No access and no upgrade prompt
  return null;
}

interface UpgradePromptProps {
  requiredPlan: 'free' | 'pro' | 'premium';
  currentPlan: 'free' | 'pro' | 'premium';
  feature?: string;
}

function UpgradePrompt({ requiredPlan, currentPlan, feature }: UpgradePromptProps) {
  const getUpgradeMessage = () => {
    switch (requiredPlan) {
      case 'pro':
        return {
          title: 'Pro Plan Required',
          description: `${feature || 'This feature'} requires a Pro subscription.`,
          icon: <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-500" />,
          benefits: [
            '25 virtual haircut tries per month',
            'Access to ALL premium hairstyles',
            'Priority processing speed',
            'Save & compare results'
          ]
        };
      case 'premium':
        return {
          title: 'Premium Plan Required',
          description: `${feature || 'This feature'} requires a Premium subscription.`,
          icon: <Crown className="h-12 w-12 mx-auto mb-4 text-purple-500" />,
          benefits: [
            '75 virtual haircut tries per month',
            'Everything in Pro plan',
            'Personalized style recommendations',
            'Early access to new features',
            'White-glove customer support'
          ]
        };
      default:
        return {
          title: 'Subscription Required',
          description: `${feature || 'This feature'} requires a subscription.`,
          icon: <AlertCircle className="h-12 w-12 mx-auto mb-4 text-blue-500" />,
          benefits: []
        };
    }
  };

  const { title, description, icon, benefits } = getUpgradeMessage();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        {icon}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {benefits.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">What you'll get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <Link href="/pricing">
            <Button className="w-full">
              Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
            </Button>
          </Link>
          
          {currentPlan !== 'free' && (
            <Link href="/account">
              <Button variant="outline" className="w-full">
                Manage Subscription
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Hook version of SubscriptionGuard for conditional rendering
 */
export function useSubscriptionGuard(requiredPlan: 'free' | 'pro' | 'premium') {
  const { user, loading } = useAuth();
  const { canAccessFeature } = useFeatureAccess();

  return {
    hasAccess: user ? canAccessFeature(requiredPlan) : false,
    isLoading: loading,
    isAuthenticated: !!user
  };
}