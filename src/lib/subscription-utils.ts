import { createClient } from './supabase/client';
import { Database } from './types/database';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export interface SubscriptionStatus {
  isActive: boolean;
  planType: 'free' | 'pro' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | 'none';
  subscription: Subscription | null;
  hasValidSubscription: boolean;
  isExpired: boolean;
  daysUntilExpiry: number | null;
  error?: string;
}

/**
 * Comprehensive subscription status checker with retry logic and validation
 */
export async function getSubscriptionStatus(userId: string, retries = 2): Promise<SubscriptionStatus> {
  const defaultStatus: SubscriptionStatus = {
    isActive: false,
    planType: 'free',
    status: 'none',
    subscription: null,
    hasValidSubscription: false,
    isExpired: false,
    daysUntilExpiry: null,
  };

  if (!userId) {
    return { ...defaultStatus, error: 'No user ID provided' };
  }

  let lastError: Error | null = null;

  // Retry logic for database queries
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const supabase = createClient();
      
      // Fetch the most recent subscription with timeout
      const subscriptionPromise = supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Subscription query timeout')), 8000);
      });

      const { data: subscription, error } = await Promise.race([
        subscriptionPromise,
        timeoutPromise
      ]);

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Database error: ${error.message}`);
      }

      // If no subscription found, user is on free plan
      if (!subscription) {
        return {
          ...defaultStatus,
          planType: 'free',
          status: 'none',
        };
      }

      // Validate subscription data
      const validationResult = validateSubscription(subscription);
      
      return {
        isActive: validationResult.isActive,
        planType: subscription.plan_type || 'free',
        status: subscription.status,
        subscription,
        hasValidSubscription: validationResult.isValid,
        isExpired: validationResult.isExpired,
        daysUntilExpiry: validationResult.daysUntilExpiry,
      };

    } catch (error) {
      lastError = error as Error;
      console.warn(`Subscription status check attempt ${attempt + 1} failed:`, error);
      
      // If this is not the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  // All retries failed
  return {
    ...defaultStatus,
    error: `Failed to fetch subscription status after ${retries + 1} attempts: ${lastError?.message}`,
  };
}

/**
 * Validate subscription data and determine if it's active and valid
 */
function validateSubscription(subscription: Subscription) {
  const now = new Date();
  
  // Check if subscription status is active
  const isStatusActive = subscription.status === 'active';
  
  // Check if subscription hasn't expired (if end date is provided)
  let isExpired = false;
  let daysUntilExpiry: number | null = null;
  
  if (subscription.current_period_end) {
    const endDate = new Date(subscription.current_period_end);
    isExpired = endDate < now;
    
    if (!isExpired) {
      const timeDiff = endDate.getTime() - now.getTime();
      daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
  }
  
  // Check if Stripe IDs are present (indicates real subscription or test subscription)
  const hasStripeData = !!(subscription.stripe_customer_id && subscription.stripe_subscription_id);
  
  // Check if this is a test subscription (for development/testing without webhooks)
  const isTestSubscription = (subscription.stripe_customer_id?.startsWith('test_') ?? false) || 
                             (subscription.stripe_subscription_id?.startsWith('test_') ?? false);
  
  // Subscription is valid if it's active, not expired, and has either real Stripe data or is a test subscription
  const isValid = isStatusActive && !isExpired && (hasStripeData || isTestSubscription);
  const isActive = isValid;
  
  return {
    isActive,
    isValid,
    isExpired,
    daysUntilExpiry,
  };
}

/**
 * Check if user has access to premium features
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const status = await getSubscriptionStatus(userId);
  return status.isActive && (status.planType === 'pro' || status.planType === 'premium');
}

/**
 * Check if user has access to specific plan features
 */
export async function hasAccessToPlan(userId: string, requiredPlan: 'pro' | 'premium'): Promise<boolean> {
  const status = await getSubscriptionStatus(userId);
  
  if (!status.isActive) return false;
  
  // Premium users have access to pro features
  if (requiredPlan === 'pro') {
    return status.planType === 'pro' || status.planType === 'premium';
  }
  
  // Only premium users have access to premium features
  return status.planType === 'premium';
}

/**
 * Refresh subscription data from Stripe (for real-time validation)
 */
export async function refreshSubscriptionFromStripe(userId: string): Promise<SubscriptionStatus> {
  try {
    const response = await fetch('/api/subscription/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh subscription from Stripe');
    }
    
    // After refresh, get updated status
    return await getSubscriptionStatus(userId, 0); // No retries since we just refreshed
  } catch (error) {
    console.error('Error refreshing subscription from Stripe:', error);
    // Fallback to cached data
    return await getSubscriptionStatus(userId);
  }
}

/**
 * Check subscription status with caching to avoid excessive API calls
 */
const subscriptionCache = new Map<string, { status: SubscriptionStatus; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedSubscriptionStatus(userId: string, forceRefresh = false): Promise<SubscriptionStatus> {
  const cacheKey = userId;
  const cached = subscriptionCache.get(cacheKey);
  
  // Return cached result if it's fresh and not forcing refresh
  if (!forceRefresh && cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.status;
  }
  
  // Fetch fresh data
  const status = await getSubscriptionStatus(userId);
  
  // Cache the result
  subscriptionCache.set(cacheKey, {
    status,
    timestamp: Date.now(),
  });
  
  return status;
}

/**
 * Create a test subscription for development/testing purposes
 * This bypasses Stripe webhooks and directly creates a subscription in the database
 */
export async function createTestSubscription(
  userId: string, 
  planType: 'pro' | 'premium'
): Promise<{ success: boolean; error?: string; subscription?: Subscription }> {
  try {
    const supabase = createClient();
    
    const subscriptionData = {
      user_id: userId,
      stripe_customer_id: 'test_customer_' + Date.now(),
      stripe_subscription_id: 'test_sub_' + Date.now(),
      status: 'active' as const,
      plan_type: planType,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Update usage limits
    const limits = {
      pro: 25,
      premium: 75,
    };

    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const { error: usageError } = await supabase
      .from('usage_tracking')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        plan_limit: limits[planType],
        generations_used: 0,
      }, {
        onConflict: 'user_id,month_year'
      });

    if (usageError) {
      console.warn('Usage update failed:', usageError.message);
    }

    return { success: true, subscription: data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Clear subscription cache for a user (useful after subscription changes)
 */
export function clearSubscriptionCache(userId?: string) {
  if (userId) {
    subscriptionCache.delete(userId);
  } else {
    subscriptionCache.clear();
  }
}