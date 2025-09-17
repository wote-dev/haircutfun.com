"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useStripe } from "@/hooks/useStripe";
import { SignInButton } from "@/components/auth/SignInButton";
import { useState } from "react";

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
    buttonStyle: "border border-primary text-primary hover:bg-primary hover:text-white",
    popular: false
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "month",
    description: "25 generations per month plus premium features",
    features: [
      "25 virtual haircut tries per month",
      "Access to ALL premium hairstyles",
      "HD photo processing",
      "Advanced AI hair analysis",
      "Priority processing speed",
      "Multiple angle views",
      "Save & compare results",
      "Priority customer support"
    ],
    limitations: [],
    buttonText: "Start Pro Plan",
    buttonStyle: "gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-105",
    popular: true
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "month",
    description: "75 generations per month plus exclusive celebrity hairstyles",
    features: [
      "75 virtual haircut tries per month",
      "Everything in Pro plan",
      "Exclusive celebrity hairstyles",
      "Custom hair color simulation",
      "Professional stylist consultation",
      "Personalized style recommendations",
      "Early access to new features",
      "White-glove customer support",
      "Commercial usage rights"
    ],
    limitations: [],
    buttonText: "Go Premium",
    buttonStyle: "gradient-accent text-white shadow-lg hover:shadow-xl hover:scale-105",
    popular: false
  }
];

const faqs = [
  {
    question: "How does the free trial work?",
    answer: "You get 1 completely free virtual haircut try with no credit card required. After that, you'll need to upgrade to continue using our service."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your current billing period."
  },
  {
    question: "What's the difference between Pro and Premium?",
    answer: "Pro gives you 25 generations per month, while Premium offers 75 generations per month plus exclusive celebrity hairstyles, custom hair color simulation, and professional stylist consultations."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 7-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund."
  }
];

export default function PricingPage() {
  const { user } = useAuth();
  const { createCheckoutSession, isLoading } = useStripe();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/pricing';

  const handlePlanSelect = async (planType: 'pro' | 'premium') => {
    if (!user) {
      // User needs to sign in first
      return;
    }

    setLoadingPlan(planType);
    await createCheckoutSession(planType);
    setLoadingPlan(null);
  };

  const PricingButton = ({ tier }: { tier: typeof pricingTiers[0] }) => {
    const planType = tier.name.toLowerCase() as 'pro' | 'premium';
    const isPaidPlan = tier.name === 'Pro' || tier.name === 'Premium';
    const isLoadingThisPlan = loadingPlan === planType;

    if (tier.name === 'Free Trial') {
      return (
        <Link
          href="/try-on"
          className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold transition-all duration-300 ${tier.buttonStyle}`}
        >
          {tier.buttonText}
        </Link>
      );
    }

    if (!user) {
      return (
        <SignInButton 
          className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold transition-all duration-300 ${tier.buttonStyle}`}
          redirectTo={currentPath}
        >
          Sign In to Subscribe
        </SignInButton>
      );
    }

    return (
      <button
        onClick={() => handlePlanSelect(planType)}
        disabled={isLoading || isLoadingThisPlan}
        className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${tier.buttonStyle}`}
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
                Access exclusive celebrity hairstyles and trending cuts from top salons.
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
    </div>
  );
}