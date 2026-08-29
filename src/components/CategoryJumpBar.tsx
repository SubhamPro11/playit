import React, { useState, useEffect } from 'react';
import { CATEGORIES, Category } from '../data/playlist';

interface CategoryJumpBarProps {
  onJumpToCategory: (category: Category) => void;
}

export const CategoryJumpBar: React.FC<CategoryJumpBarProps> = ({
  onJumpToCategory,
}) => {
  const [currentActiveId, setCurrentActiveId] = useState<string>('');
  const realCategories = CATEGORIES.filter((c) => c !== 'All') as Category[];

  // Scrollspy to detect which category row is in viewport
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      for (const cat of realCategories) {
        const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const element = document.getElementById(slug);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setCurrentActiveId(slug);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [realCategories]);

  return (
    <div className="sticky top-[57px] z-20 bg-surface-900/95 backdrop-blur-md border-b border-surface-700 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none max-w-full">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1.5 shrink-0 hidden sm:inline">
            Channels:
          </span>
          {realCategories.map((cat) => {
            const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const isActive = currentActiveId === slug;

            return (
              <button
                key={cat}
                onClick={() => onJumpToCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-accent-500 text-surface-950 font-bold shadow-sm'
                    : 'bg-surface-850 text-slate-300 hover:bg-surface-800 hover:text-white border border-surface-700 hover:border-surface-600'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
