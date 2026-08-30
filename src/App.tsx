import { useState, useMemo, useCallback, useEffect } from 'react';
import { CATEGORIES, Category } from './data/playlist';
import { PlaylistHeader } from './components/PlaylistHeader';
import { HeroSection } from './components/HeroSection';
import { CategoryJumpBar } from './components/CategoryJumpBar';
import { VideoCard } from './components/VideoCard';
import { CategoryRow } from './components/CategoryRow';
import { SiteFooter } from './components/SiteFooter';
import { SortOption } from './components/SortControl';
import { StationSubmission, CATEGORY_FALLBACK_THUMBNAILS, DEFAULT_FALLBACK_THUMBNAIL } from './types/video';
import { useFavorites } from './hooks/useFavorites';
import { useAdminAuth } from './hooks/useAdminAuth';
import { useVideosData } from './hooks/useVideosData';
import { useSubmissions } from './hooks/useSubmissions';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AboutModal } from './components/AboutModal';
import { NotFoundPage } from './components/NotFoundPage';
import { SuggestStationModal } from './components/SuggestStationModal';

type AppRoute = 'public' | 'admin' | 'not_found';

function getInitialRoute(): AppRoute {
  const path = window.location.pathname;
  if (path.startsWith('/admin') || window.location.hash === '#admin') {
    return 'admin';
  }
  if (path === '/' || path === '/index.html' || path === '') {
    return 'public';
  }
  return 'not_found';
}

export function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [currentSort, setCurrentSort] = useState<SortOption>('default');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [shuffleMap, setShuffleMap] = useState<Record<string, number>>({});
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  const { favoriteIds, favoritesCount, toggleFavorite, isFavorite } = useFavorites();
  const { isAuthenticated, loading: authLoading, error: authError, login, logout, isSupabaseConfigured } = useAdminAuth();
  const { videos, updateVideo, deleteVideo, addVideo, reorderVideos } = useVideosData();
  const { submissions, submitStation, updateSubmissionStatus, deleteSubmission } = useSubmissions();

  const handleApproveSubmission = async (sub: StationSubmission) => {
    const fallbackThumb = CATEGORY_FALLBACK_THUMBNAILS[sub.category] || DEFAULT_FALLBACK_THUMBNAIL;
    const ok = await addVideo({
      orderIndex: videos.length + 1,
      title: sub.name,
      externalLink: sub.url,
      thumbnailUrl: fallbackThumb,
      category: sub.category as Category,
      accentColor: '#f59e0b',
    });
    if (ok) {
      await updateSubmissionStatus(sub.id, 'approved');
      return true;
    }
    return false;
  };

  // Pick 5 representative featured items for hero spotlight
  const featuredVideos = useMemo(() => {
    const spotlightIds = ['vid-01', 'vid-04', 'vid-23', 'vid-33', 'vid-37'];
    const found = videos.filter((v) => spotlightIds.includes(v.id));
    return found.length > 0 ? found : videos.slice(0, 5);
  }, [videos]);

  // Listen to browser navigation (popstate/hashchange)
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(getInitialRoute());
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
    setCurrentRoute('public');
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

  // --- 404 Route View ---
  if (currentRoute === 'not_found') {
    return <NotFoundPage onBackToHome={navigateToPublic} />;
  }

  // --- Admin Route View ---
  if (currentRoute === 'admin') {
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
        submissions={submissions}
        isSupabaseConfigured={isSupabaseConfigured}
        onUpdateVideo={updateVideo}
        onDeleteVideo={deleteVideo}
        onAddVideo={addVideo}
        onReorderVideos={reorderVideos}
        onApproveSubmission={handleApproveSubmission}
        onRejectSubmission={(id) => updateSubmissionStatus(id, 'rejected')}
        onDeleteSubmission={deleteSubmission}
        onLogout={logout}
        onViewPublicSite={navigateToPublic}
      />
    );
  }

  // --- Public Single Playlist View ---
  return (
    <div className="min-h-screen flex flex-col bg-surface-900 text-slate-200 font-sans">
      {/* Sticky Header with Brand Logo and Controls */}
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
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenSuggest={() => setIsSuggestOpen(true)}
      />

      {/* Hero Section with Search Bar, Category Chips, and Spotlight Pick */}
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-surface-700">
              <div>
                <h2 className="font-sans font-bold text-xl text-white">
                  {searchQuery ? `Search results for "${searchQuery}"` : selectedCategory !== 'All' ? selectedCategory : 'Filtered playlist'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Showing <span className="text-accent-400 font-bold font-mono">{processedVideos.length}</span> of {videos.length} feeds
                </p>
              </div>

              <button
                onClick={handleClearAllFilters}
                className="px-3.5 py-1.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white text-xs font-medium border border-surface-700 hover:border-surface-600 transition-colors self-start sm:self-auto cursor-pointer"
              >
                Reset to all channels
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
                <div className="w-12 h-12 rounded-xl bg-surface-850 border border-surface-700 flex items-center justify-center mx-auto mb-4 text-accent-500 font-mono text-base shadow-sm">
                  {favoritesOnly ? '♥' : '00'}
                </div>
                
                {favoritesOnly && favoritesCount === 0 ? (
                  <>
                    <h2 className="font-sans font-semibold text-lg text-white">
                      No favorite feeds saved yet
                    </h2>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Click the heart icon on any card to save it to your local browser favorites.
                    </p>
                    <button
                      onClick={() => setFavoritesOnly(false)}
                      className="mt-5 px-4 py-2 rounded-xl bg-surface-850 hover:bg-surface-800 text-white border border-surface-700 hover:border-surface-600 text-xs font-medium transition-colors cursor-pointer shadow-sm"
                    >
                      Show all feeds
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="font-sans font-semibold text-lg text-white">
                      No matching audio feeds found
                    </h2>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {searchQuery
                        ? `No channels match "${searchQuery}".`
                        : `No feeds found with the current filter settings.`}
                    </p>
                    <button
                      onClick={handleClearAllFilters}
                      className="mt-5 px-4 py-2 rounded-xl bg-surface-850 hover:bg-surface-800 text-white border border-surface-700 hover:border-surface-600 text-xs font-medium transition-colors cursor-pointer shadow-sm"
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
      <SiteFooter
        totalVideos={videos.length}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenSuggest={() => setIsSuggestOpen(true)}
      />

      {/* Curation & About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Suggest Station Modal */}
      <SuggestStationModal
        isOpen={isSuggestOpen}
        onClose={() => setIsSuggestOpen(false)}
        onSubmitStation={submitStation}
      />
    </div>
  );
}

export default App;
