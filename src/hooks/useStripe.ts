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
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed && typeof parsed.error === 'string' && parsed.error.length > 0) {
            message = parsed.error;
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

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open customer portal');
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Customer portal error:', err);
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