"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient, clearClientCache } from '../../lib/supabase/client';
import { Database } from '../../lib/types/database';

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
    try {
      console.log('AuthProvider: Starting sign out process');
      const supabase = getSupabase();
      
      // Sign out from Supabase first
      console.log('AuthProvider: Calling Supabase signOut');
      const { error } = await supabase.auth.signOut({
        scope: 'global' // This ensures sign out from all sessions
      });
      
      if (error) {
        console.error('AuthProvider: Supabase signOut error:', error);
        // Continue with cleanup even if there's an error
      } else {
        console.log('AuthProvider: Supabase signOut successful');
      }
      
      // Clear all Supabase-related localStorage keys
      if (typeof window !== 'undefined') {
        console.log('AuthProvider: Clearing all localStorage data');
        
        // Clear our custom auth redirect
        localStorage.removeItem('auth_redirect_to');
        
        // Clear all Supabase-related keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log(`AuthProvider: Removed localStorage key: ${key}`);
        });
        
        // Also clear sessionStorage
        const sessionKeysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
            sessionKeysToRemove.push(key);
          }
        }
        
        sessionKeysToRemove.forEach(key => {
          sessionStorage.removeItem(key);
          console.log(`AuthProvider: Removed sessionStorage key: ${key}`);
        });
      }
      
      // Clear local state
       console.log('AuthProvider: Clearing local state');
       setUser(null);
       setSession(null);
       setProfile(null);
       setSubscription(null);
       setUsage(null);
       
       // Clear the Supabase client cache to ensure fresh instance
       console.log('AuthProvider: Clearing Supabase client cache');
       clearClientCache();
       
       console.log('AuthProvider: Sign out process completed successfully');
      
    } catch (error) {
      console.error('AuthProvider: Error during sign out:', error);
      
      // Even if there's an error, clear everything locally
      setUser(null);
      setSession(null);
      setProfile(null);
      setSubscription(null);
      setUsage(null);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_redirect_to');
        // Clear Supabase keys even on error
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
       }
       
       // Clear the Supabase client cache even on error
       console.log('AuthProvider: Clearing Supabase client cache after error');
       clearClientCache();
       
       console.log('AuthProvider: Forced local cleanup completed');
       // Don't throw the error - we want the UI to update even if there was a network issue
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider: Getting initial session...');
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