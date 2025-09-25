"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

interface FreemiumData {
  hasProAccess: boolean;
  freeTriesUsed: number;
  canGenerate: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper function to get localStorage usage for non-authenticated users
function getLocalStorageUsage(): { freeTriesUsed: number } {
  if (typeof window === 'undefined') return { freeTriesUsed: 0 };
  
  try {
    const localData = localStorage.getItem('haircutfun_usage');
    if (!localData) return { freeTriesUsed: 0 };
    
    const parsed = JSON.parse(localData);
    return {
      freeTriesUsed: parsed.freeTriesUsed || 0
    };
  } catch {
    return { freeTriesUsed: 0 };
  }
}

export function useFreemiumAccess(): FreemiumData {
  const { user } = useAuth();
  const [hasProAccess, setHasProAccess] = useState(false);
  const [freeTriesUsed, setFreeTriesUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data on mount and when user changes
  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        // For non-authenticated users, check localStorage
        const localData = getLocalStorageUsage();
        setFreeTriesUsed(localData.freeTriesUsed);
        setHasProAccess(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user profile data
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const data = await response.json();
        setHasProAccess(data.has_pro_access || false);
        setFreeTriesUsed(data.free_tries_used || 0);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user data');
        // Fallback to non-authenticated behavior
        const localData = getLocalStorageUsage();
        setFreeTriesUsed(localData.freeTriesUsed);
        setHasProAccess(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, [user]);

  // Determine if user can generate
  // Pro users have unlimited access, free users get limited tries
  const canGenerate = hasProAccess || freeTriesUsed < 2;

  return {
    hasProAccess,
    freeTriesUsed,
    canGenerate,
    isLoading,
    error
  };
}