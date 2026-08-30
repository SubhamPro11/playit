import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_REACTIONS_COUNTS_KEY = 'airwaves_reaction_counts';
const LOCAL_STORAGE_USER_REACTIONS_KEY = 'airwaves_user_reacted_stations';

export function useReactions() {
  // Reaction counts by station_id
  const [reactions, setReactions] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_REACTIONS_COUNTS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Local record of stations this browser has reacted to (abuse prevention)
  const [userReacted, setUserReacted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_REACTIONS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Fetch genuine counts from Supabase if configured
  useEffect(() => {
    let isMounted = true;

    async function fetchReactions() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('station_reactions')
            .select('station_id, count');

          if (!error && data && isMounted) {
            const counts: Record<string, number> = {};
            for (const row of data) {
              if (row.station_id && typeof row.count === 'number') {
                counts[row.station_id] = row.count;
              }
            }
            setReactions(counts);
            try {
              localStorage.setItem(LOCAL_STORAGE_REACTIONS_COUNTS_KEY, JSON.stringify(counts));
            } catch {
              // ignore
            }
          }
        } catch {
          // Keep local state on network/config failure
        }
      }
    }

    fetchReactions();

    // Multi-tab synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_USER_REACTIONS_KEY && e.newValue) {
        try {
          setUserReacted(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
      if (e.key === LOCAL_STORAGE_REACTIONS_COUNTS_KEY && e.newValue) {
        try {
          setReactions(JSON.parse(e.newValue));
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

  const addReaction = useCallback(async (stationId: string) => {
    // Abuse prevention: only allow 1 reaction per station per browser
    if (userReacted[stationId]) return;

    // Optimistically update local user state
    const nextUserReacted = { ...userReacted, [stationId]: true };
    setUserReacted(nextUserReacted);

    const currentCount = reactions[stationId] || 0;
    const nextReactions = { ...reactions, [stationId]: currentCount + 1 };
    setReactions(nextReactions);

    try {
      localStorage.setItem(LOCAL_STORAGE_USER_REACTIONS_KEY, JSON.stringify(nextUserReacted));
      localStorage.setItem(LOCAL_STORAGE_REACTIONS_COUNTS_KEY, JSON.stringify(nextReactions));
    } catch {
      // ignore
    }

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        // Try RPC first for atomic increment
        const { data, error } = await supabase.rpc('increment_reaction', {
          target_station_id: stationId,
        });

        if (error) {
          // Fallback direct upsert
          await supabase.from('station_reactions').upsert({
            station_id: stationId,
            count: nextReactions[stationId],
            updated_at: new Date().toISOString(),
          }, { onConflict: 'station_id' });
        } else if (typeof data === 'number') {
          setReactions((prev) => ({ ...prev, [stationId]: data }));
        }
      } catch (err) {
        console.warn('Could not sync reaction to Supabase, saved locally:', err);
      }
    }
  }, [userReacted, reactions]);

  const hasReacted = useCallback(
    (stationId: string) => Boolean(userReacted[stationId]),
    [userReacted]
  );

  const getReactionCount = useCallback(
    (stationId: string) => reactions[stationId] || 0,
    [reactions]
  );

  return {
    reactions,
    userReacted,
    addReaction,
    hasReacted,
    getReactionCount,
  };
}
