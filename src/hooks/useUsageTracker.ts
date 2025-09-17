"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  getUsageData,
  canUseFreebie,
  hasPremiumAccess,
  useFreebie as consumeFreeTry,
  getRemainingFreeTries,
  needsUpgrade,
  migrateLocalStorageData
} from '@/lib/usage-tracker';
// Define the UsageData interface for the hook
interface UsageData {
  freeTriesUsed: number;
  maxFreeTries: number;
  isPremium: boolean;
  subscriptionType: 'free' | 'pro' | 'premium';
  lastUsed: string;
  monthYear: string;
}

// Helper function to get localStorage usage for non-authenticated users
function getLocalStorageUsage(): { freeTriesUsed: number; maxFreeTries: number } {
  if (typeof window === 'undefined') return { freeTriesUsed: 0, maxFreeTries: 1 };
  
  try {
    const localData = localStorage.getItem('haircutfun_usage');
    if (!localData) return { freeTriesUsed: 0, maxFreeTries: 1 };
    
    const parsed = JSON.parse(localData);
    return {
      freeTriesUsed: parsed.freeTriesUsed || 0,
      maxFreeTries: 1 // Non-authenticated users get 1 free try
    };
  } catch {
    return { freeTriesUsed: 0, maxFreeTries: 1 };
  }
}

// Helper function to update localStorage usage for non-authenticated users
function updateLocalStorageUsage(freeTriesUsed: number) {
  if (typeof window === 'undefined') return;
  
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const data = {
      freeTriesUsed,
      lastUsed: new Date().toISOString(),
      monthYear: currentMonth
    };
    localStorage.setItem('haircutfun_usage', JSON.stringify(data));
  } catch (error) {
    console.error('Error updating localStorage usage:', error);
  }
}

export function useUsageTracker() {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [localUsage, setLocalUsage] = useState({ freeTriesUsed: 0, maxFreeTries: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load usage data on mount and when user changes
  useEffect(() => {
    async function loadUsageData() {
      if (!user) {
        // For non-authenticated users, use localStorage
        const localData = getLocalStorageUsage();
        setLocalUsage(localData);
        setUsageData(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Migrate localStorage data if this is the first time
        await migrateLocalStorageData(user.id);
        
        const data = await getUsageData(user.id);
        setUsageData(data);
      } catch (err) {
        console.error('Error loading usage data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load usage data');
      } finally {
        setIsLoading(false);
      }
    }

    loadUsageData();
  }, [user]);

  // Refresh usage data
  const refreshUsage = async () => {
    if (!user) return;
    
    try {
      setError(null);
      const data = await getUsageData(user.id);
      setUsageData(data);
    } catch (err) {
      console.error('Error refreshing usage data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh usage data');
    }
  };

  // Use a free try and update state
  const useFreeTry = (): Promise<UsageData | { freeTriesUsed: number; maxFreeTries: number }> => {
    return new Promise(async (resolve, reject) => {
      if (!user) {
        // Handle non-authenticated users with localStorage
        if (localUsage.freeTriesUsed >= localUsage.maxFreeTries) {
          reject(new Error('No free tries remaining'));
          return;
        }
        
        try {
          const newUsage = { ...localUsage, freeTriesUsed: localUsage.freeTriesUsed + 1 };
          updateLocalStorageUsage(newUsage.freeTriesUsed);
          setLocalUsage(newUsage);
          resolve(newUsage);
        } catch (err) {
          console.error('Error using free try for non-authenticated user:', err);
          reject(err);
        }
        return;
      }
      
      if (!usageData) {
        reject(new Error('Usage data not loaded'));
        return;
      }
      
      const canUse = await canUseFreebie(user.id);
      if (!canUse) {
        reject(new Error('No free tries remaining'));
        return;
      }
      
      try {
        const updatedData = await consumeFreeTry(user.id);
        setUsageData(updatedData);
        resolve(updatedData);
      } catch (err) {
        console.error('Error using free try:', err);
        reject(err);
      }
    });
  };

  return {
    // State
    usageData,
    isLoading,
    error,
    isAuthenticated: !!user,
    
    // Computed values (sync versions based on current data)
    canUseFree: user 
      ? (usageData ? usageData.freeTriesUsed < usageData.maxFreeTries : false)
      : localUsage.freeTriesUsed < localUsage.maxFreeTries,
    hasPremium: usageData ? usageData.isPremium : false,
    remainingTries: user 
      ? (usageData ? Math.max(0, usageData.maxFreeTries - usageData.freeTriesUsed) : 0)
      : Math.max(0, localUsage.maxFreeTries - localUsage.freeTriesUsed),
    needsUpgrade: user 
      ? (usageData ? !usageData.isPremium && usageData.freeTriesUsed >= usageData.maxFreeTries : false)
      : localUsage.freeTriesUsed >= localUsage.maxFreeTries,
    
    // Actions
    useFreeTry,
    refreshUsage
  };
}