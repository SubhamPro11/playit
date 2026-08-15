import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Generate a random anonymous session ID per tab/window
const getAnonymousSessionId = () => {
  return `anon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export function useLivePresence() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const sessionId = getAnonymousSessionId();

    if (isSupabaseConfigured && supabase) {
      // Supabase Realtime Presence Channel across all clients
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
          setVisitorCount(count);
          setIsConnected(true);
        })
        .on('presence', { event: 'join' }, () => {
          const state = channel.presenceState();
          setVisitorCount(Object.keys(state).length);
        })
        .on('presence', { event: 'leave' }, () => {
          const state = channel.presenceState();
          setVisitorCount(Object.keys(state).length);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              online_at: new Date().toISOString(),
            });
            setIsConnected(true);
          }
        });

      return () => {
        channel.untrack().finally(() => {
          if (supabase) {
            supabase.removeChannel(channel);
          }
        });
      };
    } else {
      // Local tab presence tracking using standard browser BroadcastChannel (for local dev without Supabase env)
      let activeSessions = new Set<string>([sessionId]);
      let broadcast: BroadcastChannel | null = null;

      try {
        broadcast = new BroadcastChannel('local_site_presence_channel');

        // Announce current tab session to other open tabs
        broadcast.postMessage({ type: 'JOIN', sessionId });
        setVisitorCount(activeSessions.size);
        setIsConnected(true);

        const pingInterval = setInterval(() => {
          if (broadcast) {
            broadcast.postMessage({ type: 'PING', sessionId });
          }
        }, 3000);

        broadcast.onmessage = (event) => {
          const { type, sessionId: remoteId } = event.data || {};
          if (!remoteId || remoteId === sessionId) return;

          if (type === 'JOIN' || type === 'PING') {
            activeSessions.add(remoteId);
            setVisitorCount(activeSessions.size);
            // Respond so the newly joined tab knows about this existing tab
            if (type === 'JOIN' && broadcast) {
              broadcast.postMessage({ type: 'ACK', sessionId });
            }
          } else if (type === 'ACK') {
            activeSessions.add(remoteId);
            setVisitorCount(activeSessions.size);
          } else if (type === 'LEAVE') {
            activeSessions.delete(remoteId);
            setVisitorCount(activeSessions.size);
          }
        };

        const handleUnload = () => {
          if (broadcast) {
            broadcast.postMessage({ type: 'LEAVE', sessionId });
          }
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
          clearInterval(pingInterval);
          window.removeEventListener('beforeunload', handleUnload);
          if (broadcast) {
            broadcast.postMessage({ type: 'LEAVE', sessionId });
            broadcast.close();
          }
        };
      } catch {
        setVisitorCount(1);
        setIsConnected(true);
      }
    }
  }, []);

  return {
    visitorCount,
    isConnected,
    isLoaded: visitorCount !== null,
  };
}
