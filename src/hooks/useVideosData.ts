import { useState, useEffect, useCallback } from 'react';
import { Video } from '../types/video';
import { PLAYLIST, Category } from '../data/playlist';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_VIDEOS_KEY = 'max_playlist_custom_videos_v1';

export function useVideosData() {
  const [videos, setVideos] = useState<Video[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return PLAYLIST.videos;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all videos from Supabase
  const fetchVideos = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('videos')
        .select('*')
        .order('order_index', { ascending: true });

      if (fetchErr) {
        console.warn('Supabase fetch error, using local data fallback:', fetchErr.message);
      } else if (data && data.length > 0) {
        const mapped: Video[] = data.map((row) => ({
          id: row.id,
          orderIndex: row.order_index,
          title: row.title,
          externalLink: row.external_link,
          thumbnailUrl: row.thumbnail_url,
          category: row.category as Category,
          accentColor: row.accent_color || '#ef4444',
        }));
        setVideos(mapped);
        localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn('Error fetching from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and Supabase Realtime subscription
  useEffect(() => {
    fetchVideos();

    // Subscribe to real-time changes from Supabase `videos` table
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('public:videos')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'videos' },
          (payload) => {
            console.log('Supabase real-time update received:', payload);
            fetchVideos();
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [fetchVideos]);

  // Persist locally for instant offline cache
  const persistVideos = (newVideos: Video[]) => {
    setVideos(newVideos);
    try {
      localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(newVideos));
    } catch (e) {
      console.error('Error saving videos to localStorage', e);
    }
  };

  // Update existing video directly in Supabase
  const updateVideo = async (updated: Video): Promise<boolean> => {
    setError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: dbError } = await supabase
          .from('videos')
          .update({
            title: updated.title,
            external_link: updated.externalLink,
            thumbnail_url: updated.thumbnailUrl,
            category: updated.category,
            order_index: updated.orderIndex,
            accent_color: updated.accentColor || '#ef4444',
          })
          .eq('id', updated.id);

        if (dbError) {
          throw new Error(`Supabase update error: ${dbError.message}`);
        }
      }

      const updatedList = videos.map((v) => (v.id === updated.id ? updated : v));
      persistVideos(updatedList);
      return true;
    } catch (err) {
      const msg = (err as Error).message || 'Failed to update video';
      setError(msg);
      console.error('Update video error:', err);
      return false;
    }
  };

  // Delete video directly from Supabase
  const deleteVideo = async (id: string): Promise<boolean> => {
    setError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: dbError } = await supabase
          .from('videos')
          .delete()
          .eq('id', id);

        if (dbError) {
          throw new Error(`Supabase delete error: ${dbError.message}`);
        }
      }

      const updatedList = videos.filter((v) => v.id !== id);
      persistVideos(updatedList);
      return true;
    } catch (err) {
      const msg = (err as Error).message || 'Failed to delete video';
      setError(msg);
      console.error('Delete video error:', err);
      return false;
    }
  };

  // Add new video directly into Supabase
  const addVideo = async (newVideo: Omit<Video, 'id'>): Promise<boolean> => {
    setError(null);
    try {
      const newId = `vid-${Date.now()}`;
      const videoEntry: Video = {
        ...newVideo,
        id: newId,
        accentColor: newVideo.accentColor || '#ef4444',
      };

      if (isSupabaseConfigured && supabase) {
        const { error: dbError } = await supabase.from('videos').insert({
          id: newId,
          title: videoEntry.title,
          external_link: videoEntry.externalLink,
          thumbnail_url: videoEntry.thumbnailUrl,
          category: videoEntry.category,
          order_index: videoEntry.orderIndex,
          accent_color: videoEntry.accentColor,
        });

        if (dbError) {
          throw new Error(`Supabase insert error: ${dbError.message}`);
        }
      }

      const updatedList = [...videos, videoEntry];
      persistVideos(updatedList);
      return true;
    } catch (err) {
      const msg = (err as Error).message || 'Failed to add video';
      setError(msg);
      console.error('Add video error:', err);
      return false;
    }
  };

  // Reorder videos directly in Supabase
  const reorderVideos = async (reordered: Video[]): Promise<boolean> => {
    const updatedWithIndices = reordered.map((v, idx) => ({
      ...v,
      orderIndex: idx + 1,
    }));

    persistVideos(updatedWithIndices);

    if (isSupabaseConfigured && supabase) {
      try {
        for (const item of updatedWithIndices) {
          const { error: reorderErr } = await supabase
            .from('videos')
            .update({ order_index: item.orderIndex })
            .eq('id', item.id);
            
          if (reorderErr) {
            console.warn('Supabase reorder sync warning:', reorderErr.message);
          }
        }
      } catch (err) {
        console.warn('Supabase reorder sync error:', err);
      }
    }
    return true;
  };

  return {
    videos,
    loading,
    error,
    updateVideo,
    deleteVideo,
    addVideo,
    reorderVideos,
    fetchVideos,
  };
}
