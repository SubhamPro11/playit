import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Shuffle, ChevronDown } from 'lucide-react';

export type SortOption = 'default' | 'az' | 'za' | 'shuffle';

interface SortControlProps {
  currentSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  onShuffle: () => void;
}

export const SortControl: React.FC<SortControlProps> = ({
  currentSort,
  onSelectSort,
  onShuffle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'default':
        return 'Default order';
      case 'az':
        return 'Title: A–Z';
      case 'za':
        return 'Title: Z–A';
      case 'shuffle':
        return 'Shuffled';
      default:
        return 'Sort';
    }
  };

  const handleSelect = (sort: SortOption) => {
    if (sort === 'shuffle') {
      onShuffle();
    } else {
      onSelectSort(sort);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white border border-surface-700 hover:border-surface-600 text-xs font-medium transition-colors cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {currentSort === 'shuffle' ? (
          <Shuffle className="w-3.5 h-3.5 text-accent-500" />
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        )}
        <span>{getSortLabel(currentSort)}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-xl shadow-xl bg-surface-850 border border-surface-700 z-50 p-1 focus:outline-none">
          <button
            onClick={() => handleSelect('default')}
            className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
              currentSort === 'default'
                ? 'bg-accent-500/15 text-accent-400 font-semibold'
                : 'text-slate-300 hover:bg-surface-800 hover:text-white'
            }`}
          >
            <span>Default order</span>
            {currentSort === 'default' && <span className="text-xs text-accent-400 font-bold">✓</span>}
          </button>

          <button
            onClick={() => handleSelect('az')}
            className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
              currentSort === 'az'
                ? 'bg-accent-500/15 text-accent-400 font-semibold'
                : 'text-slate-300 hover:bg-surface-800 hover:text-white'
            }`}
          >
            <span>Title: A–Z</span>
            {currentSort === 'az' && <span className="text-xs text-accent-400 font-bold">✓</span>}
          </button>

          <button
            onClick={() => handleSelect('za')}
            className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
              currentSort === 'za'
                ? 'bg-accent-500/15 text-accent-400 font-semibold'
                : 'text-slate-300 hover:bg-surface-800 hover:text-white'
            }`}
          >
            <span>Title: Z–A</span>
            {currentSort === 'za' && <span className="text-xs text-accent-400 font-bold">✓</span>}
          </button>

          <div className="border-t border-surface-750 my-1" />

          <button
            onClick={() => handleSelect('shuffle')}
            className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              currentSort === 'shuffle'
                ? 'bg-accent-500/15 text-accent-400 font-semibold'
                : 'text-slate-300 hover:bg-surface-800 hover:text-white'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5 text-accent-500" />
            <span>Shuffle playlist</span>
          </button>
        </div>
      )}
    </div>
  );
};
