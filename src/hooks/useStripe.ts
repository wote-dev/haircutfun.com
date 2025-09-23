"use client";

import { useState } from 'react';
import { useAuth } from '../components/providers/AuthProvider';

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createCheckoutSession = async (planType: 'pro' | 'premium') => {
    if (!user) {
      setError('Please sign in to subscribe');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });

      if (!response.ok) {
        // Read body once and try to extract a useful error
        const raw = await response.text();
        let message = 'Failed to create checkout session';
        let errorCode = null;
        let redirectUrl = null;
        
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed && typeof parsed.error === 'string' && parsed.error.length > 0) {
            message = parsed.error;
            errorCode = parsed.code;
            redirectUrl = parsed.redirectUrl;
          }
        } catch {
          // Not JSON, fall back to raw text if present
          if (raw && raw.trim().length > 0) {
            message = raw;
          } else {
            message = `HTTP ${response.status}`;
          }
        }
        
        console.error('Checkout API error:', { status: response.status, body: raw });
        
        // Handle specific subscription conflict errors with direct redirect
        if (response.status === 409 && redirectUrl) {
          console.log('🔄 Redirecting to customer portal via redirectUrl:', redirectUrl);
          // Make a POST request to the customer portal API endpoint with credentials
          try {
            const portalResponse = await fetch(redirectUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include', // Include cookies for authentication
            });
            
            if (portalResponse.ok) {
              const portalData = await portalResponse.json();
              if (portalData.url) {
                console.log('✅ Redirecting to Stripe customer portal:', portalData.url);
                window.location.href = portalData.url;
                return null; // Don't throw error, we're redirecting
              }
            } else {
              console.error('❌ Customer portal API error:', {
                status: portalResponse.status,
                statusText: portalResponse.statusText
              });
            }
          } catch (portalError) {
            console.error('❌ Failed to redirect to customer portal:', portalError);
          }
          
          // If redirect failed, still throw the original error
          const error = new Error(message);
          (error as any).code = errorCode;
          (error as any).redirectUrl = redirectUrl;
          throw error;
        }
        
        // Handle other 409 errors without redirectUrl
        if (response.status === 409 && errorCode) {
          const error = new Error(message);
          (error as any).code = errorCode;
          throw error;
        }
        
        throw new Error(message);
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Checkout error:', err);
      
      // Re-throw subscription-related errors so the pricing page can handle them
      if (err instanceof Error && (err as any).code) {
        const code = (err as any).code;
        if (code === 'EXISTING_SUBSCRIPTION_SAME_PLAN' || code === 'EXISTING_SUBSCRIPTION_DIFFERENT_PLAN') {
          throw err; // Let the pricing page handle subscription conflicts
        }
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      setError('Please sign in to manage your subscription');
      return;
    }

    console.log('🚀 Opening customer portal for user:', user.id);
    setIsLoading(true);
    setError(null);

    try {
      console.log('📡 Making request to /api/customer-portal');
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📥 Customer portal response:', { 
        ok: response.ok, 
        status: response.status, 
        data 
      });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open customer portal');
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        console.log('🔗 Redirecting to:', data.url);
        window.location.href = data.url;
      } else {
        console.error('❌ No URL returned from customer portal API');
        throw new Error('No portal URL received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('❌ Customer portal error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    openCustomerPortal,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}