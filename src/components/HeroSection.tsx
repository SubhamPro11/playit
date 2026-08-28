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

  const isFav = isFavorite(currentSpotlight.id);

  return (
    <section className="relative border-b border-[#26262a] bg-[#08080a] py-8 sm:py-12 overflow-hidden">
      {/* Subtle Crimson Ambient Glow in Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Description & Primary Search Action */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              <span className="font-mono text-xs text-red-400 font-bold tracking-wider uppercase">
                Curated soundscapes & web radio
              </span>
            </div>

            <h1 className="font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.15]">
              Discover 70 independent audio worlds.
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 mt-3 sm:mt-4 leading-relaxed max-w-xl">
              An open collection of ambient web radios, highway bus mixtapes, retro television nostalgia, and cultural music projects.
            </p>

            {/* Primary Search Input in Hero */}
            <div className="mt-6 sm:mt-8 w-full max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search 70 playlists by name, mood, or domain..."
                  className="w-full pl-12 pr-10 py-3 bg-[#121216] text-white placeholder:text-zinc-500 rounded-2xl border border-[#27272a] focus:border-red-500 focus:ring-1 focus:ring-red-500/30 focus:outline-none transition-all font-sans text-sm sm:text-base shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={onClearSearch}
                    aria-label="Clear search"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Suggestion Tags */}
              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-zinc-500 flex-wrap">
                <span>Try:</span>
                {['Saloon', 'Roadways', 'Ghazal', 'Doordarshan', 'Lo-Fi'].map((term) => (
                  <button
                    key={term}
                    onClick={() => onSearchChange(term)}
                    className="px-2.5 py-0.5 rounded-lg bg-[#141418] hover:bg-[#1f1f26] text-zinc-400 hover:text-red-400 border border-[#27272a] transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Spotlight Feature Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#111114] rounded-2xl border border-[#27272a] hover:border-red-500/40 p-4 sm:p-5 shadow-2xl relative overflow-hidden transition-all duration-300">
              
              {/* Spotlight Header Row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="font-mono text-xs uppercase text-zinc-400 font-semibold tracking-wider">
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
                          ? 'bg-red-500 scale-125 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                          : 'bg-[#27272a] hover:bg-zinc-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Spotlight Thumbnail Image */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#27272a] group">
                <img
                  src={currentSpotlight.thumbnailUrl}
                  alt={currentSpotlight.title}
                  width={640}
                  height={360}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                />

                {/* Category Chip */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md font-mono text-[11px] text-zinc-200 border border-white/10 shadow-xs">
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
                      ? 'bg-black/90 text-red-500 border border-red-500/50'
                      : 'bg-black/70 text-zinc-400 hover:text-red-400 hover:bg-black/90 border border-white/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>

              {/* Spotlight Details & Action Button */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <h3 className="font-sans font-bold text-lg text-white leading-tight">
                    {currentSpotlight.title}
                  </h3>
                  <p className="font-mono text-xs text-zinc-500 mt-0.5 truncate max-w-[220px]">
                    {domain}
                  </p>
                </div>

                <a
                  href={currentSpotlight.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold font-mono text-xs uppercase tracking-wider transition-colors shrink-0 shadow-lg shadow-red-950/50 cursor-pointer"
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
