import React from 'react';

export const BrandLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer select-none">
      {/* Sleek Obsidian + Crimson Glow Emblem */}
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-1 bg-red-600/30 rounded-xl blur-xs group-hover:bg-red-600/50 transition-all duration-300"></div>
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-[#1c1917] to-[#0a0a0c] border border-red-500/40 group-hover:border-red-500 flex items-center justify-center shadow-lg transition-all duration-200 overflow-hidden">
          {/* Crimson Play Waveform Icon */}
          <svg
            className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] group-hover:scale-110 transition-transform duration-200"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7 4.5v15a1 1 0 001.52.85l12-7.5a1 1 0 000-1.7l-12-7.5A1 1 0 007 4.5z" />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-sans font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-red-400 transition-colors">
            PLAYIT
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]"></span>
        </div>
        <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-zinc-400 uppercase font-medium mt-0.5">
          Curated Soundscapes
        </span>
      </div>
    </div>
  );
};
