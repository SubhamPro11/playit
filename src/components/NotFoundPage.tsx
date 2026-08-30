import React from 'react';
import { Radio, ArrowLeft, Home } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NotFoundPageProps {
  onBackToHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-900 text-slate-200 font-sans">
      {/* Minimal Header */}
      <header className="border-b border-surface-700 bg-surface-900/95 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div onClick={onBackToHome} className="cursor-pointer">
            <BrandLogo />
          </div>
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white border border-surface-700 hover:border-surface-600 text-xs font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to directory</span>
          </button>
        </div>
      </header>

      {/* 404 Center Banner */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
        {/* Animated Radio Dial Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-850 border border-surface-700 flex items-center justify-center text-accent-500 shadow-xl mb-6">
          <Radio className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
        </div>

        {/* 404 Badge */}
        <span className="inline-flex items-center px-3 py-1 rounded-md bg-accent-500/10 border border-accent-500/30 text-accent-400 font-mono text-xs font-bold uppercase tracking-wider mb-4">
          Status 404 · Static / Off-Air
        </span>

        <h1 className="font-sans font-bold text-2xl sm:text-4xl text-white tracking-tight">
          Audio frequency not found
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mt-3 sm:mt-4 leading-relaxed max-w-lg">
          The route or station parameter you navigated to is off-frequency. Return to the curated directory to browse all 70 independent audio feeds.
        </p>

        {/* Primary Call to Action */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-400 text-surface-950 font-semibold text-sm transition-all shadow-md cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to live playlist</span>
          </button>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-surface-700 bg-surface-950 py-6 px-4 text-center text-xs text-slate-500 font-mono">
        PlayIt · Curated Independent Audio &amp; Web Radio
      </footer>
    </div>
  );
};
