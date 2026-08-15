import React, { useState } from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import { Video } from '../types/video';

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

  // Extract clean domain for metadata row
  const domain = video.externalLink
    .replace(/^https?:\/\//, '')
    .split('/')[0];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(video.id);
  };

  const isRow = variant === 'row';

  return (
    <a
      href={video.externalLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-[#111114] rounded-2xl border border-[#27272a] hover:border-red-500/80 transition-all duration-200 hover:-translate-y-1 overflow-hidden relative shadow-sm hover:shadow-xl hover:shadow-red-950/25 h-full"
    >
      {/* 16:9 Thumbnail Viewport with matching top curve */}
      <div className="relative aspect-video w-full overflow-hidden bg-black border-b border-[#27272a] rounded-t-2xl">
        {!imageError ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#0a0a0d] text-center">
            <span
              className="w-3 h-3 rounded-full mb-2 bg-red-500"
            />
            <span className="font-mono text-xs text-zinc-300 font-semibold truncate max-w-full">
              {domain}
            </span>
            <span className="font-mono text-[10px] text-zinc-500 mt-0.5">
              {video.category}
            </span>
          </div>
        )}

        {/* High-contrast Number Badge + Accent Dot */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-black/90 backdrop-blur-md font-mono text-[11px] text-zinc-200 border border-white/10 shadow-xs">
            <span
              className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 bg-red-500"
            />
            <span>#{String(video.orderIndex).padStart(2, '0')}</span>
          </span>
        </div>

        {/* Circular Heart/Favorite Icon Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer z-10 shadow-xs ${
            isFavorite
              ? 'bg-black/95 text-red-500 border border-red-500/50 scale-105 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
              : 'bg-black/70 text-zinc-400 hover:text-red-400 hover:bg-black/90 border border-white/10 opacity-70 group-hover:opacity-100'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isFavorite ? 'fill-red-500 text-red-500' : ''
            }`}
          />
        </button>

        {/* Hover open cue */}
        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white font-mono text-[10px] font-bold shadow-md">
            open ↗
          </span>
        </div>
      </div>

      {/* Card Info & Distinct Typography Hierarchy */}
      <div className={`flex-1 flex flex-col justify-between bg-[#111114] rounded-b-2xl ${isRow ? 'p-4 sm:p-4.5' : 'p-3.5 sm:p-4'}`}>
        <div>
          {/* Subtle secondary category indicator */}
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5 truncate">
            {video.category}
          </div>

          {/* Prominent card title */}
          <h3 className={`font-sans font-semibold text-white group-hover:text-red-400 transition-colors leading-snug line-clamp-2 ${isRow ? 'text-base sm:text-lg min-h-[3rem]' : 'text-sm sm:text-base min-h-[2.5rem]'}`}>
            {video.title}
          </h3>
        </div>

        {/* Metadata footer */}
        <div className="mt-3.5 pt-2.5 border-t border-[#27272a] flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="truncate max-w-[170px] text-zinc-400 group-hover:text-zinc-300 transition-colors">
            {domain}
          </span>
          <span className="inline-flex items-center gap-1 text-zinc-400 group-hover:text-red-400 transition-colors font-medium shrink-0 ml-2">
            <span>visit site</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
};
