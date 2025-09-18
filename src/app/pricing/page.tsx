"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Star, Zap, Crown, X, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useStripe } from "@/hooks/useStripe";
import { SignInButton } from "@/components/auth/SignInButton";
import { useState, useEffect } from "react";

const pricingTiers = [
  {
    name: "Free Trial",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out our AI haircut technology",
    features: [
      "1 free virtual haircut try",
      "Basic hairstyle gallery",
      "Standard photo upload",
      "Basic hair analysis",
      "Community support"
    ],
    limitations: [
      "Limited to 1 try total",
      "No premium hairstyles",
      "Standard processing speed"
    ],
    buttonText: "Start Free Trial",
    buttonStyle: "border border-primary text-primary hover:bg-primary hover:text-white smooth-hover",
    popular: false
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "month",
    description: "25 generations per month plus premium features",
    features: [
      "25 virtual haircut tries per month",
      "Access to ALL premium hairstyles",
      "Priority processing speed",
      "Save & compare results",
      "Priority customer support"
    ],
    limitations: [],
    buttonText: "Start Pro Plan",
    buttonStyle: "gradient-primary text-white smooth-gradient-hover",
    popular: true
  },
  {
    name: "Premium",
    price: "$12.99",
    period: "month",
    description: "75 generations per month plus premium features",
    features: [
      "75 virtual haircut tries per month",
      "Everything in Pro plan",
      "Personalized style recommendations",
      "Early access to new features",
      "White-glove customer support",
      "Commercial usage rights"
    ],
    limitations: [],
    buttonText: "Go Premium",
    buttonStyle: "gradient-accent text-white smooth-gradient-hover",
    popular: false
  }
];

