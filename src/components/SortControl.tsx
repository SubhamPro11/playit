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
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141418] hover:bg-[#1f1f26] text-zinc-300 hover:text-white border border-[#27272a] hover:border-[#3f3f46] font-mono text-xs font-medium transition-colors cursor-pointer shadow-xs"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {currentSort === 'shuffle' ? (
          <Shuffle className="w-3.5 h-3.5 text-red-500" />
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
        )}
        <span>{getSortLabel(currentSort)}</span>
        <ChevronDown className="w-3 h-3 text-zinc-500" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-xl shadow-2xl bg-[#111114] border border-[#27272a] z-50 p-1 focus:outline-none">
          <button
            onClick={() => handleSelect('default')}
            className={`w-full text-left px-3 py-2 text-xs font-mono rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
              currentSort === 'default'
                ? 'bg-red-500/15 text-red-400 font-semibold'
                : 'text-zinc-300 hover:bg-[#1f1f26] hover:text-white'
            }`}
          >
            <span>Default order</span>
            {currentSort === 'default' && <span className="text-[10px] text-red-400 font-bold">✓</span>}
          </button>

          <button
            onClick={() => handleSelect('az')}
            className={`w-full text-left px-3 py-2 text-xs font-mono rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
              currentSort === 'az'
                ? 'bg-red-500/15 text-red-400 font-semibold'
                : 'text-zinc-300 hover:bg-[#1f1f26] hover:text-white'
            }`}
          >
            <span>Title: A–Z</span>
            {currentSort === 'az' && <span className="text-[10px] text-red-400 font-bold">✓</span>}
          </button>

          <button
            onClick={() => handleSelect('za')}
            className={`w-full text-left px-3 py-2 text-xs font-mono rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
              currentSort === 'za'
                ? 'bg-red-500/15 text-red-400 font-semibold'
                : 'text-zinc-300 hover:bg-[#1f1f26] hover:text-white'
            }`}
          >
            <span>Title: Z–A</span>
            {currentSort === 'za' && <span className="text-[10px] text-red-400 font-bold">✓</span>}
          </button>

          <div className="border-t border-[#27272a] my-1" />

          <button
            onClick={() => handleSelect('shuffle')}
            className={`w-full text-left px-3 py-2 text-xs font-mono rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              currentSort === 'shuffle'
                ? 'bg-red-500/15 text-red-400 font-semibold'
                : 'text-zinc-300 hover:bg-[#1f1f26] hover:text-white'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5 text-red-500" />
            <span>Shuffle playlist</span>
          </button>
        </div>
      )}
    </div>
  );
};
