"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  getUsageData,
  canUseFreebie,
  hasPremiumAccess,
  useFreebie,
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

export function useUsageTracker() {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load usage data on mount and when user changes
  useEffect(() => {
    async function loadUsageData() {
      if (!user) {
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
  const useFreeTry = async () => {
    if (!user || !usageData) {
      throw new Error('User not authenticated');
    }
    
    if (!canUseFreebie(usageData)) {
      throw new Error('No free tries remaining');
    }
    
    try {
      const updatedData = await useFreebie(user.id);
      setUsageData(updatedData);
      return updatedData;
    } catch (err) {
      console.error('Error using free try:', err);
      throw err;
    }
  };

  return {
    // State
    usageData,
    isLoading,
    error,
    isAuthenticated: !!user,
    
    // Computed values (sync versions based on current data)
    canUseFree: usageData ? usageData.freeTriesUsed < usageData.maxFreeTries : false,
    hasPremium: usageData ? usageData.isPremium : false,
    remainingTries: usageData ? Math.max(0, usageData.maxFreeTries - usageData.freeTriesUsed) : 0,
    needsUpgrade: usageData ? !usageData.isPremium && usageData.freeTriesUsed >= usageData.maxFreeTries : false,
    
    // Actions
    useFreeTry,
    refreshUsage
  };
}