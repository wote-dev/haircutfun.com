"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Star, Zap, Crown, X, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { SignInButton } from "@/components/auth/SignInButton";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'error' | 'warning' | 'success'; onClose: () => void }) {
  const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500';
  
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Payment form component
function PaymentForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { client_secret, payment_intent_id, error } = await response.json();

      if (error) {
        onError(error);
        return;
      }

      // Confirm payment
      const { error: stripeError } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (stripeError) {
        onError(stripeError.message || 'Payment failed');
        return;
      }

      // Confirm with our backend
      const confirmResponse = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_intent_id }),
      });

      const confirmResult = await confirmResponse.json();

      if (confirmResult.error) {
        onError(confirmResult.error);
        return;
      }

      onSuccess();

    } catch (error) {
      onError('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full gradient-primary text-white"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Unlock Pro Access - $4.99'
        )}
      </Button>
    </form>
  );
}

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'success' } | null>(null);
  const [userProfile, setUserProfile] = useState<{ has_pro_access: boolean; free_tries_used: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Fetch user profile and usage
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setToast({ message: 'Pro access unlocked! You now have unlimited tries.', type: 'success' });
    fetchUserProfile(); // Refresh profile
  };

  const handlePaymentError = (error: string) => {
    setToast({ message: error, type: 'error' });
  };

  const handleGetStarted = () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (userProfile?.has_pro_access) {
      router.push('/try-on');
      return;
    }

    if (userProfile?.free_tries_used === 0) {
      router.push('/try-on');
      return;
    }

    // User has used their free try, show payment form
    setShowPaymentForm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Try Before You Cut
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            See how you'd look with any hairstyle using our AI-powered virtual try-on technology. 
            Start with 1 free try, then unlock unlimited access.
          </p>
          
          {user && userProfile?.has_pro_access && (
            <div className="inline-flex items-center space-x-3 bg-green-100 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-800 font-semibold">
                ✓ You have Pro Access - Unlimited tries!
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            
            {/* Free Trial */}
            <Card className="relative border-2 border-gray-200 hover:border-purple-300 transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900">Free Trial</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                </div>
                <CardDescription className="text-gray-600 mt-2">
                  Perfect for trying out our technology
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>1 free virtual haircut try</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Access to all hairstyles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>High-quality AI processing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                </div>
                
                {user && userProfile && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Free tries used: {userProfile.free_tries_used}/1
                    </p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button 
                   onClick={handleGetStarted}
                   className="w-full border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
                   disabled={user && userProfile && userProfile.free_tries_used >= 1 && userProfile.has_pro_access === false}
                 >
                   {!user ? 'Sign Up Free' : 
                    userProfile?.has_pro_access ? 'Start Creating' :
                    (userProfile?.free_tries_used ?? 0) >= 1 ? 'Free Try Used' : 'Start Free Trial'}
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Access */}
            <Card className="relative border-2 border-purple-500 hover:border-purple-600 transition-all duration-300 shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              </div>
              
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-gray-900">Pro Access</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-purple-600">$4.99</span>
                  <span className="text-gray-600 ml-2">one-time</span>
                </div>
                <CardDescription className="text-gray-600 mt-2">
                  Unlimited access forever
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Unlimited virtual haircut tries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-purple-500" />
                    <span>Access to ALL premium hairstyles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-purple-500" />
                    <span>Priority processing speed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-purple-500" />
                    <span>Save & download results</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-purple-500" />
                    <span>No monthly fees ever</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                {user && userProfile?.has_pro_access ? (
                  <Button 
                    onClick={() => router.push('/try-on')}
                    className="w-full gradient-primary text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Start Creating
                  </Button>
                ) : (
                  <Button 
                    onClick={() => user ? setShowPaymentForm(true) : router.push('/auth/signin')}
                    className="w-full gradient-primary text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {user ? 'Unlock Pro Access' : 'Sign Up & Unlock'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Unlock Pro Access</h3>
              <button 
                onClick={() => setShowPaymentForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">One-time payment of $4.99 for:</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✓ Unlimited virtual haircut tries</li>
                <li>✓ Access to all premium hairstyles</li>
                <li>✓ No monthly fees ever</li>
              </ul>
            </div>

            <Elements stripe={stripePromise}>
              <PaymentForm 
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">How does the free trial work?</h3>
              <p className="text-gray-600">
                You get 1 completely free virtual haircut try with no credit card required. 
                After using your free generation, you can unlock unlimited access for just $4.99.
              </p>
            </div>
            
            <div className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">Is this really a one-time payment?</h3>
              <p className="text-gray-600">
                Yes! Unlike subscription services, you pay once and get unlimited access forever. 
                No monthly fees, no recurring charges.
              </p>
            </div>
            
            <div className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">What hairstyles are available?</h3>
              <p className="text-gray-600">
                We have a comprehensive collection of modern and classic hairstyles for all genders, 
                including trendy cuts, professional styles, and creative looks.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a 7-day money-back guarantee. If you're not satisfied with the results, 
                contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Hairstyle?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Join thousands of users who've discovered their ideal look with our AI technology.
          </p>
          
          {!user ? (
            <SignInButton className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold text-lg">
              Get Started Free
            </SignInButton>
          ) : (
            <Button 
              onClick={handleGetStarted}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold text-lg"
            >
              {userProfile?.has_pro_access ? 'Start Creating' : 'Try It Free'}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}