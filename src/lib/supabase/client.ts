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

export function createClient() {
  // Return cached instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Create new instance with runtime validation and proper storage configuration
  supabaseInstance = createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  );

  return supabaseInstance;
}

// Function to clear the cached instance (useful for testing or after sign out)
export function clearClientCache() {
  supabaseInstance = null;
}