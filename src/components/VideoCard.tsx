import React, { useState, useEffect } from 'react';
import { Heart, ArrowUpRight, Info } from 'lucide-react';
import { Video, getEffectiveThumbnailUrl, DEFAULT_FALLBACK_THUMBNAIL } from '../types/video';
import { getStationSlug } from '../utils/slug';

interface VideoCardProps {
  video: Video;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onNavigatePermalink?: (slug: string) => void;
  variant?: 'grid' | 'row';
  reactionCount?: number;
  hasReacted?: boolean;
  onAddReaction?: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isFavorite,
  onToggleFavorite,
  onNavigatePermalink,
  variant = 'row',
  reactionCount = 0,
  hasReacted = false,
  onAddReaction,
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(() => getEffectiveThumbnailUrl(video));

  useEffect(() => {
    setCurrentSrc(getEffectiveThumbnailUrl(video));
    setImageError(false);
  }, [video.thumbnailUrl, video.category]);

  // Extract clean domain for destination display
  const domain = video.externalLink
    .replace(/^https?:\/\//, '')
    .split('/')[0];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(video.id);
  };

  const handleReactionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddReaction) {
      onAddReaction(video.id);
    }
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    if (onNavigatePermalink) {
      e.preventDefault();
      e.stopPropagation();
      onNavigatePermalink(getStationSlug(video.title));
    }
  };

  const handleImageError = () => {
    if (currentSrc !== DEFAULT_FALLBACK_THUMBNAIL) {
      setCurrentSrc(DEFAULT_FALLBACK_THUMBNAIL);
    } else {
      setImageError(true);
    }
  };

  const isRow = variant === 'row';

  return (
    <a
      id={`track-${video.id}`}
      data-station-card
      href={video.externalLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${video.title} on ${domain} in a new tab`}
      title={`Open ${video.title} on ${domain} (opens in new tab)`}
      className="group flex flex-col bg-surface-850 hover:bg-surface-800 rounded-xl border border-surface-700 hover:border-surface-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900 transition-all duration-200 overflow-hidden relative shadow-sm hover:shadow-md h-full cursor-pointer"
    >
      {/* 16:9 Thumbnail Viewport */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface-950 border-b border-surface-700">
        {!imageError ? (
          <img
            src={currentSrc}
            alt={video.title}
            width={640}
            height={360}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-surface-950 text-center">
            <span className="w-2.5 h-2.5 rounded-full mb-2 bg-accent-500" />
            <span className="font-mono text-xs text-slate-300 font-semibold truncate max-w-full">
              {domain}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">
              {video.category}
            </span>
          </div>
        )}

        {/* Flame Reaction Button */}
        {onAddReaction && (
          <button
            type="button"
            onClick={handleReactionClick}
            disabled={hasReacted}
            title={hasReacted ? `You reacted (${reactionCount})` : 'React with 🔥'}
            aria-label={hasReacted ? `Reacted (${reactionCount})` : 'React with flame'}
            className={`absolute top-2.5 left-2.5 h-8 px-2.5 rounded-full flex items-center gap-1 backdrop-blur-md transition-all cursor-pointer z-10 shadow-sm text-xs font-mono font-bold ${
              hasReacted
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 scale-105 cursor-default'
                : 'bg-surface-950/70 text-slate-300 hover:text-amber-400 hover:bg-surface-950/90 border border-white/10 opacity-85 group-hover:opacity-100'
            }`}
          >
            <span>🔥</span>
            {reactionCount > 0 && <span>{reactionCount}</span>}
          </button>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer z-10 shadow-sm ${
            isFavorite
              ? 'bg-surface-950/95 text-accent-500 border border-accent-500/50 scale-105'
              : 'bg-surface-950/70 text-slate-400 hover:text-accent-400 hover:bg-surface-950/90 border border-white/10 opacity-80 group-hover:opacity-100'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isFavorite ? 'fill-accent-500 text-accent-500' : ''
            }`}
          />
        </button>
      </div>

      {/* Card Info & Scannable Typography */}
      <div className={`flex-1 flex flex-col justify-between bg-surface-850 group-hover:bg-surface-800 transition-colors ${isRow ? 'p-4' : 'p-3.5 sm:p-4'}`}>
        <div>
          {/* Category tag ONLY shown in cross-category grid/search view */}
          {!isRow && (
            <div className="inline-block px-2 py-0.5 rounded-md bg-surface-950 border border-surface-700/80 text-[10px] text-slate-400 font-medium tracking-wide uppercase mb-2 truncate max-w-full">
              {video.category}
            </div>
          )}

          {/* Card title */}
          <h3 className={`font-sans font-bold text-white group-hover:text-accent-400 transition-colors leading-snug line-clamp-2 ${isRow ? 'text-base sm:text-lg min-h-[3rem]' : 'text-sm sm:text-base min-h-[2.5rem]'}`}>
            {video.title}
          </h3>
        </div>

        {/* Unified Outbound Destination Bar */}
        <div className="mt-3 pt-2.5 border-t border-surface-700/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate max-w-[210px]">
            <span className="font-mono text-xs truncate text-slate-400 group-hover:text-slate-300 transition-colors">
              {domain}
            </span>
            {onNavigatePermalink && (
              <button
                type="button"
                onClick={handleDetailsClick}
                title="View station details & permalink"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-900 hover:bg-surface-750 text-[10px] text-slate-400 hover:text-white border border-surface-700 transition-colors cursor-pointer"
              >
                <Info className="w-2.5 h-2.5" />
                <span>Info</span>
              </button>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-slate-400 group-hover:text-accent-400 transition-colors font-medium shrink-0">
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
};
