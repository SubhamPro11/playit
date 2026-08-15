import React, { useState } from 'react';
import { Search, X, ExternalLink, Heart } from 'lucide-react';
import { Video } from '../types/video';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  featuredVideos: Video[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  featuredVideos,
  isFavorite,
  onToggleFavorite,
}) => {
  const [selectedSpotlightIndex, setSelectedSpotlightIndex] = useState(0);
  const currentSpotlight = featuredVideos[selectedSpotlightIndex] || featuredVideos[0];

  if (!currentSpotlight) return null;

  const domain = currentSpotlight.externalLink
    .replace(/^https?:\/\//, '')
    .split('/')[0];

  const accent = currentSpotlight.accentColor || '#a3e635';
  const isFav = isFavorite(currentSpotlight.id);

  return (
    <section className="relative border-b border-[#1e293b] bg-[#070a12] py-8 sm:py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Description & Primary Search Action */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-lime-400"></span>
              <span className="font-mono text-xs text-lime-400 font-semibold tracking-wider uppercase">
                Curated soundscapes & web radio
              </span>
            </div>

            <h1 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-100 tracking-tight leading-[1.15]">
              Discover 70 independent audio worlds.
            </h1>

            <p className="text-sm sm:text-base text-slate-400 mt-3 sm:mt-4 leading-relaxed max-w-xl">
              An open collection of ambient web radios, highway bus mixtapes, retro television nostalgia, and cultural music projects.
            </p>

            {/* Primary Search Input in Hero */}
            <div className="mt-6 sm:mt-8 w-full max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search 70 playlists by name, mood, or domain..."
                  className="w-full pl-12 pr-10 py-3 bg-[#0f172a] text-slate-100 placeholder:text-slate-500 rounded-2xl border border-[#1e293b] focus:border-lime-400 focus:outline-none transition-all font-sans text-sm sm:text-base shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={onClearSearch}
                    aria-label="Clear search"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Suggestion Tags */}
              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-500 flex-wrap">
                <span>Try:</span>
                {['Saloon', 'Roadways', 'Ghazal', 'Doordarshan', 'Lo-Fi'].map((term) => (
                  <button
                    key={term}
                    onClick={() => onSearchChange(term)}
                    className="px-2 py-0.5 rounded-md bg-[#131d33] hover:bg-[#1e293b] text-slate-400 hover:text-lime-400 transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Spotlight Feature Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              
              {/* Spotlight Header Row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                  <span className="font-mono text-xs uppercase text-slate-400 font-semibold tracking-wider">
                    Spotlight pick #{String(currentSpotlight.orderIndex).padStart(2, '0')}
                  </span>
                </div>

                {/* Switcher Dots for 5 Picks */}
                <div className="flex items-center gap-1.5">
                  {featuredVideos.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedSpotlightIndex(idx)}
                      aria-label={`Select spotlight pick ${idx + 1}`}
                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                        selectedSpotlightIndex === idx
                          ? 'bg-lime-400 scale-110'
                          : 'bg-[#1e293b] hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Spotlight Thumbnail Image */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#1e293b]/80 group">
                <img
                  src={currentSpotlight.thumbnailUrl}
                  alt={currentSpotlight.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                />

                {/* Category Chip */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#070a12]/90 backdrop-blur-md font-mono text-[11px] text-slate-200 border border-white/10 shadow-xs">
                    {currentSpotlight.category}
                  </span>
                </div>

                {/* Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleFavorite(currentSpotlight.id);
                  }}
                  aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer z-10 shadow-xs ${
                    isFav
                      ? 'bg-black/90 text-rose-500 border border-rose-500/40'
                      : 'bg-black/70 text-slate-400 hover:text-rose-400 hover:bg-black/90 border border-white/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Spotlight Details & Action Button */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-100 leading-tight">
                    {currentSpotlight.title}
                  </h3>
                  <p className="font-mono text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">
                    {domain}
                  </p>
                </div>

                <a
                  href={currentSpotlight.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 active:bg-lime-400 text-black font-semibold font-mono text-xs uppercase tracking-wider transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  <span>Open playlist</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
