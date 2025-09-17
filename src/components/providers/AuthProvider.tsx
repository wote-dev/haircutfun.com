"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient, clearClientCache } from '../../lib/supabase/client';
import { Database } from '../../lib/types/database';
import { useRouter } from 'next/navigation';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type UsageTracking = Database['public']['Tables']['usage_tracking']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  subscription: Subscription | null;
  usage: UsageTracking | null;
  loading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  
  // Lazy Supabase client initialization
  const getSupabase = () => createClient();

  const fetchUserData = async (userId: string) => {
    try {
      console.log('AuthProvider: Fetching user data for:', userId);
      const supabase = getSupabase();
      
      // Fetch user profile (might not exist for new users)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('AuthProvider: Error fetching profile:', profileError);
      }
      
      // Fetch subscription (might not exist for new users)
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('AuthProvider: Error fetching subscription:', subscriptionError);
      }
      
      // Fetch current month usage (might not exist for new users)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('month_year', currentMonth)
        .maybeSingle();
      
      if (usageError && usageError.code !== 'PGRST116') {
        console.error('AuthProvider: Error fetching usage:', usageError);
      }
      
      console.log('AuthProvider: User data fetched successfully', {
        profile: !!profileData,
        subscription: !!subscriptionData,
        usage: !!usageData
      });
      
      setProfile(profileData || null);
      setSubscription(subscriptionData || null);
      setUsage(usageData || null);
    } catch (error) {
      console.error('AuthProvider: Unexpected error fetching user data:', error);
      // Set to null values so the app can continue
      setProfile(null);
      setSubscription(null);
      setUsage(null);
    }
  };

  const refreshUserData = async () => {
    if (user) {
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
    
    try {
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
    
    // Clear local state AFTER Supabase operations
    setUser(null);
    setSession(null);
    setProfile(null);
    setSubscription(null);
    setUsage(null);
    
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
          setLoading(false)
          return
        }
        
        console.log('AuthProvider: Getting initial session...')
        const supabase = getSupabase();
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error);
          setLoading(false);
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
          setLoading(false);
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
        
        // If we're in the middle of signing out, ignore auth state changes
        if (isSigningOut && session) {
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
          setSubscription(null);
          setUsage(null);
        }
        
        if (mounted) {
          console.log('AuthProvider: Setting loading to false after auth state change');
          setLoading(false);
        }
      }
    );

    return () => {
      let _ = mounted; // silence linter if needed
      mounted = false;
      authSubscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    profile,
    subscription,
    usage,
    loading,
    signInWithGoogle,
    signOut,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}