import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { CATEGORIES, Category } from './data/playlist';
import { PlaylistHeader } from './components/PlaylistHeader';
import { HeroSection } from './components/HeroSection';
import { CategoryJumpBar } from './components/CategoryJumpBar';
import { VideoCard } from './components/VideoCard';
import { CategoryRow } from './components/CategoryRow';
import { SiteFooter } from './components/SiteFooter';
import { SortOption } from './components/SortControl';
import { Video, StationSubmission, CATEGORY_FALLBACK_THUMBNAILS, DEFAULT_FALLBACK_THUMBNAIL } from './types/video';
import { useFavorites } from './hooks/useFavorites';
import { useAdminAuth } from './hooks/useAdminAuth';
import { useVideosData } from './hooks/useVideosData';
import { useSubmissions } from './hooks/useSubmissions';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AboutModal } from './components/AboutModal';
import { NotFoundPage } from './components/NotFoundPage';
import { SuggestStationModal } from './components/SuggestStationModal';
import { StationPermalinkPage } from './components/StationPermalinkPage';
import { SupportSection } from './components/SupportSection';
import { NewsletterSection } from './components/NewsletterSection';
import { useSiteSettings } from './hooks/useSiteSettings';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useReactions } from './hooks/useReactions';
import { findStationBySlugOrId, getStationSlug } from './utils/slug';

type AppRoute = 'public' | 'admin' | 'station' | 'not_found';

interface RouteState {
  route: AppRoute;
  stationSlug?: string;
}

