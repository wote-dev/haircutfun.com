"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Star, Zap, Crown, X, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useStripe } from "@/hooks/useStripe";
import { SignInButton } from "@/components/auth/SignInButton";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
        <Button asChild className="w-full" variant="outline" size="lg">
          <Link href="/try-on">
            {tier.buttonText}
          </Link>
        </Button>
      );
    }

    if (!user) {
      return (
        <SignInButton 
          className="w-full"
          redirectTo={currentPath}
          variant={tier.popular ? "default" : "outline"}
          size="lg"
        >
          Sign In to Subscribe
        </SignInButton>
      );
    }

    // Show current plan status
    if (isCurrentPlan) {
      return (
        <Button
          onClick={async () => {
            setLoadingPlan(planType);
            await openCustomerPortal();
            setLoadingPlan(null);
          }}
          disabled={isLoading || isLoadingThisPlan}
          className="w-full bg-green-100 text-green-800 border border-green-300 hover:bg-green-200"
          variant="outline"
          size="lg"
        >
          {isLoadingThisPlan ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span>Loading...</span>
            </div>
          ) : (
            '✓ Current Plan - Manage'
          )}
        </Button>
      );
    }

    // Show upgrade/change plan for users with different active subscriptions
    if (hasActiveSubscription && !isCurrentPlan) {
      const isUpgrade = (currentPlan === 'pro' && planType === 'premium');
      const isDowngrade = (currentPlan === 'premium' && planType === 'pro');
      
      return (
        <Button
          onClick={async () => {
            setLoadingPlan(planType);
            await openCustomerPortal();
            setLoadingPlan(null);
          }}
          disabled={isLoading || isLoadingThisPlan}
          className="w-full bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200"
          variant="outline"
          size="lg"
        >
          {isLoadingThisPlan ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading...</span>
            </div>
          ) : (
            isUpgrade ? 'Upgrade Plan' : isDowngrade ? 'Change Plan' : 'Change Plan'
          )}
        </Button>
      );
    }

    return (
      <Button
        onClick={() => handlePlanSelect(planType)}
        disabled={isLoading || isLoadingThisPlan}
        className="w-full"
        variant={tier.popular ? "default" : "outline"}
        size="lg"
      >
        {isLoadingThisPlan ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            <span>Processing...</span>
          </div>
        ) : (
          tier.buttonText
        )}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6">
            <Zap className="h-4 w-4 mr-2" />
            1 Free Try - No Credit Card Required
          </Badge>
          
          <h1 className="text-5xl font-bold text-foreground mb-6 sm:text-6xl lg:text-7xl">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Start with a free trial, then choose the plan that fits your needs. 
            All plans include access to our AI-powered hairstyling technology.
          </p>
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card
                key={tier.name}
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  tier.popular 
                    ? 'border-primary shadow-lg ring-2 ring-primary/20 scale-105' 
                    : 'hover:border-primary/50'
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                    {tier.name === 'Premium' && <Crown className="h-6 w-6 text-accent" />}
                    {tier.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground text-lg">/{tier.period}</span>
                  </div>
                  <CardDescription className="text-base mt-4">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Everything included:</h4>
                    <ul className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {tier.limitations.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h4 className="font-medium text-muted-foreground mb-3 text-sm">Limitations:</h4>
                        <ul className="space-y-2">
                          {tier.limitations.map((limitation, limitIndex) => (
                            <li key={limitIndex} className="flex items-start gap-3">
                              <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-muted-foreground">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <PricingButton tier={tier} />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Why choose a paid plan?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Unlock the full potential of AI-powered hairstyling with monthly generation allowances and premium features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Monthly Generations</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get 25 tries with Pro or 75 tries with Premium - plenty for all your styling needs.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <Crown className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Premium Styles</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access premium hairstyles and trending cuts from top stylists.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Priority Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get faster processing and dedicated customer support when you need it.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about our pricing and plans
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg text-left">
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-6 sm:text-5xl">
              Ready to Transform Your Look?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Start with 1 free try and discover your perfect hairstyle today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link href="/try-on">
                  Start Free Trial
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link href="/gallery">
                  Browse Hairstyles
                </Link>
              </Button>
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