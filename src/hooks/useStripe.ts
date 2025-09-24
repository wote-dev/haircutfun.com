"use client";

import { useState } from 'react';
import { useAuth } from '../components/providers/AuthProvider';

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createCheckoutSession = async (planType: 'pro') => {
    if (!user) {
      setError('Please sign in to purchase Pro access');
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
        
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed && typeof parsed.error === 'string' && parsed.error.length > 0) {
            message = parsed.error;
            errorCode = parsed.code;
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
        
        // Handle existing pro access error
        if (response.status === 409 && errorCode === 'EXISTING_PRO_ACCESS') {
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
      
      // Re-throw pro access errors so the pricing page can handle them
      if (err instanceof Error && (err as any).code === 'EXISTING_PRO_ACCESS') {
        throw err;
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}