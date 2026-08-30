import { useState, useEffect, useCallback } from 'react';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '../types/settings';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_SETTINGS_KEY = 'airwaves_site_settings';
const LEGACY_STORAGE_SETTINGS_KEY = 'playit_site_settings';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const stored =
        localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY) ||
        localStorage.getItem(LEGACY_STORAGE_SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // ignore JSON parse errors
    }
    return DEFAULT_SITE_SETTINGS;
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Fetch remote settings if Supabase is connected
  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', 'support_config')
            .maybeSingle();

          if (!error && data?.value && isMounted) {
            const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            const merged = { ...DEFAULT_SITE_SETTINGS, ...parsed };
            setSettings(merged);
            try {
              localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(merged));
            } catch {
              // ignore
            }
          }
        } catch {
          // Table doesn't exist or network error; local state remains active
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    }

    loadSettings();

    // Multi-tab synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_SETTINGS_KEY && e.newValue) {
        try {
          setSettings({ ...DEFAULT_SITE_SETTINGS, ...JSON.parse(e.newValue) });
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const updateSettings = useCallback(async (updates: Partial<SiteSettings>) => {
    const nextSettings: SiteSettings = {
      ...settings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setSettings(nextSettings);

    // Save locally
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(nextSettings));
    } catch (e) {
      console.error('Failed to save site settings to localStorage', e);
    }

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('site_settings')
          .upsert({
            key: 'support_config',
            value: nextSettings,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
      } catch (err) {
        console.warn('Supabase site_settings sync notice:', err);
      }
    }
  }, [settings]);

  const clearSupportQr = useCallback(async () => {
    await updateSettings({ supportQrUrl: '' });
  }, [updateSettings]);

  // The support section should only be active if explicitly enabled AND a valid QR image URL exists
  const isSupportActive = Boolean(
    settings.isEnabled && settings.supportQrUrl && settings.supportQrUrl.trim().length > 0
  );

  return {
    settings,
    loading,
    isSupportActive,
    updateSettings,
    clearSupportQr,
  };
}
