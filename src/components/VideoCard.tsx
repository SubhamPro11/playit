import React, { useState, useEffect } from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import { Video, getEffectiveThumbnailUrl, DEFAULT_FALLBACK_THUMBNAIL } from '../types/video';

interface VideoCardProps {
  video: Video;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  variant?: 'grid' | 'row';
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isFavorite,
  onToggleFavorite,
  variant = 'row',
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(() => getEffectiveThumbnailUrl(video));

  useEffect(() => {
    setCurrentSrc(getEffectiveThumbnailUrl(video));
    setImageError(false);
  }, [video.thumbnailUrl, video.category]);

  // Extract clean domain for metadata row
  const domain = video.externalLink
    .replace(/^https?:\/\//, '')
    .split('/')[0];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(video.id);
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
      href={video.externalLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-surface-850 hover:bg-surface-800 rounded-xl border border-surface-700 hover:border-surface-600 focus-visible:border-accent-500 transition-all duration-200 overflow-hidden relative shadow-sm hover:shadow-md h-full cursor-pointer"
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

        {/* Index Coordinate Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-950/90 backdrop-blur-md font-mono text-[11px] text-slate-200 border border-white/10 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 bg-accent-500" />
            <span>#{String(video.orderIndex).padStart(2, '0')}</span>
          </span>
        </div>

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
          {/* Category indicator */}
          <div className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-1.5 truncate">
            {video.category}
          </div>

          {/* Card title */}
          <h3 className={`font-sans font-bold text-white group-hover:text-accent-400 transition-colors leading-snug line-clamp-2 ${isRow ? 'text-base sm:text-lg min-h-[3rem]' : 'text-sm sm:text-base min-h-[2.5rem]'}`}>
            {video.title}
          </h3>
        </div>

        {/* Metadata footer */}
        <div className="mt-3.5 pt-2.5 border-t border-surface-700 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-xs truncate max-w-[170px] text-slate-400 group-hover:text-slate-300 transition-colors">
            {domain}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400 group-hover:text-accent-400 transition-colors font-medium shrink-0 ml-2">
            <span>Listen</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
};
