import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-medium bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white border border-surface-700 hover:border-surface-600 transition-all cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-500 ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
          <span className="hidden lg:inline text-[11px]">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-sky-400 transition-transform duration-200 hover:-rotate-12" />
          <span className="hidden lg:inline text-[11px]">Dark</span>
        </>
      )}
    </button>
  );
};
