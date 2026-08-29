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
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              isSelected
                ? 'bg-accent-500 text-surface-950 font-bold'
                : 'bg-surface-850 text-slate-300 hover:bg-surface-800 hover:text-white border border-surface-700 hover:border-surface-600'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};
