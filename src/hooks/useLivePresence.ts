import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Generate a random anonymous session ID per tab/window
const getAnonymousSessionId = () => {
  return `anon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

let activePresenceChannel: any = null;
let presenceListeners = new Set<(count: number) => void>();
let activeCount = 1;

function notifyListeners(count: number) {
  activeCount = Math.max(count, 1);
  presenceListeners.forEach((fn) => fn(activeCount));
}

export function useLivePresence() {
  const [visitorCount, setVisitorCount] = useState<number>(activeCount);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const handleCountChange = (count: number) => {
      setVisitorCount(count);
      setIsConnected(true);
    };

    presenceListeners.add(handleCountChange);

    const sessionId = getAnonymousSessionId();

    // Initialize Supabase Presence once globally if possible
    if (isSupabaseConfigured && supabase && !activePresenceChannel) {
      try {
        const channel = supabase.channel('site-presence', {
          config: {
            presence: {
              key: sessionId,
            },
          },
        });

        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            const count = Object.keys(state).length;
            notifyListeners(count);
          })
          .on('presence', { event: 'join' }, () => {
            const state = channel.presenceState();
            notifyListeners(Object.keys(state).length);
          })
          .on('presence', { event: 'leave' }, () => {
            const state = channel.presenceState();
            notifyListeners(Object.keys(state).length);
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              try {
                await channel.track({
                  online_at: new Date().toISOString(),
                });
              } catch {
                // ignore
              }
            }
          });

        activePresenceChannel = channel;
      } catch (err) {
        console.warn('Realtime presence registration skipped:', err);
      }
    }

    // Local tab presence tracking using standard browser BroadcastChannel
    let broadcast: BroadcastChannel | null = null;
    let pingInterval: any = null;

    try {
      broadcast = new BroadcastChannel('local_site_presence_channel');
      broadcast.postMessage({ type: 'JOIN', sessionId });

      pingInterval = setInterval(() => {
        if (broadcast) {
          broadcast.postMessage({ type: 'PING', sessionId });
        }
      }, 4000);

      broadcast.onmessage = (event) => {
        const { type, sessionId: remoteId } = event.data || {};
        if (!remoteId || remoteId === sessionId) return;

        if (type === 'JOIN' && broadcast) {
          broadcast.postMessage({ type: 'ACK', sessionId });
        }
      };
    } catch {
      // BroadcastChannel not supported or restricted
    }

    return () => {
      presenceListeners.delete(handleCountChange);
      if (pingInterval) clearInterval(pingInterval);
      if (broadcast) {
        try {
          broadcast.postMessage({ type: 'LEAVE', sessionId });
          broadcast.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    visitorCount,
    isConnected,
    isLoaded: true,
  };
}

