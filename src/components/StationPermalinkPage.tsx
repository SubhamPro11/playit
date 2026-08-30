import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, ExternalLink, Heart, Share2, Check, Radio } from 'lucide-react';
import { Video, getEffectiveThumbnailUrl } from '../types/video';
import { BrandLogo } from './BrandLogo';
import { VideoCard } from './VideoCard';
import { getStationSlug } from '../utils/slug';

interface StationPermalinkPageProps {
  video: Video;
  allVideos: Video[];
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onNavigateHome: () => void;
  onNavigateStation: (slug: string) => void;
  onSurpriseMe?: () => void;
}

export const StationPermalinkPage: React.FC<StationPermalinkPageProps> = ({
  video,
  allVideos,
  isFavorite,
  onToggleFavorite,
  onNavigateHome,
  onNavigateStation,
  onSurpriseMe,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const domain = video.externalLink
    .replace(/^https?:\/\//, '')
    .split('/')[0];

  const thumbnailUrl = getEffectiveThumbnailUrl(video);

  // Dynamic SEO meta tags per station
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${video.title} — PlayIt Curated Audio Showcase`;

    // Update description meta tag
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') || '';
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        `Listen to ${video.title} (${domain}), curated in ${video.category} on PlayIt. Independent web radio, ambient soundscapes, and regional audio.`
      );
    }

    // Scroll to top on page load
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = originalTitle;
      if (metaDesc && prevDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
    };
  }, [video, domain]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const relatedStations = useMemo(() => {
    return allVideos
      .filter((v) => v.id !== video.id && v.category === video.category)
      .slice(0, 4);
  }, [allVideos, video]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-950 text-slate-100 font-sans selection:bg-accent-500 selection:text-white">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-surface-900/90 backdrop-blur-md border-b border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white border border-surface-700 hover:border-surface-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All stations</span>
            </button>

            <div className="h-4 w-px bg-surface-700 hidden sm:block" />

            <div className="hidden sm:block">
              <BrandLogo />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {onSurpriseMe && (
              <button
                type="button"
                onClick={onSurpriseMe}
                title="Jump to another random station"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-500/10 hover:bg-accent-500 text-accent-400 hover:text-surface-950 border border-accent-500/30 hover:border-accent-400 text-xs font-semibold transition-all cursor-pointer group"
              >
                <span className="text-sm transition-transform group-hover:rotate-12">🎲</span>
                <span className="hidden sm:inline">Surprise me</span>
              </button>
            )}

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white border border-surface-700 hover:border-surface-600 text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Link copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Showcase Hero */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: High-Res Artwork */}
          <div className="md:col-span-6">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-surface-900 border border-surface-700 shadow-2xl">
              {!imgError ? (
                <img
                  src={thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-surface-900 text-center">
                  <Radio className="w-12 h-12 text-accent-500 mb-3 opacity-60" />
                  <span className="font-mono text-sm text-slate-300 font-semibold">{domain}</span>
                  <span className="text-xs text-slate-500 mt-1">{video.category}</span>
                </div>
              )}

              {/* Category Badge Floating on Artwork */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-lg bg-surface-950/90 backdrop-blur-md font-sans text-xs font-semibold text-slate-200 border border-white/10 shadow-sm">
                  {video.category}
                </span>
              </div>

              {/* Heart Favorite Button */}
              <button
                type="button"
                onClick={() => onToggleFavorite(video.id)}
                aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-md ${
                  isFavorite
                    ? 'bg-surface-950/95 text-accent-500 border border-accent-500/50 scale-105'
                    : 'bg-surface-950/75 text-slate-300 hover:text-accent-400 hover:bg-surface-950/90 border border-white/15'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-accent-500 text-accent-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right Column: Station Details & Direct Outbound Launch */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  Live External Feed
                </span>
              </div>

              <h1 className="font-sans font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight mb-3">
                {video.title}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-mono">
                <span>Host:</span>
                <span className="text-slate-300 font-semibold">{domain}</span>
              </div>

              {/* Creator Credit Attribution Block */}
              {video.creator ? (
                <div className="p-3.5 rounded-xl bg-surface-900 border border-surface-700/80 mb-5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 font-mono text-[11px] block uppercase tracking-wider">Created & Curated By</span>
                    <span className="text-slate-200 font-bold font-sans text-sm mt-0.5 block">{video.creator}</span>
                  </div>
                  {video.creatorUrl && (
                    <a
                      href={video.creatorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-850 hover:bg-surface-800 text-accent-400 hover:text-accent-300 border border-surface-700 hover:border-surface-600 font-medium transition-colors text-xs"
                    >
                      <span>Creator profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-surface-900/60 border border-surface-800 mb-5 text-xs text-slate-400">
                  <span className="text-slate-500 font-mono text-[11px] block uppercase tracking-wider">Attribution</span>
                  <span className="text-slate-300 mt-0.5 block">Independent Web Radio / Open Community Project</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-surface-900 border border-surface-700/80 mb-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  This station is part of the PlayIt curated index of 70 independent web radio and audio environments. Audio plays directly from the creator&apos;s live site in a new browser tab.
                </p>
              </div>
            </div>

            {/* Launch Action */}
            <div className="space-y-3">
              <a
                href={video.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-surface-950 font-bold text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-accent-500/20 cursor-pointer"
              >
                <span>Launch audio station</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <p className="text-[11px] text-center text-slate-500 font-mono">
                Opens in a new browser tab • Zero tracking
              </p>
            </div>

          </div>

        </div>

        {/* Related Category Stations */}
        {relatedStations.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-10 border-t border-surface-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-sans font-bold text-lg sm:text-xl text-white">
                  More in {video.category}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Explore other curated soundscapes in this channel.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {relatedStations.map((rel) => (
                <div key={rel.id} className="relative group">
                  <VideoCard
                    video={rel}
                    variant="grid"
                    isFavorite={false}
                    onToggleFavorite={() => onToggleFavorite(rel.id)}
                  />
                  {/* Overlay button to open related station permalink */}
                  <button
                    onClick={() => onNavigateStation(getStationSlug(rel.title))}
                    className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded bg-surface-950/85 hover:bg-surface-950 text-[10px] text-slate-300 font-mono border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    View details &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-700 bg-surface-950 py-8 px-4 text-center text-xs text-slate-500 font-mono">
        <p>PlayIt — Curated single-playlist index • No algorithms • Zero ads</p>
      </footer>
    </div>
  );
};
