import React from 'react';
import { CATEGORIES } from '../data/playlist';

interface SiteFooterProps {
  totalVideos: number;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ totalVideos }) => {
  const realCategoriesCount = CATEGORIES.filter((c) => c !== 'All').length;

  return (
    <footer className="border-t border-[#1e293b] bg-[#070a12] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-16 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Col 1: About the Project */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-lime-400"></div>
            <span className="font-mono text-sm font-bold text-slate-100 tracking-tight">
              MAX PLAYLIST
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
            A single, human-curated playlist indexing independent audio projects, web radios, highway travel soundscapes, and regional folk music from across India.
          </p>
          <p className="text-xs text-slate-500 mt-3 font-mono">
            Clicking any thumbnail card opens the original creator&apos;s live web link in a new tab.
          </p>
        </div>

        {/* Col 2: Real Index Metrics */}
        <div className="md:col-span-3">
          <h4 className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Collection index
          </h4>
          <ul className="space-y-2 text-xs font-mono text-slate-400">
            <li className="flex items-center justify-between">
              <span>Total curated links:</span>
              <span className="text-lime-400 font-semibold">{totalVideos}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Genre categories:</span>
              <span className="text-slate-200">{realCategoriesCount}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Playback model:</span>
              <span className="text-slate-200">External direct links</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Favorites storage:</span>
              <span className="text-slate-200">Local browser only</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Categories & Transparency */}
        <div className="md:col-span-4">
          <h4 className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Browse by channel
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-1 rounded-lg bg-[#131d33] border border-[#1e293b] text-[11px] font-mono text-slate-400"
              >
                {cat}
              </span>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#1e293b]/70 text-[11px] font-mono text-slate-500">
            Last curated: August 2026 · Built with honest web principles
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[#1e293b]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <div>
          <span>Max playlist · 70 independent audio websites</span>
        </div>
        <div className="flex items-center gap-4">
          <span>No algorithms</span>
          <span>·</span>
          <span>No tracking</span>
          <span>·</span>
          <span>Zero ads</span>
        </div>
      </div>
    </footer>
  );
};
