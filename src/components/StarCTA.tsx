import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, X, Radio } from 'lucide-react';

const STORAGE_KEY = 'airwaves_star_cta_dismissed_v1';
const CACHE_KEY = 'airwaves_github_stars_cache';
const REPO_URL = 'https://github.com/SubhamPro11/playit';
const REPO_API_URL = 'https://api.github.com/repos/SubhamPro11/playit';

interface StarCTACache {
  count: number;
  timestamp: number;
}

export const StarCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    // Check dismissal state
    try {
      const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
      if (isDismissed) return;
      setIsVisible(true);
    } catch {
      setIsVisible(true);
    }

    // Fetch live stars from cache or GitHub API
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: StarCTACache = JSON.parse(cached);
        // Cache valid for 30 minutes
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000 && typeof parsed.count === 'number') {
          setStarCount(parsed.count);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Fetch fresh count from GitHub API
    fetch(REPO_API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('API limit or network error');
        return res.json();
      })
      .then((data) => {
        if (typeof data.stargazers_count === 'number') {
          setStarCount(data.stargazers_count);
          try {
            const cachePayload: StarCTACache = {
              count: data.stargazers_count,
              timestamp: Date.now(),
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // Silently fail - fallback UI will gracefully display without star count
      });
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
      aria-label="GitHub early access and open source notice"
      className="max-w-4xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 w-full"
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface-850 border border-accent-500/30 p-6 sm:p-7 shadow-xl">
        {/* Ambient subtle amber glow */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Column: Icon & Honest Text */}
          <div className="flex items-start gap-4 flex-1">
            <div className="w-11 h-11 rounded-xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center shrink-0 text-accent-400 mt-0.5">
              <Star className="w-5 h-5 stroke-[1.75]" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-[11px] font-mono font-medium tracking-wide uppercase">
                  <Radio className="w-3 h-3" />
                  <span>Open Source</span>
                </span>
                <span className="text-xs font-semibold text-white tracking-tight">
                  Star the repo for early drops
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Airwaves is fully open source. Star the repository on GitHub to get new station drops, upcoming categories, and redesign previews announced first in Discussions &amp; Releases before they ship to the live directory.
              </p>
            </div>
          </div>

          {/* Right Column: Star Link Button & Dismiss */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-surface-700/60">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-400 text-surface-950 text-xs font-bold transition-all shadow-md hover:shadow-accent-500/20 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-surface-950 text-surface-950" />
              <span>Star on GitHub</span>
              {starCount !== null && (
                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-surface-950/20 text-surface-950 font-mono text-[11px] font-bold">
                  {starCount}
                </span>
              )}
              <ExternalLink className="w-3.5 h-3.5 opacity-75" />
            </a>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss early access card"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-surface-750 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
