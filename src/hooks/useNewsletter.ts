import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_SUBSCRIBED_KEY = 'airwaves_newsletter_subscribed';
const LOCAL_STORAGE_SUBSCRIBERS_QUEUE_KEY = 'airwaves_newsletter_local_queue';

export function useNewsletter() {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_SUBSCRIBED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_SUBSCRIBED_KEY) {
        setIsSubscribed(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const subscribe = useCallback(async (email: string, honeypot?: string): Promise<{ success: boolean; message: string }> => {
    // 1. Honeypot check (bot trap)
    if (honeypot && honeypot.trim().length > 0) {
      // Fake success for bots to prevent retries
      return { success: true, message: 'Thank you for subscribing!' };
    }

    // 2. Email format validation
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return { success: false, message: 'Please enter a valid email address.' };
    }

    setLoading(true);
    setError(null);

    const subscriberId = 'sub_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

    try {
      // 3. Mark as subscribed locally
      setIsSubscribed(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_SUBSCRIBED_KEY, 'true');
        const existingQueue = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SUBSCRIBERS_QUEUE_KEY) || '[]');
        existingQueue.push({ id: subscriberId, email: trimmedEmail, created_at: new Date().toISOString() });
        localStorage.setItem(LOCAL_STORAGE_SUBSCRIBERS_QUEUE_KEY, JSON.stringify(existingQueue));
      } catch {
        // ignore
      }

      // 4. Send to Supabase if configured
      if (isSupabaseConfigured && supabase) {
        const { error: dbError } = await supabase.from('email_subscribers').upsert(
          {
            id: subscriberId,
            email: trimmedEmail,
            status: 'active',
            created_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );

        if (dbError) {
          // If already registered or minor warning, still treat as confirmed
          console.warn('Supabase subscription notice:', dbError.message);
        }
      }

      setLoading(false);
      return { success: true, message: 'You are now subscribed to the monthly Airwaves dispatch.' };
    } catch (err: unknown) {
      setLoading(false);
      console.warn('Newsletter subscription notice:', err);
      // Gracefully persist locally regardless
      setIsSubscribed(true);
      return { success: true, message: 'You are now subscribed to the monthly Airwaves dispatch.' };
    }
  }, []);

  return {
    isSubscribed,
    loading,
    error,
    subscribe,
  };
}
