import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface UserAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useUserAuth(): UserAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Record sign-in in Supabase
    const recordUserSignin = async (userId: string) => {
      if (!supabase || !isSupabaseConfigured) return;
      try {
        await supabase.from('user_signins').upsert(
          {
            user_id: userId,
            last_signed_in_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      } catch {
        // Silent non-blocking failure
      }
    };

    // Get current active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        recordUserSignin(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth state transitions (OAuth redirects, token refresh, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        recordUserSignin(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase is not configured.');
      return;
    }

    try {
      const siteOrigin = typeof window !== 'undefined' && window.location.origin
        ? `${window.location.origin}/`
        : (import.meta.env.VITE_SITE_URL || 'https://airwaves.dpdns.org/');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: siteOrigin,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error.message);
      }
    } catch (err) {
      console.error('Failed to initiate Google sign-in:', err);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  }, []);

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };
}