const faqs = [
  {
    question: "How does the free trial work?",
    answer: "You get 1 completely free virtual haircut try with no credit card required. After using your free generation, you'll see upgrade options to continue using our service with Pro or Premium plans."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your current billing period."
  },
  {
    question: "What's the difference between Pro and Premium?",
    answer: "Pro gives you 25 generations per month with access to premium hairstyles and priority support, while Premium offers 75 generations per month plus personalized style recommendations, early access to new features, and white-glove customer support."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 7-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund."
  }
];

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'error' | 'warning' | 'success'; onClose: () => void }) {
  const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm leading-relaxed">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { user, subscription, loading } = useAuth();
  const { createCheckoutSession, openCustomerPortal, isLoading } = useStripe();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'success' } | null>(null);
  const [subscriptionCheckFailed, setSubscriptionCheckFailed] = useState(false);
  const router = useRouter();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/pricing';

  // Check if user has an active subscription
  const hasActiveSubscription = subscription?.status === 'active';
  const currentPlan = subscription?.plan_type;

  // Check if subscription data failed to load (e.g., due to database timeout)
  useEffect(() => {
    if (user && !loading && !subscription) {
      // If user is logged in, not loading, but no subscription data, it might be a timeout
      const timer = setTimeout(() => {
        setSubscriptionCheckFailed(true);
        console.log('Subscription check may have failed due to timeout');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, subscription]);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'error' | 'warning' | 'success') => {
    setToast({ message, type });
  };

  const handlePlanSelect = async (planType: 'pro' | 'premium') => {
    if (!user) {
      // User needs to sign in first
      return;
    }

    // Double-check subscription status before proceeding
    console.log('Subscription check:', { hasActiveSubscription, currentPlan, subscription, subscriptionCheckFailed, loading });
    
    // If subscription data failed to load, show warning and try customer portal first
    if (subscriptionCheckFailed && !hasActiveSubscription) {
      showToast('⚠️ Unable to verify subscription status. Checking if you have an existing subscription...', 'warning');
      setLoadingPlan(planType);
      
      // Try to open customer portal first - if user has subscription, it will work
      try {
        await openCustomerPortal();
        setLoadingPlan(null);
        return;
      } catch (error) {
        console.log('Customer portal failed, user likely has no subscription, proceeding with checkout...');
        // If customer portal fails, user likely has no subscription, continue with checkout
      }
    }
    
    // Immediate visual feedback if user has an active subscription
    if (hasActiveSubscription) {
      if (currentPlan === planType) {
        showToast(`You already have the ${planType.charAt(0).toUpperCase() + planType.slice(1)} plan! Redirecting to manage your subscription...`, 'warning');
      } else {
        showToast(`You already have an active subscription! Redirecting to manage your subscription...`, 'warning');
      }
      console.log('User has active subscription, opening customer portal...');
      setLoadingPlan(planType);
      setTimeout(async () => {
        await openCustomerPortal();
        setLoadingPlan(null);
      }, 1500);
      return;
    }

    // Additional check: if user has the same plan they're trying to select
    if (currentPlan === planType) {
      showToast(`You already have the ${planType.charAt(0).toUpperCase() + planType.slice(1)} plan! Redirecting to manage your subscription...`, 'warning');
      console.log('User already has this plan, opening customer portal...');
      setLoadingPlan(planType);
      setTimeout(async () => {
        await openCustomerPortal();
        setLoadingPlan(null);
      }, 1500);
      return;
    }

    setLoadingPlan(planType);
    
    try {
      await createCheckoutSession(planType);
    } catch (error: any) {
      console.error('Checkout error details:', error);
      
      // Handle subscription conflict errors from the API
      if (error.code === 'EXISTING_SUBSCRIPTION_SAME_PLAN') {
        console.log('User already has this subscription, opening customer portal...');
        showToast('You already have this subscription plan! Redirecting to manage your subscription...', 'warning');
        setTimeout(async () => {
          await openCustomerPortal();
        }, 1500);
      } else if (error.code === 'EXISTING_SUBSCRIPTION_DIFFERENT_PLAN') {
        console.log('User has different subscription, opening customer portal to manage...');
        showToast('You already have an active subscription! Redirecting to manage your subscription...', 'warning');
        setTimeout(async () => {
          await openCustomerPortal();
        }, 1500);
      } else if (error.message && error.message.includes('already have an active subscription')) {
        // Catch any other subscription-related errors
        console.log('User has active subscription (caught by message), opening customer portal...');
        showToast('🚨 You already have an active subscription! Redirecting to manage your subscription...', 'error');
        setTimeout(async () => {
          await openCustomerPortal();
        }, 1500);
      } else {
        // Handle other errors
        console.error('Checkout error:', error);
        showToast(error.message || 'An error occurred while creating your subscription. Please try again.', 'error');
      }
    }
    
    setLoadingPlan(null);
  };

  const PricingButton = ({ tier }: { tier: typeof pricingTiers[0] }) => {
    const planType = tier.name.toLowerCase() as 'pro' | 'premium';
    const isPaidPlan = tier.name === 'Pro' || tier.name === 'Premium';
    const isLoadingThisPlan = loadingPlan === planType;
    const isCurrentPlan = hasActiveSubscription && currentPlan === planType;

    if (tier.name === 'Free Trial') {
      return (
        <Link
          href="/try-on"
          className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold ${tier.buttonStyle}`}
        >
          {tier.buttonText}
        </Link>
      );
    }

    if (!user) {
      return (
        <SignInButton 
          className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold ${tier.buttonStyle}`}
          redirectTo={currentPath}
        >
          Sign In to Subscribe
        </SignInButton>
      );
    }

    // Show current plan status
    if (isCurrentPlan) {
      return (
        <button
          onClick={async () => {
            setLoadingPlan(planType);
            await openCustomerPortal();
            setLoadingPlan(null);
          }}
          disabled={isLoading || isLoadingThisPlan}
          className="w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 transition-colors disabled:opacity-50"
        >
          {isLoadingThisPlan ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span>Loading...</span>
            </div>
          ) : (
            '✓ Current Plan - Manage'
          )}
        </button>
      );
    }

    // Show upgrade/change plan for users with different active subscriptions
    if (hasActiveSubscription && !isCurrentPlan) {
      const isUpgrade = (currentPlan === 'pro' && planType === 'premium');
      const isDowngrade = (currentPlan === 'premium' && planType === 'pro');
      
      return (
        <button
          onClick={async () => {
            setLoadingPlan(planType);
            await openCustomerPortal();
            setLoadingPlan(null);
          }}
          disabled={isLoading || isLoadingThisPlan}
          className="w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200 transition-colors disabled:opacity-50"
        >
          {isLoadingThisPlan ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading...</span>
            </div>
          ) : (
            isUpgrade ? 'Upgrade Plan' : isDowngrade ? 'Change Plan' : 'Change Plan'
          )}
        </button>
      );
    }

    return (
        <button
          onClick={() => handlePlanSelect(planType)}
          disabled={isLoading || isLoadingThisPlan}
          className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${tier.buttonStyle}`}
        >
        {isLoadingThisPlan ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Processing...</span>
          </div>
        ) : (
          tier.buttonText
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 sm:text-5xl">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with 1 free try, then choose from 25 or 75 monthly generations with premium features
          </p>
          
          {/* Free Trial Highlight */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 mb-8">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              🎉 1 Free Try - No Credit Card Required
            </span>
          </div>
        </div>
      </section>

      {/* Subscription Status Banner */}
      {user && loading && (
        <section className="py-4 bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 text-blue-800">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">
                Loading your subscription status...
              </p>
            </div>
          </div>
        </section>
      )}
      
      {user && subscriptionCheckFailed && !hasActiveSubscription && (
        <section className="py-4 bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm font-medium">
                ⚠️ Unable to verify subscription status. If you have an existing subscription, clicking a plan will redirect you to manage it.
              </p>
            </div>
          </div>
        </section>
      )}
      
      {user && hasActiveSubscription && (
        <section className="py-8 bg-green-50 border-y border-green-200">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center space-x-3 bg-green-100 rounded-full px-6 py-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 font-semibold">
                  ✓ You're currently subscribed to the {currentPlan?.charAt(0).toUpperCase()}{currentPlan?.slice(1)} plan
                </span>
              </div>
            </div>
            <p className="text-green-700 text-sm mt-2">
              Use the "Manage" or "Change Plan" buttons below to modify your subscription
            </p>
          </div>
        </section>
      )}

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`relative bg-background border rounded-2xl p-8 transition-all duration-300 hover:shadow-lg ${
                  tier.popular ? 'border-primary shadow-lg scale-105' : 'border-border hover:border-primary/50'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center space-x-2">
                    {tier.name === 'Premium' && <Crown className="h-6 w-6 text-accent" />}
                    <span>{tier.name}</span>
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">/{tier.period}</span>
                  </div>
                  <p className="text-muted-foreground">{tier.description}</p>
                </div>
                
                {/* Features */}
                <div className="mb-8">
                  <h4 className="font-semibold text-foreground mb-4">What&apos;s included:</h4>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {tier.limitations.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-muted-foreground mb-3 text-sm">Limitations:</h4>
                      <ul className="space-y-2">
                        {tier.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="flex items-start space-x-3">
                            <div className="h-2 w-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <PricingButton tier={tier} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Upgrade to Pro or Premium?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unlock the full potential of AI-powered hairstyling with monthly generation allowances and premium features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Monthly Generations</h3>
              <p className="text-muted-foreground">
                Get 25 tries with Pro or 75 tries with Premium - plenty for all your styling needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Premium Styles</h3>
              <p className="text-muted-foreground">
                Access premium hairstyles and trending cuts from top stylists.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Priority Support</h3>
              <p className="text-muted-foreground">
                Get faster processing and dedicated customer support when you need it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-8 p-6 bg-background border border-border rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Look?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start with 1 free try and discover your perfect hairstyle today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/try-on"
                className="border-glow-primary bg-background text-foreground px-8 py-4 rounded-lg font-semibold transition-all duration-300"
              >
                Start Free Trial
              </Link>
              <Link
                href="/gallery"
                className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Browse Hairstyles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}