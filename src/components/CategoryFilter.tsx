import React from 'react';
import { CATEGORIES, Category } from '../data/playlist';

interface CategoryFilterProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  onJumpToCategory?: (category: Category) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  onJumpToCategory,
}) => {
  const handleClick = (cat: Category) => {
    if (onJumpToCategory && cat !== 'All') {
      onJumpToCategory(cat);
    } else {
      onSelectCategory(selectedCategory === cat && cat !== 'All' ? 'All' : cat);
    }
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat;

        return (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer shadow-xs ${
              isSelected
                ? 'bg-lime-400 text-black font-semibold ring-1 ring-lime-300/50'
                : 'bg-[#131d33] text-slate-300 hover:bg-[#1e293b] hover:text-slate-100 border border-[#1e293b]'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};
