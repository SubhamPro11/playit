import React from 'react';

export const BrandLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer select-none">
      {/* Studio Emblem */}
      <div className="relative flex items-center justify-center">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-800 border border-surface-700 group-hover:border-accent-500/80 flex items-center justify-center shadow-md transition-all duration-200 overflow-hidden">
          {/* Amber Play/Broadcast Waveform Icon */}
          <svg
            className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-accent-500 group-hover:scale-110 transition-transform duration-200"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7 4.5v15a1 1 0 001.52.85l12-7.5a1 1 0 000-1.7l-12-7.5A1 1 0 007 4.5z" />
          </svg>
        </div>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-sans font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-accent-400 transition-colors">
            PLAYIT
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
        </div>
        <span className="font-mono text-[9px] sm:text-[10px] tracking-wider text-slate-400 uppercase font-medium mt-0.5">
          Curated Soundscapes
        </span>
      </div>
    </div>
  );
};
