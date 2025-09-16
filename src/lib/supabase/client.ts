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

  // Create new instance with runtime validation
  supabaseInstance = createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  );

  return supabaseInstance;
}