function parseLocation(): RouteState {
  const path = window.location.pathname;
  if (path.startsWith('/admin') || window.location.hash === '#admin') {
    return { route: 'admin' };
  }
  if (path === '/' || path === '/index.html' || path === '') {
    return { route: 'public' };
  }
  const entryMatch = path.match(/^\/(?:entry|station)\/([^/?#]+)/i);
  if (entryMatch) {
    return { route: 'station', stationSlug: entryMatch[1] };
  }
  return { route: 'not_found' };
}

export function App() {
  const [routeState, setRouteState] = useState<RouteState>(parseLocation);

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
  const { settings: siteSettings, isSupportActive } = useSiteSettings();
  const { addReaction, hasReacted, getReactionCount } = useReactions();

  // Enable arrow-key card navigation & slash shortcut on public catalog
  useKeyboardNav(routeState.route === 'public' && !isAboutOpen && !isSuggestOpen);

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

  // Feature recently added entries in Spotlight (newest take rank #1 and #2), with curated fallback
  const featuredVideos = useMemo(() => {
    // 1. Identify valid recent additions with dateAdded within 7-day window
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const recentEntries = videos
      .filter((v) => {
        if (!v.dateAdded) return false;
        const time = new Date(v.dateAdded).getTime();
        return !isNaN(time) && now - time <= SEVEN_DAYS_MS;
      })
      .sort((a, b) => new Date(b.dateAdded!).getTime() - new Date(a.dateAdded!).getTime());

    // Up to 2 newest entries take #1 and #2
    const topRecent = recentEntries.slice(0, 2);
    const topRecentIds = new Set(topRecent.map((v) => v.id));

    // Curated default fallback pool
    const defaultSpotlightIds = ['vid-01', 'vid-04', 'vid-23', 'vid-33', 'vid-37'];
    const curatedPool = defaultSpotlightIds
      .map((id) => videos.find((v) => v.id === id))
      .filter((v): v is Video => Boolean(v) && !topRecentIds.has(v!.id));

    // Also include other catalog videos as extra fallback if needed
    const remainingFallback = videos.filter(
      (v) => !topRecentIds.has(v.id) && !curatedPool.some((c) => c.id === v.id)
    );

    const combined = [...topRecent, ...curatedPool, ...remainingFallback];
    return combined.slice(0, 5);
  }, [videos]);

  // Listen to browser navigation (popstate/hashchange)
  useEffect(() => {
    const handleRouteChange = () => {
      setRouteState(parseLocation());
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
    setRouteState({ route: 'public' });
  };

  const lastRandomIdRef = useRef<string | null>(null);

  const navigateToStation = (slug: string) => {
    window.history.pushState({}, '', `/entry/${slug}`);
    setRouteState({ route: 'station', stationSlug: slug });
  };

  // Surprise Me - picks a random station without repeating the same one twice in a row
  const handleSurpriseMe = useCallback(() => {
    if (videos.length === 0) return;
    const eligible = videos.length > 1 && lastRandomIdRef.current
      ? videos.filter((v) => v.id !== lastRandomIdRef.current)
      : videos;

    const chosen = eligible[Math.floor(Math.random() * eligible.length)];
    if (!chosen) return;

    lastRandomIdRef.current = chosen.id;
    const slug = getStationSlug(chosen.title);
    window.history.pushState({}, '', `/entry/${slug}`);
    setRouteState({ route: 'station', stationSlug: slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [videos]);

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
      // 1. Search Query filter (matches title, clean domain, or category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanDomain = video.externalLink.replace(/^https?:\/\//, '').toLowerCase();
        const matchesTitle = video.title.toLowerCase().includes(q);
        const matchesDomain = cleanDomain.includes(q);
        const matchesCategory = video.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDomain && !matchesCategory) {
          return false;
        }
      }

      // 2. Category selection filter
      if (selectedCategory !== 'All' && video.category !== selectedCategory) {
        return false;
      }

      // 3. Favorites only toggle
      if (favoritesOnly && !favoriteIds.includes(video.id)) {
        return false;
      }

      return true;
    });

    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (currentSort === 'az') {
        return a.title.localeCompare(b.title);
      }
      if (currentSort === 'za') {
        return b.title.localeCompare(a.title);
      }
      if (currentSort === 'shuffle') {
        return (shuffleMap[a.id] ?? 0) - (shuffleMap[b.id] ?? 0);
      }
      // Default: Original curation order index
      return a.orderIndex - b.orderIndex;
    });
  }, [videos, searchQuery, selectedCategory, favoritesOnly, favoriteIds, currentSort, shuffleMap]);

  // Group videos by category for standard row view
  const categorizedVideos = useMemo(() => {
    return CATEGORIES.filter((c) => c !== 'All').map((cat) => {
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

  // --- Station Dedicated Permalink Route View ---
  if (routeState.route === 'station') {
    const station = findStationBySlugOrId(videos, routeState.stationSlug || '');
    if (station) {
      return (
        <StationPermalinkPage
          video={station}
          allVideos={videos}
          isFavorite={isFavorite(station.id)}
          onToggleFavorite={toggleFavorite}
          onNavigateHome={navigateToPublic}
          onNavigateStation={navigateToStation}
          onSurpriseMe={handleSurpriseMe}
          reactionCount={getReactionCount(station.id)}
          hasReacted={hasReacted(station.id)}
          onAddReaction={addReaction}
          getReactionCount={getReactionCount}
          hasReactedForId={hasReacted}
        />
      );
    }
    return <NotFoundPage onBackToHome={navigateToPublic} />;
  }

  // --- 404 Route View ---
  if (routeState.route === 'not_found') {
    return <NotFoundPage onBackToHome={navigateToPublic} />;
  }

  // --- Admin Route View ---
  if (routeState.route === 'admin') {
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
        onSurpriseMe={handleSurpriseMe}
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
        onSurpriseMe={handleSurpriseMe}
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
                  {favoritesOnly
                    ? searchQuery
                      ? `Favorites matching "${searchQuery}"`
                      : 'My Saved Favorites'
                    : searchQuery
                    ? `Search results for "${searchQuery}"`
                    : selectedCategory !== 'All'
                    ? selectedCategory
                    : 'Filtered playlist'}
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
                    onNavigatePermalink={navigateToStation}
                    reactionCount={getReactionCount(video.id)}
                    hasReacted={hasReacted(video.id)}
                    onAddReaction={addReaction}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search / Filter State */
              <div className="max-w-md mx-auto py-16 px-4 text-center">
                {favoritesOnly && favoritesCount === 0 ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center mx-auto mb-4 text-accent-400 shadow-md">
                      <Heart className="w-7 h-7 fill-accent-500 text-accent-500" />
                    </div>
                    <h2 className="font-sans font-bold text-xl text-white">
                      No favorite stations saved yet
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
                      Click the heart (<span className="text-accent-400 font-bold">♥</span>) on any station card or permalink page to pin your favorite soundscapes. Saved privately in your browser without requiring an account.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setFavoritesOnly(false)}
                        className="px-4 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-400 text-surface-950 text-xs font-bold transition-all cursor-pointer shadow-md hover:shadow-accent-500/20"
                      >
                        Explore 70 stations
                      </button>
                      <button
                        onClick={handleSurpriseMe}
                        className="px-4 py-2.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-slate-200 hover:text-white border border-surface-700 hover:border-surface-600 text-xs font-medium transition-all cursor-pointer"
                      >
                        🎲 Surprise me
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-surface-850 border border-surface-700 flex items-center justify-center mx-auto mb-4 text-accent-500 font-mono text-base shadow-sm">
                      00
                    </div>
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
            {categorizedVideos.map(({ category, videos: catVideos }) => (
              <CategoryRow
                key={category}
                category={category}
                videos={catVideos}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                onViewAllCategory={(cat) => setSelectedCategory(cat)}
                onNavigatePermalink={navigateToStation}
                getReactionCount={getReactionCount}
                hasReacted={hasReacted}
                onAddReaction={addReaction}
              />
            ))}
          </div>
        )}
      </main>

      {/* Monthly Newsletter Dispatch Section */}
      <NewsletterSection />

      {/* Admin-Configurable "Support Me" QR Section */}
      <SupportSection
        settings={siteSettings}
        isActive={isSupportActive}
      />

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
