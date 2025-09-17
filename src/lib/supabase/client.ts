import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your environment configuration.');
  }
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your environment configuration.');
  }
  return key;
}

// Allow passing a minimal options object to toggle detectSessionInUrl when needed (e.g., on /auth/callback)
export function createClient(options?: { detectSessionInUrl?: boolean }) {
  // Always create a fresh instance to avoid caching issues with auth state
  supabaseInstance = createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: options?.detectSessionInUrl ?? true,
        flowType: 'pkce',
      },
    }
  );

  return supabaseInstance;
}

// Function to clear the cached instance (useful for testing or after sign out)
export function clearClientCache() {
  console.log('Supabase client: Clearing cached instance');
  if (supabaseInstance) {
    // If there are any cleanup methods on the instance, call them
    try {
      // Force close any existing connections
      supabaseInstance.removeAllChannels?.();
    } catch (error) {
      console.log('Supabase client: Error during cleanup:', error);
    }
  }
  supabaseInstance = null;
  console.log('Supabase client: Cache cleared');
}