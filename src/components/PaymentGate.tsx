"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFreemiumAccess } from "@/hooks/useFreemiumAccess";
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
  const { canGenerate, hasProAccess, freeTriesUsed } = useFreemiumAccess();
  const { isLoading } = useStripe();
  const router = useRouter();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/try-on';

  // If user has pro access, render children
  if (hasProAccess) {
    return <>{children}</>;
  }

  // Hard paywall: Only allow access if user can generate
  if (canGenerate) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    if (!user) return;
    
    // Redirect to pricing page for one-time payment
    router.push('/pricing');
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

        {/* Hard Paywall Message - No Free Trial */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">
            <span className="font-semibold">🚫 Generation Limit Reached</span>
            <br />
            {user 
              ? "You've used your free generation. Upgrade to continue creating amazing hairstyles!"
              : "You've used your free generation. Sign in and upgrade to continue!"
            }
          </p>
        </div>

        {/* Pro Features */}
        <div className="bg-background border rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-foreground mb-4">Pro Features Include:</h4>
          <ul className="text-left space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Unlimited haircut generations
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
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No monthly fees ever
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        {showUpgrade && (
          <div className="space-y-3">
            {!user ? (
              <>
                <SignInButton 
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 px-6 rounded-xl smooth-gradient-hover"
                  redirectTo={currentPath}
                >
                  Sign In to Upgrade
                </SignInButton>
                <Link 
                  href="/pricing"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View pricing →
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 px-6 rounded-xl smooth-gradient-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Unlock Pro Access - $4.99 One-Time'
                  )}
                </button>
                
                {/* Powered by Stripe */}
                <div className="flex items-center justify-center">
                  <img 
                    src="/Powered by Stripe/Powered by Stripe - blurple.svg" 
                    alt="Powered by Stripe" 
                    className="h-8 w-auto"
                  />
                </div>
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