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
  const { user, profile, usage, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // For non-authenticated users, use localStorage
  const localData = !user ? getLocalStorageUsage() : { freeTriesUsed: 0 };

  // Use data from AuthProvider context
  const hasProAccess = profile?.has_pro_access || false;
  const freeTriesUsed = user ? (usage?.generations_used || 0) : localData.freeTriesUsed;
  const isLoading = loading;

  // Determine if user can generate
  const canGenerate = hasProAccess || freeTriesUsed === 0;

  return {
    hasProAccess,
    freeTriesUsed,
    canGenerate,
    isLoading,
    error
  };
}