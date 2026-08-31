import React, { useState } from 'react';
import { Heart, Menu, X, Plus, Info } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isFiltered = selectedCategory !== 'All' || favoritesOnly;

  const handleMobileAction = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-surface-900/95 backdrop-blur-md border-b border-surface-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <BrandLogo />

        {/* Desktop Controls Toolbar */}
        <div className="hidden md:flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">
          
          {/* Surprise Me Random Picker Button */}
          {onSurpriseMe && (
            <button
              type="button"
              onClick={onSurpriseMe}
              title="Pick a random station from the 70 feeds"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-accent-400 hover:text-white bg-accent-500/10 hover:bg-accent-500 border border-accent-500/30 hover:border-accent-400 transition-all cursor-pointer shadow-xs group"
            >
              <span className="text-sm transition-transform group-hover:rotate-12">🎲</span>
              <span className="hidden lg:inline group-hover:text-surface-950">Surprise me</span>
            </button>
          )}

          {/* Suggest Station Button */}
          {onOpenSuggest && (
            <button
              type="button"
              onClick={onOpenSuggest}
              className="px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium text-accent-400 hover:text-accent-300 bg-surface-850 hover:bg-surface-800 border border-surface-700 hover:border-accent-500/50 transition-all cursor-pointer"
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
            aria-label={favoritesOnly ? "Show all stations" : "Show favorites only"}
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
            <span>Favorites</span>
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

        {/* Mobile Compact Bar (< md) */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <UserAuthControl />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="p-2 rounded-xl bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white border border-surface-700 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Expandable Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-700 bg-surface-900/98 backdrop-blur-xl px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-2xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-surface-800">
            <LiveVisitorsBadge />
            <div className="text-xs text-slate-400">
              <span className="text-accent-400 font-mono font-bold">{filteredItemsCount}</span> of {totalItems} stations
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {onSurpriseMe && (
              <button
                type="button"
                onClick={() => handleMobileAction(onSurpriseMe)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-accent-500/10 hover:bg-accent-500 text-accent-400 hover:text-surface-950 font-bold text-xs border border-accent-500/30 transition-all cursor-pointer"
              >
                <span>🎲</span>
                <span>Surprise me</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleMobileAction(onToggleFavoritesOnly)}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                favoritesOnly
                  ? 'bg-accent-500/20 text-accent-400 border-accent-500/50'
                  : 'bg-surface-850 text-slate-300 border-surface-700 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-accent-500 text-accent-500' : ''}`} />
              <span>Favorites {favoritesCount > 0 ? `(${favoritesCount})` : ''}</span>
            </button>
          </div>

          {/* Sort Control Mobile Row */}
          <div className="pt-1">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Sort Order
            </div>
            <SortControl
              currentSort={currentSort}
              onSelectSort={(sort) => {
                onSelectSort(sort);
                setMobileMenuOpen(false);
              }}
              onShuffle={() => {
                onShuffle();
                setMobileMenuOpen(false);
              }}
            />
          </div>

          {/* Quick Actions List */}
          <div className="pt-2 border-t border-surface-800 space-y-1.5">
            {onOpenSuggest && (
              <button
                type="button"
                onClick={() => handleMobileAction(onOpenSuggest)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-xs font-medium text-slate-200 border border-surface-700/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-accent-400" />
                  <span>Suggest a New Station</span>
                </div>
                <span className="text-[10px] text-accent-400 font-mono">+ Submit</span>
              </button>
            )}

            {onOpenAbout && (
              <button
                type="button"
                onClick={() => handleMobileAction(onOpenAbout)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-xs font-medium text-slate-200 border border-surface-700/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  <span>About Airwaves & Manifesto</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Read &rarr;</span>
              </button>
            )}
          </div>

        </div>
      )}
    </header>
  );
};
