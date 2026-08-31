import React from 'react';
import { Heart } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { SortControl, SortOption } from './SortControl';
import { LiveVisitorsBadge } from './LiveVisitorsBadge';
import { UserAuthControl } from './UserAuthControl';
import { ThemeToggle } from './ThemeToggle';
import { Category } from '../data/playlist';

interface PlaylistHeaderProps {
  totalItems: number;
  filteredItemsCount: number;
  favoritesCount: number;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  selectedCategory: Category;
  currentSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  onShuffle: () => void;
  onSurpriseMe?: () => void;
  onOpenAbout?: () => void;
  onOpenSuggest?: () => void;
}

export const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({
  totalItems,
  filteredItemsCount,
  favoritesCount,
  favoritesOnly,
  onToggleFavoritesOnly,
  selectedCategory,
  currentSort,
  onSelectSort,
  onShuffle,
  onSurpriseMe,
  onOpenAbout,
  onOpenSuggest,
}) => {
  const isFiltered = selectedCategory !== 'All' || favoritesOnly;

  return (
    <header className="sticky top-0 z-30 bg-surface-900/95 backdrop-blur-md border-b border-surface-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <BrandLogo />

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">
          
          {/* Surprise Me Random Picker Button */}
          {onSurpriseMe && (
            <button
              type="button"
              onClick={onSurpriseMe}
              title="Pick a random station from the 70 feeds"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-accent-400 hover:text-white bg-accent-500/10 hover:bg-accent-500 border border-accent-500/30 hover:border-accent-400 transition-all cursor-pointer shadow-xs group"
            >
              <span className="text-sm transition-transform group-hover:rotate-12">🎲</span>
              <span className="hidden md:inline group-hover:text-surface-950">Surprise me</span>
            </button>
          )}

          {/* Suggest Station Button */}
          {onOpenSuggest && (
            <button
              type="button"
              onClick={onOpenSuggest}
              className="px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium text-accent-400 hover:text-accent-300 bg-surface-850 hover:bg-surface-800 border border-surface-700 hover:border-accent-500/50 transition-all cursor-pointer hidden sm:inline-block"
            >
              + Suggest
            </button>
          )}

          {/* About Project Button */}
          {onOpenAbout && (
            <button
              type="button"
              onClick={onOpenAbout}
              className="px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-surface-850 hover:bg-surface-800 border border-surface-700 hover:border-surface-600 transition-all cursor-pointer"
            >
              About
            </button>
          )}

          {/* Sort Dropdown */}
          <SortControl
            currentSort={currentSort}
            onSelectSort={onSelectSort}
            onShuffle={onShuffle}
          />

          {/* Favorites Only Toggle */}
          <button
            type="button"
            onClick={onToggleFavoritesOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
              favoritesOnly
                ? 'bg-accent-500/15 text-accent-400 border-accent-500/40 font-semibold'
                : 'bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white border-surface-700 hover:border-surface-600'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                favoritesOnly ? 'fill-accent-500 text-accent-500' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-accent-500/20 text-accent-300 text-[10px] font-bold font-mono">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Optional Google Sign-In Control */}
          <UserAuthControl />

          {/* Theme Dark/Light Mode Toggle */}
          <ThemeToggle />

          {/* Live Listener Counter Badge */}
          <LiveVisitorsBadge />

          {/* Collection Counter Badge */}
          <div className="px-3 py-1.5 sm:py-2 rounded-xl bg-surface-850 border border-surface-700 text-slate-300 text-xs whitespace-nowrap">
            {isFiltered ? (
              <>
                <span className="text-accent-400 font-bold font-mono">{filteredItemsCount}</span> of {totalItems}
              </>
            ) : (
              <>
                <span className="text-accent-400 font-bold font-mono">{totalItems}</span> radio feeds
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
