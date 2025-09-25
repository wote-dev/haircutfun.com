"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFreemiumAccess } from "@/hooks/useFreemiumAccess";
import { useAuth } from "@/components/providers/AuthProvider";
import { useStripe } from "@/hooks/useStripe";
import { SignInButton } from "@/components/auth/SignInButton";
import { Crown, Sparkles, Check, X, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const { hasProAccess, canGenerate, freeTriesUsed } = useFreemiumAccess();
  const { isLoading } = useStripe();
  const router = useRouter();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/try-on';

  // Don't show if user already has pro access
  if (hasProAccess || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleUpgrade = async () => {
    if (!user) return;
    
    // Redirect to pricing page for one-time payment
    router.push('/pricing');
  };

  // Default content based on trigger
  const getContent = () => {
    switch (trigger) {
      case 'limit_reached':
        if (!user) {
          return {
            title: title || "Ready for More?",
            description: description || "You've experienced the magic! Unlock unlimited possibilities with our Pro plans.",
            subtitle: "Your free generation has been used"
          };
        }
        return {
          title: title || "You're on Fire! 🔥",
          description: description || "Looks like you love trying new styles! Upgrade to keep the creativity flowing.",
          subtitle: `Free try used - unlock unlimited access`
        };
      case 'premium_feature':
        return {
          title: title || "Premium Feature",
          description: description || "This feature is available with Pro membership. Unlock premium hairstyles and unlimited creativity.",
          subtitle: "Exclusive content ahead"
        };
      case 'manual':
        return {
          title: title || "Unlock Your Style Potential",
          description: description || "Join thousands who've discovered their perfect look with unlimited generations.",
          subtitle: "Upgrade to Pro"
        };
      default:
        return {
          title: "Unlock Your Style Potential",
          description: "Join thousands who've discovered their perfect look with unlimited generations.",
          subtitle: "Upgrade to Pro"
        };
    }
  };

  const content = getContent();

  if (compact) {
    return (
      <Card className="max-w-sm mx-auto border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{content.title}</h4>
                <p className="text-xs text-muted-foreground">{content.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" asChild>
                <Link href="/pricing">
                  Upgrade
                </Link>
              </Button>
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={handleDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              {trigger === 'limit_reached' ? (
                <Zap className="h-8 w-8 text-primary" />
              ) : trigger === 'premium_feature' ? (
                <Crown className="h-8 w-8 text-primary" />
              ) : (
                <Sparkles className="h-8 w-8 text-primary" />
              )}
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        {/* Pro Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-5 w-5 text-primary" />
              Pro Access - One-Time Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm">Unlimited haircut generations</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm">Access to premium hairstyles</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm">High-resolution downloads</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm">No monthly fees ever</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {!user ? (
            <SignInButton 
              className="w-full"
              redirectTo={currentPath}
            >
              Sign In to Continue
            </SignInButton>
          ) : (
            <>
              <Button 
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full"
              >
                Unlock Pro Access - $3.99 One-Time
              </Button>
            </>
          )}
          
          {onDismiss && (
            <Button variant="ghost" onClick={handleDismiss} className="w-full">
              Maybe Later
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
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