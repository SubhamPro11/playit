import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Video } from '../types/video';
import { VideoCard } from './VideoCard';
import { Category } from '../data/playlist';

interface CategoryRowProps {
  category: Category;
  videos: Video[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onViewAllCategory: (category: Category) => void;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  videos,
  isFavorite,
  onToggleFavorite,
  onViewAllCategory,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (videos.length === 0) return null;

  const categoryId = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id={categoryId} className="scroll-mt-24">
      {/* Category Header Row with Distinct Type Scale */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-slate-100 tracking-tight">
            {category}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-[#131d33] border border-[#1e293b] text-slate-400 font-mono text-[11px]">
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View All Button */}
          <button
            onClick={() => onViewAllCategory(category)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#131d33] hover:bg-[#1e293b] text-xs font-mono text-slate-300 hover:text-lime-400 border border-[#1e293b] transition-colors cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Left/Right Scroll Arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              aria-label={`Scroll ${category} left`}
              className="w-8 h-8 rounded-xl bg-[#131d33] hover:bg-[#1e293b] text-slate-300 hover:text-white border border-[#1e293b] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label={`Scroll ${category} right`}
              className="w-8 h-8 rounded-xl bg-[#131d33] hover:bg-[#1e293b] text-slate-300 hover:text-white border border-[#1e293b] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Cards Row */}
      <div
        ref={rowRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        {videos.map((video) => (
          <div
            key={video.id}
            className="w-[280px] sm:w-[320px] shrink-0 snap-start"
          >
            <VideoCard
              video={video}
              variant="row"
              isFavorite={isFavorite(video.id)}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
