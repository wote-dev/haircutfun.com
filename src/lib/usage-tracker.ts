"use client";

// Re-export everything from the Supabase usage tracker
export {
  getUsageData,
  canUseFreebie,
  hasPremiumAccess,
  consumeFreebie as useFreebie,
  consumePremiumFeature as usePremiumFeature,
  resetUsage,
  getRemainingFreeTries,
  needsUpgrade,
  getUsageStats,
  migrateLocalStorageData
} from './supabase-usage-tracker';

// Legacy function names for backward compatibility
export async function saveUsageData(data: unknown): Promise<void> {
  // This is now handled automatically by the Supabase functions
  console.warn('saveUsageData is deprecated. Use the specific functions like useFreebie() instead.');
}

export async function upgradeToPremium(subscriptionType: 'pro' | 'premium' = 'pro'): Promise<void> {
  // This should be handled by Stripe webhooks, not directly
  console.warn('upgradeToPremium is deprecated. Subscriptions are managed through Stripe.');
}

// Keep the utility function for month calculation
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Legacy exports for backward compatibility
export { getCurrentMonth };