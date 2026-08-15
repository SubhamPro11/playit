import React from 'react';
import { Heart } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { SortControl, SortOption } from './SortControl';
import { LiveVisitorsBadge } from './LiveVisitorsBadge';
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
}) => {
  const isFiltered = selectedCategory !== 'All' || favoritesOnly;

  return (
    <header className="sticky top-0 z-30 bg-[#08080a]/95 backdrop-blur-md border-b border-[#26262a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Beautiful Brand Logo */}
        <BrandLogo />

        {/* Controls Toolbar (Clean & Uncluttered - No Category Buttons) */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-end">
          
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
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-mono text-xs font-medium transition-all cursor-pointer border shadow-xs ${
              favoritesOnly
                ? 'bg-red-500/15 text-red-400 border-red-500/50 font-semibold ring-1 ring-red-500/20'
                : 'bg-[#141418] hover:bg-[#1f1f26] text-zinc-300 hover:text-white border-[#27272a] hover:border-[#3f3f46]'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                favoritesOnly ? 'fill-red-500 text-red-500' : 'text-zinc-400'
              }`}
            />
            <span className="hidden sm:inline">Favorites only</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600/30 text-red-300 text-[10px] font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Live Visitor Counter Badge */}
          <LiveVisitorsBadge />

          {/* Video Counter Badge */}
          <div className="px-3.5 py-2 rounded-xl bg-[#141418] border border-[#27272a] text-zinc-300 font-mono text-xs whitespace-nowrap shadow-xs">
            {isFiltered ? (
              <>
                <span className="text-red-400 font-bold">{filteredItemsCount}</span> of {totalItems}
              </>
            ) : (
              <>
                <span className="text-red-400 font-bold">{totalItems}</span> videos
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
