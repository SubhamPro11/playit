import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutEntry {
  keys: string[];
  description: string;
  context?: string;
}

const SHORTCUTS: ShortcutEntry[] = [
  {
    keys: ['Space'],
    description: 'Launch / open currently focused station',
    context: 'When card is focused',
  },
  {
    keys: ['→'],
    description: 'Next station card in catalog',
    context: 'Navigates & scrolls',
  },
  {
    keys: ['←'],
    description: 'Previous station card in catalog',
    context: 'Navigates & scrolls',
  },
  {
    keys: ['/'],
    description: 'Focus global search input',
    context: 'Anywhere in catalog',
  },
  {
    keys: ['Esc'],
    description: 'Blur search or close modal dialogs',
    context: 'Global',
  },
  {
    keys: ['?'],
    description: 'Toggle this keyboard shortcuts guide',
    context: 'Global',
  },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm transition-opacity cursor-pointer"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-surface-900 border border-surface-700 rounded-2xl p-6 sm:p-7 shadow-2xl z-10 text-slate-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close shortcuts guide"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-accent-500 shadow-sm">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h2 id="shortcuts-modal-title" className="text-lg font-bold text-white">
              Keyboard Shortcuts
            </h2>
            <p className="text-xs text-slate-400">
              Browse and discover independent web radio without reaching for the mouse.
            </p>
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="divide-y divide-surface-800/80 border-y border-surface-800/80 mb-5">
          {SHORTCUTS.map((sc) => (
            <div key={sc.description} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-200 truncate">
                  {sc.description}
                </p>
                {sc.context && (
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {sc.context}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {sc.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-1 rounded-md bg-surface-850 border border-surface-700 text-xs font-mono font-bold text-accent-400 shadow-xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
          <span>Shortcuts disabled while typing in text inputs</span>
          <span className="hidden sm:inline">Press Esc to dismiss</span>
        </div>
      </div>
    </div>
  );
};
