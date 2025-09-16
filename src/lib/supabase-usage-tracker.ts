"use client";

import { createClient } from './supabase/client';
import { Database } from './types/database';

type UsageTracking = Database['public']['Tables']['usage_tracking']['Row'];
type UsageTrackingInsert = Database['public']['Tables']['usage_tracking']['Insert'];
type UsageTrackingUpdate = Database['public']['Tables']['usage_tracking']['Update'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export interface UsageData {
  freeTriesUsed: number;
  maxFreeTries: number;
  isPremium: boolean;
  subscriptionType: 'free' | 'pro' | 'premium';
  lastUsed: string;
  monthYear: string;
}

const MAX_FREE_TRIES = 1;

// Get current month in YYYY-MM format
function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// Get usage data for authenticated user
export async function getUsageData(userId: string): Promise<UsageData> {
  const supabase = createClient();
  const currentMonth = getCurrentMonth();

  try {
    // Get current month's usage
    const { data: usageData, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single();

    // Get user's subscription
    const { data: subscriptionData, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If no usage record exists for this month, create one
    if (usageError && usageError.code === 'PGRST116') {
      const newUsage: UsageTrackingInsert = {
        user_id: userId,
        month_year: currentMonth,
        generations_used: 0,
        plan_limit: MAX_FREE_TRIES
      };

      const { data: createdUsage, error: createError } = await supabase
        .from('usage_tracking')
        .insert(newUsage)
        .select()
        .single();

      if (createError) {
        console.error('Error creating usage record:', createError);
        throw createError;
      }

      return {
        freeTriesUsed: 0,
        maxFreeTries: MAX_FREE_TRIES,
        isPremium: subscriptionData?.status === 'active',
        subscriptionType: subscriptionData?.status === 'active' 
          ? (subscriptionData.plan_type as 'pro' | 'premium') 
          : 'free',
        lastUsed: new Date().toISOString(),
        monthYear: currentMonth
      };
    }

    if (usageError) {
      console.error('Error fetching usage data:', usageError);
      throw usageError;
    }

    return {
      freeTriesUsed: usageData.generations_used,
      maxFreeTries: subscriptionData?.status === 'active' ? 999999 : MAX_FREE_TRIES,
      isPremium: subscriptionData?.status === 'active',
      subscriptionType: subscriptionData?.status === 'active' 
        ? (subscriptionData.plan_type as 'pro' | 'premium') 
        : 'free',
      lastUsed: usageData.updated_at,
      monthYear: usageData.month_year
    };
  } catch (error) {
    console.error('Error in getUsageData:', error);
    // Return default data on error
    return {
      freeTriesUsed: 0,
      maxFreeTries: MAX_FREE_TRIES,
      isPremium: false,
      subscriptionType: 'free',
      lastUsed: new Date().toISOString(),
      monthYear: currentMonth
    };
  }
}

// Update usage data in Supabase
export async function updateUsageData(
  userId: string, 
  updates: Partial<UsageTrackingUpdate>
): Promise<UsageData> {
  const supabase = createClient();
  const currentMonth = getCurrentMonth();

  try {
    const { data, error } = await supabase
      .from('usage_tracking')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .select()
      .single();

    if (error) {
      console.error('Error updating usage data:', error);
      throw error;
    }

    // Return updated usage data
    return await getUsageData(userId);
  } catch (error) {
    console.error('Error in updateUsageData:', error);
    throw error;
  }
}

// Check if user can use a free try
export async function canUseFreebie(userId: string): Promise<boolean> {
  const data = await getUsageData(userId);
  return data.freeTriesUsed < data.maxFreeTries;
}

// Check if user has premium access
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const data = await getUsageData(userId);
  return data.isPremium || data.subscriptionType === 'pro' || data.subscriptionType === 'premium';
}

// Use a free try (increment counter)
export async function useFreebie(userId: string): Promise<UsageData> {
  const currentData = await getUsageData(userId);
  
  if (currentData.freeTriesUsed >= currentData.maxFreeTries) {
    throw new Error('No free tries remaining');
  }

  return await updateUsageData(userId, {
    generations_used: currentData.freeTriesUsed + 1
  });
}

// Record premium usage
export async function usePremiumFeature(userId: string): Promise<UsageData> {
  const currentData = await getUsageData(userId);
  
  if (!currentData.isPremium) {
    throw new Error('User does not have premium access');
  }

  const supabase = createClient();
  const currentMonth = getCurrentMonth();

  // For premium users, just increment generations_used
  return await updateUsageData(userId, {
    generations_used: currentData.freeTriesUsed + 1
  });
}

// Get remaining free tries
export async function getRemainingFreeTries(userId: string): Promise<number> {
  const data = await getUsageData(userId);
  return Math.max(0, data.maxFreeTries - data.freeTriesUsed);
}

// Check if user needs to upgrade
export async function needsUpgrade(userId: string): Promise<boolean> {
  const canUse = await canUseFreebie(userId);
  const hasPremium = await hasPremiumAccess(userId);
  return !canUse && !hasPremium;
}

// Reset usage for current month (admin function)
export async function resetUsage(userId: string): Promise<UsageData> {
  return await updateUsageData(userId, {
    generations_used: 0
  });
}

// Get usage statistics (for admin/analytics)
export async function getUsageStats(userId: string): Promise<{
  currentMonth: UsageData;
  totalMonths: number;
  totalFreeUses: number;
  totalPremiumUses: number;
}> {
  const supabase = createClient();
  
  try {
    // Get all usage records for user
    const { data: allUsage, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('month_year', { ascending: false });

    if (error) {
      console.error('Error fetching usage stats:', error);
      throw error;
    }

    const currentMonth = await getUsageData(userId);
    const totalGenerations = allUsage?.reduce((sum, record) => sum + record.generations_used, 0) || 0;

    return {
      currentMonth,
      totalMonths: allUsage?.length || 0,
      totalFreeUses: totalGenerations,
      totalPremiumUses: 0 // Legacy field, keeping for compatibility
    };
  } catch (error) {
    console.error('Error in getUsageStats:', error);
    throw error;
  }
}

// Migrate localStorage data to Supabase (one-time migration helper)
export async function migrateLocalStorageData(userId: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const localData = localStorage.getItem('haircutfun_usage');
    if (!localData) return;

    const parsed = JSON.parse(localData);
    const currentMonth = getCurrentMonth();

    // Check if migration already done for this month
    const existingData = await getUsageData(userId);
    if (existingData.freeTriesUsed > 0) {
      // Data already exists, don't overwrite
      return;
    }

    // Migrate the data
    await updateUsageData(userId, {
      generations_used: parsed.freeTriesUsed || 0
    });

    // Clear localStorage after successful migration
    localStorage.removeItem('haircutfun_usage');
    console.log('Successfully migrated localStorage usage data to Supabase');
  } catch (error) {
    console.error('Error migrating localStorage data:', error);
  }
}