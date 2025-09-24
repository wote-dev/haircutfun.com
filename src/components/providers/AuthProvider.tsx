"use client";

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient, clearClientCache } from '../../lib/supabase/client';
import { Database } from '../../lib/types/database';
import { useRouter } from 'next/navigation';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UsageTracking = Database['public']['Tables']['usage_tracking']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  usage: UsageTracking | null;
  loading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [usage, setUsage] = useState<UsageTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isSigningOutRef = useRef(false);
  const authSubscriptionRef = useRef<any>(null);
  const router = useRouter();

  // Add logging for loading state changes
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  
  const setLoadingWithLog = (newLoading: boolean) => {
    console.log(`AuthProvider: Setting loading from ${loadingRef.current} to ${newLoading}`);
    setLoading(newLoading);
  };

  // Log loading state changes
  useEffect(() => {
    console.log(`AuthProvider: Loading state changed to: ${loading}`);
  }, [loading]);
  
  // Lazy Supabase client initialization
  const getSupabase = () => {
    const isCallback = typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/auth/callback') ||
      !!localStorage.getItem('auth_callback_in_progress')
    );
    return createClient({ detectSessionInUrl: !isCallback });
  };

  const fetchUserData = async (userId: string) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout after 15 seconds')), 15000);
    });

    try {
      console.log('AuthProvider: Fetching user data for:', userId);
      const supabase = getSupabase();

      // Use the /api/user/profile endpoint which returns has_pro_access
      console.log('AuthProvider: Fetching user profile via /api/user/profile');
      const profileResponse = await fetch('/api/user/profile', { cache: 'no-store' });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('AuthProvider: Profile data received:', profileData);
        
        // Create a profile object that matches the expected structure
        const profile = {
          user_id: userId,
          has_pro_access: profileData.has_pro_access || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setProfile(profile);
      } else {
        console.warn('AuthProvider: Profile endpoint failed, setting default profile');
        setProfile({
          user_id: userId,
          has_pro_access: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Fetch current month usage (might not exist for new users)
      console.log('AuthProvider: Fetching usage data...');
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      console.log('AuthProvider: Current month:', currentMonth);
      const usagePromise = supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('month_year', currentMonth)
        .maybeSingle();

      const { data: usageData, error: usageError } = await Promise.race([usagePromise, timeoutPromise]) as any;
      console.log('AuthProvider: Usage fetch result:', { usageData, usageError });
      if (usageError && usageError.code !== 'PGRST116') {
        console.error('AuthProvider: Error fetching usage:', usageError);
      }

      setUsage(usageData || null);

      console.log('AuthProvider: fetchUserData completed successfully');
    } catch (error) {
      console.error('AuthProvider: Error fetching user data:', error);
      console.log('AuthProvider: Setting default values due to error');
      setProfile({
        user_id: userId,
        has_pro_access: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setUsage(null);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      console.log('AuthProvider: Manually refreshing user data...');
      await fetchUserData(user.id);
    }
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    try {
      // Store the intended redirect URL in localStorage
      if (redirectTo) {
        localStorage.setItem('auth_redirect_to', redirectTo);
      } else if (typeof window !== 'undefined') {
        // Store current page as fallback
        localStorage.setItem('auth_redirect_to', window.location.pathname + window.location.search);
      }
      
      const supabase = getSupabase();
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('AuthProvider: Initiating Google OAuth with redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'openid email profile',
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('AuthProvider: Starting sign out process');
    setIsSigningOut(true);
    isSigningOutRef.current = true;

    // Optimistically clear auth state so UI updates immediately
    setUser(null);
    setSession(null);
    setProfile(null);
    setSubscription(null);
    setUsage(null);
    
    try {
      // Proactively unsubscribe from auth state changes to avoid rehydration
      try {
        authSubscriptionRef.current?.unsubscribe();
        console.log('AuthProvider: Unsubscribed from auth state changes during sign out');
      } catch (e) {
        console.warn('AuthProvider: Failed to unsubscribe auth listener:', e);
      }

      const supabase = getSupabase();
      
      // Sign out from Supabase FIRST (client/local)
      console.log('AuthProvider: Calling Supabase signOut');
      await supabase.auth.signOut({ scope: 'global' });
      console.log('AuthProvider: Supabase signOut completed');

      // Also clear the server-side httpOnly cookies via API route
      try {
        await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
        console.log('AuthProvider: Server-side signOut completed');
      } catch (serverSignOutError) {
        console.error('AuthProvider: Server signOut error:', serverSignOutError);
      }
      
    } catch (error) {
      console.error('AuthProvider: Supabase signOut error:', error);
      // Continue with cleanup even if Supabase fails
    }

    // Clear all storage aggressively
    if (typeof window !== 'undefined') {
      console.log('AuthProvider: Clearing all storage');
      
      // Clear our custom keys
      localStorage.removeItem('auth_redirect_to');
      localStorage.removeItem('auth_callback_in_progress');
      
      // Get all storage keys before clearing
      const localKeys = Object.keys(localStorage);
      const sessionKeys = Object.keys(sessionStorage);
      
      // Clear ALL Supabase-related keys more aggressively
      localKeys.forEach(key => {
        if (key.startsWith('sb-') || 
            key.includes('supabase') || 
            key.includes('auth') ||
            key.includes('session') ||
            key.includes('token')) {
          console.log('AuthProvider: Removing localStorage key:', key);
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage too
      sessionKeys.forEach(key => {
        if (key.startsWith('sb-') || 
            key.includes('supabase') || 
            key.includes('auth') ||
            key.includes('session') ||
            key.includes('token')) {
          console.log('AuthProvider: Removing sessionStorage key:', key);
          sessionStorage.removeItem(key);
        }
      });
      
      // Also clear any cookies that might be set - be more aggressive
      console.log('AuthProvider: Clearing all cookies');
      const cookies = document.cookie.split(";");
      console.log('AuthProvider: Found cookies:', cookies);
      
      cookies.forEach(function(c) { 
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        console.log('AuthProvider: Clearing cookie:', name);
        
        // Clear for multiple paths and domains
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
      });
    }
    
    // Clear Supabase client cache
    console.log('AuthProvider: Clearing Supabase client cache');
    clearClientCache();
    
    console.log('AuthProvider: Sign out process completed');

    // Refresh the route so any server components read cleared cookies/state
    try {
      router.refresh();
    } catch (e) {
      console.warn('AuthProvider: router.refresh failed, attempting hard reload');
      if (typeof window !== 'undefined') window.location.reload();
    }
    
    // Clear the signing out flag after a delay to prevent immediate re-auth
    setTimeout(() => {
      setIsSigningOut(false);
      isSigningOutRef.current = false;
    }, 2000);
  };

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check if auth callback is in progress to avoid interference
        if (typeof window !== 'undefined' && localStorage.getItem('auth_callback_in_progress')) {
          console.log('AuthProvider: Auth callback in progress, skipping initial session check')
          setLoadingWithLog(false)
          return
        }
        
        console.log('AuthProvider: Getting initial session...')
        const supabase = getSupabase();
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error);
          setLoadingWithLog(false);
          return;
        }
        
        console.log('AuthProvider: Initial session:', initialSession ? 'Found' : 'None');
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          console.log('AuthProvider: Fetching initial user data');
          try {
            await fetchUserData(initialSession.user.id);
            console.log('AuthProvider: Initial user data fetch completed');
          } catch (fetchError) {
            console.error('AuthProvider: Error fetching initial user data:', fetchError);
          }
        }
        
        if (mounted) {
          console.log('AuthProvider: Setting loading to false after initial session check');
          setLoadingWithLog(false);
          console.log('AuthProvider: Initial session check complete');
        }
      } catch (error) {
        console.error('AuthProvider: Exception during initial session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const supabase = getSupabase();
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('AuthProvider: Auth state change:', event, session ? 'Session exists' : 'No session');
        
        if (!mounted) return;
        
        // If we're in the middle of signing out, ignore auth state changes (use ref to avoid stale closure)
        if (isSigningOutRef.current) {
          console.log('AuthProvider: Ignoring auth state change during sign out');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('AuthProvider: Fetching user data for authenticated user');
          try {
            await fetchUserData(session.user.id);
            console.log('AuthProvider: User data fetch completed');
          } catch (fetchError) {
            console.error('AuthProvider: Error fetching user data on auth change:', fetchError);
          }
        } else {
          console.log('AuthProvider: No session, clearing user data');
          setProfile(null);
          setUsage(null);
        }
        
        if (mounted) {
          console.log('AuthProvider: Setting loading to false after auth state change');
          setLoadingWithLog(false);
        }
      }
    );

    authSubscriptionRef.current = authSubscription;

    return () => {
      mounted = false;
      try {
        authSubscriptionRef.current?.unsubscribe();
        console.log('AuthProvider: Unsubscribed from auth state changes on unmount');
      } catch (e) {
        console.warn('AuthProvider: Failed to unsubscribe auth listener on cleanup:', e);
      }
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    profile,
    usage,
    loading,
    signInWithGoogle,
    signOut,
    refreshUserData,
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        usage,
        loading,
        signInWithGoogle,
        signOut,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}