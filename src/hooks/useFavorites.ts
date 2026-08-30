import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'airwaves_favorites';
const LEGACY_STORAGE_KEYS = ['playit_favorites', 'max_playlist_favs_v2'];

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const stored =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS[0]) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS[1]);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favoriteIds]);

  // Multi-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setFavoriteIds(JSON.parse(e.newValue));
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds]
  );

  return {
    favoriteIds,
    favoritesCount: favoriteIds.length,
    toggleFavorite,
    isFavorite,
  };
}

