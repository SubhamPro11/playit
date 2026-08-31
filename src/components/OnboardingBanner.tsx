import React, { useState, useEffect } from 'react';
import { Sparkles, X, Compass } from 'lucide-react';

const STORAGE_KEY = 'airwaves_onboarding_dismissed_v1';

interface OnboardingBannerProps {
  totalStations?: number;
}

export const OnboardingBanner: React.FC<OnboardingBannerProps> = ({ totalStations = 70 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
      if (!isDismissed) {
        setIsVisible(true);
      }
    } catch {
      // ignore storage access restrictions
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Welcome guide"
      className="mb-8 relative rounded-xl border border-accent-500/30 bg-gradient-to-r from-surface-850 via-surface-900 to-surface-850 p-4 sm:p-5 shadow-lg overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      {/* Subtle ambient amber accent glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"
        aria-hidden="true"
      />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center flex-shrink-0 text-accent-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
                <span>Welcome to Airwaves</span>
                <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              </h2>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-300 border border-accent-500/30">
                {totalStations} Live Feeds
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Hand-picked independent web radios, ambient soundscapes, and cultural archives. Filter by category, hit <span className="text-accent-400 font-medium">Surprise Me</span> for random discovery, or jump to our <span className="text-accent-400 font-medium">Spotlight</span> picks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="px-3.5 py-1.5 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 hover:text-accent-200 border border-accent-500/40 text-xs font-semibold tracking-wide transition-colors cursor-pointer"
          >
            Got it
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss welcome guide"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-700/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
