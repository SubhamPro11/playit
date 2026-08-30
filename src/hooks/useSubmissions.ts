import { useState, useEffect, useCallback } from 'react';
import { StationSubmission } from '../types/video';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_SUBMISSIONS_KEY = 'playit_pending_submissions_v1';

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<StationSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [loading, setLoading] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: StationSubmission[] = data.map((row) => ({
          id: row.id,
          name: row.name,
          url: row.url,
          category: row.category || 'Radio & mixtapes',
          notes: row.notes || '',
          status: row.status as 'pending' | 'approved' | 'rejected',
          createdAt: row.created_at,
        }));
        setSubmissions(mapped);
        try {
          localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(mapped));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('public:submissions')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'submissions' },
          () => {
            fetchSubmissions();
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [fetchSubmissions]);

  // Submit a new station proposal (Publicly accessible with honeypot validation)
  const submitStation = async (
    name: string,
    url: string,
    category: string,
    notes?: string,
    honeypot?: string
  ): Promise<{ success: boolean; message: string }> => {
    // 1. Silent spam bot trap
    if (honeypot && honeypot.trim().length > 0) {
      return { success: true, message: 'Suggestion received! Thank you for curating with us.' };
    }

    // 2. Input validation
    if (!name.trim() || !url.trim()) {
      return { success: false, message: 'Station name and URL are required.' };
    }

    const cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      return { success: false, message: 'Please provide a valid web URL starting with http:// or https://' };
    }

    const newSub: StationSubmission = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sub-${Date.now()}`,
      name: name.trim(),
      url: cleanUrl,
      category: category.trim() || 'Radio & mixtapes',
      notes: notes?.trim() || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('submissions').insert({
          id: newSub.id,
          name: newSub.name,
          url: newSub.url,
          category: newSub.category,
          notes: newSub.notes,
          status: 'pending',
        });

        if (error) {
          console.warn('Supabase submission insert error:', error.message);
          // Fallback to local
        }
      } catch (err) {
        console.warn('Failed to insert into Supabase:', err);
      }
    }

    setSubmissions((prev) => {
      const updated = [newSub, ...prev.filter((s) => s.id !== newSub.id)];
      try {
        localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    return {
      success: true,
      message: 'Station submitted! It is now pending review in the curation queue.',
    };
  };

  const updateSubmissionStatus = async (id: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('submissions')
          .update({ status })
          .eq('id', id);

        if (error) {
          console.warn('Failed to update submission in Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Error updating submission status:', err);
      }
    }

    setSubmissions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, status } : s));
      try {
        localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    return true;
  };

  const deleteSubmission = async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('submissions').delete().eq('id', id);
      } catch (err) {
        console.warn('Error deleting submission:', err);
      }
    }

    setSubmissions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    return true;
  };

  return {
    submissions,
    pendingSubmissions: submissions.filter((s) => s.status === 'pending'),
    loading,
    submitStation,
    updateSubmissionStatus,
    deleteSubmission,
    refetchSubmissions: fetchSubmissions,
  };
}
