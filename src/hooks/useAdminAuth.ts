import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

const LOCAL_ADMIN_SESSION_KEY = 'max_playlist_admin_session';

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Check existing active Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(Boolean(session?.user));
        setLoading(false);
      });

      // Subscribe to Supabase auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(Boolean(session?.user));
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local dev session fallback when Supabase is not connected
      try {
        const localAuth = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
        if (localAuth === 'true') {
          setIsAuthenticated(true);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
  }, []);

  /**
   * Signs in using Supabase Auth.
   * Maps a simple username (e.g. 'morbius') to its backing email (e.g. 'morbius@playlist.local').
   */
  const login = async (usernameInput: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);

    const trimmed = usernameInput.trim().toLowerCase();
    // Resolve backing email for username
    const email = trimmed.includes('@') ? trimmed : `${trimmed}@playlist.app`;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return false;
        }

        setSession(data.session);
        setUser(data.user);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      } catch (err) {
        setError((err as Error).message || 'Authentication failed');
        setLoading(false);
        return false;
      }
    } else {
      // Local fallback for offline/local environment testing
      if (trimmed === 'morbius' && password === 'subhamkr11') {
        localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, 'true');
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      } else {
        setError('Invalid username or password.');
        setLoading(false);
        return false;
      }
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
    setSession(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    session,
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    isSupabaseConfigured,
  };
}
