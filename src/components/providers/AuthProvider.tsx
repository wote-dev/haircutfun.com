"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '../../lib/supabase/client';
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
  signInWithGoogle: () => Promise<void>;
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
      const supabase = getSupabase();
      
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      // Fetch subscription
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      // Fetch current month usage
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('month_year', currentMonth)
        .single();
      
      setProfile(profileData);
      setSubscription(subscriptionData);
      setUsage(usageData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
      const supabase = getSupabase();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      setSubscription(null);
      setUsage(null);
      
      // Redirect to home page after successful sign out
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider: Getting initial session...');
        const supabase = getSupabase();
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('AuthProvider: Initial session:', initialSession ? 'Found' : 'None');
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchUserData(initialSession.user.id);
        }
        
        setLoading(false);
        console.log('AuthProvider: Initial session check complete');
      } catch (error) {
        console.error('AuthProvider: Exception during initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const supabase = getSupabase();
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setProfile(null);
          setSubscription(null);
          setUsage(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
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