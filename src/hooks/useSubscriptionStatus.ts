"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  getSubscriptionStatus, 
  getCachedSubscriptionStatus, 
  clearSubscriptionCache,
  refreshSubscriptionFromStripe,
  type SubscriptionStatus 
} from '@/lib/subscription-utils';

export interface UseSubscriptionStatusReturn {
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshStatus: (forceRefresh?: boolean) => Promise<void>;
  refreshFromStripe: () => Promise<void>;
  clearCache: () => void;
  // Convenience properties
  isActive: boolean;
  planType: 'free' | 'pro' | 'premium';
  hasValidSubscription: boolean;
  isExpired: boolean;
  daysUntilExpiry: number | null;
}

/**
 * Hook for managing subscription status with real-time updates and caching
 */
export function useSubscriptionStatus(): UseSubscriptionStatusReturn {
  const { user, subscription } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription status
  const fetchStatus = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setSubscriptionStatus(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const status = await getCachedSubscriptionStatus(user.id, forceRefresh);
      setSubscriptionStatus(status);
      
      if (status.error) {
        setError(status.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription status';
      setError(errorMessage);
      console.error('useSubscriptionStatus: Error fetching status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Refresh from Stripe
  const refreshFromStripe = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const status = await refreshSubscriptionFromStripe(user.id);
      setSubscriptionStatus(status);
      
      if (status.error) {
        setError(status.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh from Stripe';
      setError(errorMessage);
      console.error('useSubscriptionStatus: Error refreshing from Stripe:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Clear cache
  const clearCache = useCallback(() => {
    if (user?.id) {
      clearSubscriptionCache(user.id);
    }
  }, [user?.id]);

  // Initial fetch when user changes
  useEffect(() => {
    if (user?.id) {
      fetchStatus();
    } else {
      setSubscriptionStatus(null);
      setError(null);
    }
  }, [user?.id, fetchStatus]);

  // Update status when AuthProvider subscription changes
  useEffect(() => {
    if (user?.id && subscription) {
      // If AuthProvider has newer subscription data, update our status
      fetchStatus();
    }
  }, [subscription, user?.id, fetchStatus]);

  // Convenience properties
  const isActive = subscriptionStatus?.isActive ?? false;
  const planType = subscriptionStatus?.planType ?? 'free';
  const hasValidSubscription = subscriptionStatus?.hasValidSubscription ?? false;
  const isExpired = subscriptionStatus?.isExpired ?? false;
  const daysUntilExpiry = subscriptionStatus?.daysUntilExpiry ?? null;

  return {
    subscriptionStatus,
    isLoading,
    error,
    refreshStatus: fetchStatus,
    refreshFromStripe,
    clearCache,
    // Convenience properties
    isActive,
    planType,
    hasValidSubscription,
    isExpired,
    daysUntilExpiry,
  };
}

/**
 * Hook for checking if user has access to specific features
 */
export function useFeatureAccess() {
  const { isActive, planType } = useSubscriptionStatus();

  const hasProAccess = isActive && (planType === 'pro' || planType === 'premium');
  const hasPremiumAccess = isActive && planType === 'premium';

  const canAccessFeature = useCallback((requiredPlan: 'free' | 'pro' | 'premium') => {
    switch (requiredPlan) {
      case 'free':
        return true; // Everyone has access to free features
      case 'pro':
        return hasProAccess;
      case 'premium':
        return hasPremiumAccess;
      default:
        return false;
    }
  }, [hasProAccess, hasPremiumAccess]);

  return {
    hasProAccess,
    hasPremiumAccess,
    canAccessFeature,
    planType,
    isActive,
  };
}