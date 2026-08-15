import { useState, useMemo, useCallback, useEffect } from 'react';
import { CATEGORIES, Category } from './data/playlist';
import { PlaylistHeader } from './components/PlaylistHeader';
import { HeroSection } from './components/HeroSection';
import { CategoryJumpBar } from './components/CategoryJumpBar';
import { VideoCard } from './components/VideoCard';
import { CategoryRow } from './components/CategoryRow';
import { SiteFooter } from './components/SiteFooter';
import { SortOption } from './components/SortControl';
import { useFavorites } from './hooks/useFavorites';
import { useAdminAuth } from './hooks/useAdminAuth';
import { useVideosData } from './hooks/useVideosData';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';

export function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [currentSort, setCurrentSort] = useState<SortOption>('default');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [shuffleMap, setShuffleMap] = useState<Record<string, number>>({});

  const { favoriteIds, favoritesCount, toggleFavorite, isFavorite } = useFavorites();
  const { isAuthenticated, loading: authLoading, error: authError, login, logout, isSupabaseConfigured } = useAdminAuth();
  const { videos, updateVideo, deleteVideo, addVideo, reorderVideos } = useVideosData();

  // Pick 5 representative featured items for hero spotlight
  const featuredVideos = useMemo(() => {
    const spotlightIds = ['vid-01', 'vid-04', 'vid-23', 'vid-33', 'vid-37'];
    const found = videos.filter((v) => spotlightIds.includes(v.id));
    return found.length > 0 ? found : videos.slice(0, 5);
  }, [videos]);

  // Listen to browser navigation (popstate/hashchange)
  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdminRoute(
        window.location.pathname.startsWith('/admin') || window.location.hash === '#admin'
      );
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const navigateToPublic = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  // Trigger new random shuffle ordering on click
  const handleShuffle = useCallback(() => {
    const newMap: Record<string, number> = {};
    const ids = videos.map((v) => v.id);
    
    // Fisher-Yates shuffle
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    
    ids.forEach((id, idx) => {
      newMap[id] = idx;
    });

    setShuffleMap(newMap);
    setCurrentSort('shuffle');
  }, [videos]);

  // Smooth jump to category row on page
  const handleJumpToCategory = (cat: Category) => {
    if (searchQuery.trim() || selectedCategory !== 'All' || favoritesOnly || currentSort !== 'default') {
      setSelectedCategory(cat);
      setSearchQuery('');
    } else {
      const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const elem = document.getElementById(slug);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Determine active view mode:
  // If user has an active search, specific category filter, favorites-only, or custom sort => Flat Grid View.
  // Otherwise => Rich Row-Based Category Browsing View.
  const isFilteredGridView = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      selectedCategory !== 'All' ||
      favoritesOnly ||
      currentSort !== 'default'
    );
  }, [searchQuery, selectedCategory, favoritesOnly, currentSort]);

  // Filtered and Sorted Video List (for Flat Grid mode)
  const processedVideos = useMemo(() => {
    const filtered = videos.filter((video) => {
      if (favoritesOnly && !favoriteIds.includes(video.id)) {
        return false;
      }

      const matchCategory =
        selectedCategory === 'All' || video.category === selectedCategory;

      if (!searchQuery.trim()) return matchCategory;

      const query = searchQuery.toLowerCase().trim();
      const matchTitle = video.title.toLowerCase().includes(query);
      const matchDomain = video.externalLink.toLowerCase().includes(query);
      const matchCatText = video.category.toLowerCase().includes(query);

      return matchCategory && (matchTitle || matchDomain || matchCatText);
    });

    return [...filtered].sort((a, b) => {
      if (currentSort === 'az') {
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      }
      if (currentSort === 'za') {
        return b.title.localeCompare(a.title, undefined, { sensitivity: 'base' });
      }
      if (currentSort === 'shuffle') {
        const orderA = shuffleMap[a.id] ?? a.orderIndex;
        const orderB = shuffleMap[b.id] ?? b.orderIndex;
        return orderA - orderB;
      }
      return a.orderIndex - b.orderIndex;
    });
  }, [videos, searchQuery, selectedCategory, favoritesOnly, favoriteIds, currentSort, shuffleMap]);

  // Category Rows Data (for Row Browsing mode)
  const categoryRowsData = useMemo(() => {
    const realCategories = CATEGORIES.filter((c) => c !== 'All') as Category[];
    return realCategories.map((cat) => {
      const items = videos.filter((v) => v.category === cat);
      return {
        category: cat,
        videos: items,
      };
    });
  }, [videos]);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setFavoritesOnly(false);
    setCurrentSort('default');
  };

  // --- Admin Route View ---
  if (isAdminRoute) {
    if (!isAuthenticated) {
      return (
        <AdminLogin
          onLogin={login}
          error={authError}
          loading={authLoading}
          onBackToPublic={navigateToPublic}
          isSupabaseConfigured={isSupabaseConfigured}
        />
      );
    }

    return (
      <AdminDashboard
        videos={videos}
        onUpdateVideo={updateVideo}
        onDeleteVideo={deleteVideo}
        onAddVideo={addVideo}
        onReorderVideos={reorderVideos}
        onLogout={logout}
        onViewPublicSite={navigateToPublic}
      />
    );
  }

  // --- Public Single Playlist View ---
  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-zinc-200 font-sans">
      {/* Sticky Header with Brand Logo and Controls (No Category Chips in Header) */}
      <PlaylistHeader
        totalItems={videos.length}
        filteredItemsCount={processedVideos.length}
        favoritesCount={favoritesCount}
        favoritesOnly={favoritesOnly}
        onToggleFavoritesOnly={() => setFavoritesOnly((prev) => !prev)}
        selectedCategory={selectedCategory}
        currentSort={currentSort}
        onSelectSort={setCurrentSort}
        onShuffle={handleShuffle}
      />

      {/* Hero Section with Search Bar and Spotlight Pick */}
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        featuredVideos={featuredVideos}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />

      {/* Sticky Category Jump Bar in Row Browsing Mode */}
      {!isFilteredGridView && (
        <CategoryJumpBar
          onJumpToCategory={handleJumpToCategory}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* VIEW 1: Filtered / Search / Sorted Flat Grid Mode */}
        {isFilteredGridView ? (
          <div>
            {/* Filter Header Context Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#27272a]">
              <div>
                <h2 className="font-sans font-bold text-xl text-white">
                  {searchQuery ? `Search results for "${searchQuery}"` : selectedCategory !== 'All' ? selectedCategory : 'Filtered playlist'}
                </h2>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">
                  Showing <span className="text-red-400 font-bold">{processedVideos.length}</span> of {videos.length} videos
                </p>
              </div>

              <button
                onClick={handleClearAllFilters}
                className="px-3.5 py-1.5 rounded-xl bg-[#141418] hover:bg-[#1f1f26] text-zinc-300 hover:text-white font-mono text-xs border border-[#27272a] hover:border-red-500/40 transition-colors self-start sm:self-auto cursor-pointer"
              >
                Reset to all categories
              </button>
            </div>

            {/* Grid of Results */}
            {processedVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {processedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    variant="grid"
                    isFavorite={isFavorite(video.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search / Filter State */
              <div className="max-w-md mx-auto py-16 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#141418] border border-[#27272a] flex items-center justify-center mx-auto mb-4 text-red-500 font-mono text-base shadow-sm">
                  {favoritesOnly ? '♥' : '00'}
                </div>
                
                {favoritesOnly && favoritesCount === 0 ? (
                  <>
                    <h2 className="font-sans font-semibold text-lg text-white">
                      No favorite videos saved yet
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                      Click the heart icon on any card to save it to your local browser favorites list.
                    </p>
                    <button
                      onClick={() => setFavoritesOnly(false)}
                      className="mt-5 px-4 py-2 rounded-xl bg-[#141418] hover:bg-[#1f1f26] text-white border border-[#27272a] hover:border-red-500/40 font-mono text-xs font-medium transition-colors cursor-pointer shadow-xs"
                    >
                      Show all videos
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="font-sans font-semibold text-lg text-white">
                      No matching videos in this playlist
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                      {searchQuery
                        ? `No tracks match "${searchQuery}".`
                        : `No tracks found with the current filter settings.`}
                    </p>
                    <button
                      onClick={handleClearAllFilters}
                      className="mt-5 px-4 py-2 rounded-xl bg-[#141418] hover:bg-[#1f1f26] text-white border border-[#27272a] hover:border-red-500/40 font-mono text-xs font-medium transition-colors cursor-pointer shadow-xs"
                    >
                      Reset filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: Default Row-Based Category Browsing */
          <div className="space-y-10 sm:space-y-14">
            {categoryRowsData.map((row) => (
              <CategoryRow
                key={row.category}
                category={row.category}
                videos={row.videos}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                onViewAllCategory={(cat) => setSelectedCategory(cat)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Honest & Transparent Site Footer */}
      <SiteFooter totalVideos={videos.length} />
    </div>
  );
}

export default App;
