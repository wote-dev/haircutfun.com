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
  const [isSigningOut, setIsSigningOut] = useState(false);
  
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
      // Clear local state FIRST to immediately update UI
      setUser(null);
      setSession(null);
      setProfile(null);
      setSubscription(null);
      setUsage(null);
      
      const supabase = getSupabase();
      
      // Sign out from Supabase
      console.log('AuthProvider: Calling Supabase signOut');
      await supabase.auth.signOut({ scope: 'global' });
      console.log('AuthProvider: Supabase signOut completed');
      
      // AGGRESSIVE storage clearing to prevent session restoration
      if (typeof window !== 'undefined') {
        console.log('AuthProvider: Aggressively clearing ALL storage');
        
        // Get all keys before clearing
        const localKeys = [...Object.keys(localStorage)];
        const sessionKeys = [...Object.keys(sessionStorage)];
        
        // Clear ALL localStorage keys that could contain auth data
        localKeys.forEach(key => {
          if (key.startsWith('sb-') || 
              key.includes('supabase') || 
              key.includes('auth') ||
              key.includes('session') ||
              key.includes('token') ||
              key.includes('refresh') ||
              key.includes('access')) {
            console.log('AuthProvider: Removing localStorage key:', key);
            localStorage.removeItem(key);
          }
        });
        
        // Clear ALL sessionStorage keys that could contain auth data
        sessionKeys.forEach(key => {
          if (key.startsWith('sb-') || 
              key.includes('supabase') || 
              key.includes('auth') ||
              key.includes('session') ||
              key.includes('token') ||
              key.includes('refresh') ||
              key.includes('access')) {
            console.log('AuthProvider: Removing sessionStorage key:', key);
            sessionStorage.removeItem(key);
          }
        });
        
        // Clear our custom keys
        localStorage.removeItem('auth_redirect_to');
        localStorage.removeItem('auth_callback_in_progress');
        
        // Clear ALL cookies aggressively
        console.log('AuthProvider: Clearing ALL cookies');
        const cookies = document.cookie.split(";");
        
        cookies.forEach(function(c) { 
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
          
          if (name) {
            console.log('AuthProvider: Clearing cookie:', name);
            
            // Clear for multiple paths and domains
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
            
            // Also try clearing with secure flag
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;secure";
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname + ";secure";
          }
        });
      }
      
      // Clear Supabase client cache AFTER storage clearing
      console.log('AuthProvider: Clearing Supabase client cache');
      clearClientCache();
      
      console.log('AuthProvider: Sign out process completed successfully');
      
    } catch (error) {
      console.error('AuthProvider: Sign out error:', error);
      // Even on error, ensure local state is cleared
      setUser(null);
      setSession(null);
      setProfile(null);
      setSubscription(null);
      setUsage(null);
      
      // Still try to clear storage on error
      if (typeof window !== 'undefined') {
        const localKeys = [...Object.keys(localStorage)];
        localKeys.forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }
    } finally {
      // Clear the signing out flag
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    const supabase = getSupabase();
    
    // Get initial session with aggressive validation
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider: Getting initial session');
        
        // First, check if we have any auth-related storage that might be stale
        if (typeof window !== 'undefined') {
          const hasAuthStorage = Object.keys(localStorage).some(key => 
            key.startsWith('sb-') || key.includes('auth') || key.includes('session')
          );
          
          if (hasAuthStorage) {
            console.log('AuthProvider: Found potential auth storage, validating...');
          }
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
          // Clear any potentially corrupted storage
          if (typeof window !== 'undefined') {
            const localKeys = [...Object.keys(localStorage)];
            localKeys.forEach(key => {
              if (key.startsWith('sb-')) {
                console.log('AuthProvider: Clearing corrupted storage key:', key);
                localStorage.removeItem(key);
              }
            });
          }
          setSession(null);
          setUser(null);
          setProfile(null);
          setSubscription(null);
          setUsage(null);
          setLoading(false);
          return;
        }
        
        console.log('AuthProvider: Initial session:', session ? 'exists' : 'null');
        
        if (session && session.user) {
          // Validate the session is actually valid
          try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError || !userData.user) {
              console.log('AuthProvider: Session validation failed, clearing state');
              // Session is invalid, clear everything
              await supabase.auth.signOut({ scope: 'global' });
              setSession(null);
              setUser(null);
              setProfile(null);
              setSubscription(null);
              setUsage(null);
            } else {
              console.log('AuthProvider: Session validated successfully');
              setSession(session);
               setUser(session.user);
               await fetchUserData(session.user.id);
            }
          } catch (validationError) {
            console.error('AuthProvider: Session validation error:', validationError);
            // Clear invalid session
            setSession(null);
            setUser(null);
            setProfile(null);
            setSubscription(null);
            setUsage(null);
          }
        } else {
          console.log('AuthProvider: No valid session found');
          setSession(null);
          setUser(null);
          setProfile(null);
          setSubscription(null);
          setUsage(null);
        }
      } catch (error) {
        console.error('AuthProvider: Error in getInitialSession:', error);
        // On any error, ensure clean state
        setSession(null);
        setUser(null);
        setProfile(null);
        setSubscription(null);
        setUsage(null);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    // Listen for auth changes
     const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('AuthProvider: Auth state change:', event, session ? 'session exists' : 'no session');
      
      // Handle sign-out events immediately
      if (event === 'SIGNED_OUT' || !session) {
        console.log('AuthProvider: Handling sign-out event');
        setSession(null);
        setUser(null);
        setProfile(null);
        setSubscription(null);
        setUsage(null);
        setLoading(false);
        return;
      }
      
      // Handle sign-in events
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Don't process sign-in events if we're in the middle of signing out
        if (isSigningOut) {
          console.log('AuthProvider: Ignoring sign-in event during sign-out process');
          return;
        }
        
        console.log('AuthProvider: Processing sign-in event');
        setSession(session);
        setUser(session.user);
        await fetchUserData(session.user.id);
        setLoading(false);
      }
    });
    
    return () => {
      console.log('AuthProvider: Cleaning up auth state listener');
      authSubscription.unsubscribe();
    };
  }, [isSigningOut]);

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