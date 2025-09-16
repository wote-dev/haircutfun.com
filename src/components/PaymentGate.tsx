"use client";

import Link from "next/link";
import { useUsageTracker } from "@/hooks/useUsageTracker";
import { useAuth } from "@/components/providers/AuthProvider";
import { useStripe } from "@/hooks/useStripe";
import { SignInButton } from "@/components/auth/SignInButton";
import { useState } from "react";

interface PaymentGateProps {
  feature: string;
  description: string;
  children?: React.ReactNode;
  showUpgrade?: boolean;
}

export function PaymentGate({ feature, description, children, showUpgrade = true }: PaymentGateProps) {
  const { user } = useAuth();
  const { hasPremium, remainingTries } = useUsageTracker();
  const { createCheckoutSession, isLoading } = useStripe();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // If user has premium access, render children
  if (hasPremium) {
    return <>{children}</>;
  }

  const handleUpgrade = async (planType: 'pro' | 'premium') => {
    if (!user) return;
    
    setLoadingPlan(planType);
    await createCheckoutSession(planType);
    setLoadingPlan(null);
  };

  // Show payment gate for non-premium users
  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-dashed border-primary/20 rounded-2xl p-8 text-center">
      <div className="max-w-md mx-auto">
        {/* Lock Icon */}
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-6 flex items-center justify-center">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-foreground mb-3">
          Unlock {feature}
        </h3>
        <p className="text-muted-foreground mb-6">
          {description}
        </p>

        {/* Free Tries Info */}
        {remainingTries > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <span className="font-semibold">{remainingTries} free tries remaining</span>
              <br />
              Try our basic features first, then upgrade for premium styles!
            </p>
          </div>
        )}

        {/* Pro Features */}
        <div className="bg-background border rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-foreground mb-4">Pro Features Include:</h4>
          <ul className="text-left space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              25+ monthly haircut generations
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Access to premium hairstyles
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              High-resolution image downloads
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Priority AI processing
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save and organize your looks
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        {showUpgrade && (
          <div className="space-y-3">
            {!user ? (
              <>
                <SignInButton className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                  Sign In to Upgrade
                </SignInButton>
                <Link 
                  href="/pricing"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all pricing options →
                </Link>
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
                <Link 
                  href="/pricing"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Compare all plans →
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Specific payment gates for different features
export function PremiumHaircutGate({ children }: { children: React.ReactNode }) {
  return (
    <PaymentGate
      feature="Premium Hairstyles"
      description="Access our most popular and trending hairstyles with Pro membership."
    >
      {children}
    </PaymentGate>
  );
}

export function UnlimitedTriesGate({ children }: { children: React.ReactNode }) {
  return (
    <PaymentGate
      feature="Monthly Generations"
      description="Generate 25+ hairstyle variations per month with Pro membership."
    >
      {children}
    </PaymentGate>
  );
}

export function HighResDownloadGate({ children }: { children: React.ReactNode }) {
  return (
    <PaymentGate
      feature="High-Resolution Downloads"
      description="Download your favorite looks in high quality for printing and sharing."
    >
      {children}
    </PaymentGate>
  );
}