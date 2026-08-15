import React from 'react';
import { Heart } from 'lucide-react';
import { CategoryFilter } from './CategoryFilter';
import { SortControl, SortOption } from './SortControl';
import { Category } from '../data/playlist';

interface PlaylistHeaderProps {
  totalItems: number;
  filteredItemsCount: number;
  favoritesCount: number;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
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
  onSelectCategory,
  currentSort,
  onSelectSort,
  onShuffle,
}) => {
  const isFiltered = selectedCategory !== 'All' || favoritesOnly;

  return (
    <header className="sticky top-0 z-30 bg-[#070a12]/95 backdrop-blur-md border-b border-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand & Jump Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400"></span>
            <span className="font-mono text-sm text-slate-100 font-bold tracking-tight">
              MAX PLAYLIST
            </span>
          </div>

          <div className="hidden lg:block border-l border-[#1e293b] pl-4">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
            />
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2.5 self-start md:self-center">
          <div className="lg:hidden max-w-[200px] sm:max-w-xs overflow-x-auto scrollbar-none">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
            />
          </div>

          <SortControl
            currentSort={currentSort}
            onSelectSort={onSelectSort}
            onShuffle={onShuffle}
          />

          {/* Favorites Only Toggle */}
          <button
            type="button"
            onClick={onToggleFavoritesOnly}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-mono text-xs font-medium transition-colors cursor-pointer border shadow-xs ${
              favoritesOnly
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 font-semibold'
                : 'bg-[#131d33] hover:bg-[#1e293b] text-slate-300 border-[#1e293b]'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                favoritesOnly ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">Favorites only</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Video Counter Badge */}
          <div className="px-3.5 py-2 rounded-xl bg-[#131d33] border border-[#1e293b] text-slate-300 font-mono text-xs whitespace-nowrap shadow-xs">
            {isFiltered ? (
              <>
                <span className="text-lime-400 font-semibold">{filteredItemsCount}</span> of {totalItems}
              </>
            ) : (
              <>
                <span className="text-lime-400 font-semibold">{totalItems}</span> videos
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
