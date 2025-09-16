"use client";

import Link from "next/link";
import { useState } from "react";
import { useUsageTracker } from "@/hooks/useUsageTracker";
import { useAuth } from "@/components/providers/AuthProvider";
import { useStripe } from "@/hooks/useStripe";
import { SignInButton } from "@/components/auth/SignInButton";

interface UpgradePromptProps {
  trigger: 'limit_reached' | 'premium_feature' | 'manual';
  title?: string;
  description?: string;
  compact?: boolean;
  onDismiss?: () => void;
}

export function UpgradePrompt({ 
  trigger, 
  title, 
  description, 
  compact = false, 
  onDismiss 
}: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();
  const { hasPremium, remainingTries } = useUsageTracker();
  const { createCheckoutSession, isLoading } = useStripe();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Don't show if user already has premium
  if (hasPremium || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleUpgrade = async (planType: 'pro' | 'premium') => {
    if (!user) return;
    
    setLoadingPlan(planType);
    await createCheckoutSession(planType);
    setLoadingPlan(null);
  };

  // Default content based on trigger
  const getContent = () => {
    switch (trigger) {
      case 'limit_reached':
        return {
          title: title || "Free Tries Used Up!",
          description: description || "You've used all your free haircut generations. Upgrade to Pro for 25 monthly generations or Premium for 75 monthly generations."
        };
      case 'premium_feature':
        return {
          title: title || "Premium Feature",
          description: description || "This feature is available with Pro membership. Unlock premium hairstyles and 25+ monthly generations."
        };
      case 'manual':
        return {
          title: title || "Upgrade to Pro",
          description: description || "Get 25 monthly generations and access to all premium features and hairstyles."
        };
      default:
        return {
          title: "Upgrade to Pro",
          description: "Unlock all premium features."
        };
    }
  };

  const content = getContent();

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">{content.title}</h4>
              <p className="text-xs text-muted-foreground">{remainingTries} free tries left</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!user ? (
              <SignInButton className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                Sign In
              </SignInButton>
            ) : (
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={isLoading || loadingPlan === 'pro'}
                className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPlan === 'pro' ? 'Processing...' : 'Upgrade'}
              </button>
            )}
            <button 
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background border rounded-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-6 flex items-center justify-center">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            {content.title}
          </h3>
          <p className="text-muted-foreground">
            {content.description}
          </p>
        </div>

        {/* Usage Info */}
        {trigger === 'limit_reached' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-orange-800 text-sm font-medium">
                You've used all {2} free generations
              </p>
            </div>
          </div>
        )}

        {/* Pro Benefits */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-foreground mb-3 text-center">Pro Benefits</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center text-muted-foreground">
              <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              25+ monthly haircut generations
            </li>
            <li className="flex items-center text-muted-foreground">
              <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Access to premium hairstyles
            </li>
            <li className="flex items-center text-muted-foreground">
              <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              High-resolution downloads
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!user ? (
            <>
              <SignInButton className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                Sign In to Upgrade
              </SignInButton>
              <button 
                onClick={handleDismiss}
                className="block w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </>
          ) : (
            <>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={isLoading || loadingPlan === 'pro'}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingPlan === 'pro' ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Upgrade to Pro ($9.99)'
                  )}
                </button>
                <button
                  onClick={() => handleUpgrade('premium')}
                  disabled={isLoading || loadingPlan === 'premium'}
                  className="flex-1 bg-gradient-to-r from-accent to-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingPlan === 'premium' ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Go Premium ($19.99)'
                  )}
                </button>
              </div>
              <button 
                onClick={handleDismiss}
                className="block w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Specific upgrade prompts for different scenarios
export function LimitReachedPrompt({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <UpgradePrompt 
      trigger="limit_reached" 
      onDismiss={onDismiss}
    />
  );
}

export function PremiumFeaturePrompt({ 
  feature, 
  onDismiss 
}: { 
  feature: string;
  onDismiss?: () => void;
}) {
  return (
    <UpgradePrompt 
      trigger="premium_feature"
      title={`Unlock ${feature}`}
      description={`${feature} is available with Pro membership. Get 25+ monthly generations and access to all premium features.`}
      onDismiss={onDismiss}
    />
  );
}

export function CompactUpgradePrompt({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <UpgradePrompt 
      trigger="manual"
      compact={true}
      onDismiss={onDismiss}
    />
  );
}