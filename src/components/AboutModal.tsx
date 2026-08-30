import React, { useEffect } from 'react';
import { X, Radio, ShieldCheck, HeartHandshake, Compass } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
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
      aria-labelledby="about-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-surface-900 border border-surface-700 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] z-10 text-slate-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close about modal"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-accent-500 shadow-sm">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 id="about-modal-title" className="font-sans font-bold text-xl sm:text-2xl text-white">
              About Airwaves
            </h2>
            <p className="text-xs text-accent-400 font-mono tracking-wide uppercase mt-0.5">
              An open, human-curated audio directory
            </p>
          </div>
        </div>

        {/* Narrative & Curation Story */}
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
          <p>
            Modern music and audio streaming has become dominated by algorithmic recommendations designed to maximize watch-time and ad impressions rather than discovery.
          </p>
          <p>
            <strong className="text-white">Airwaves</strong> is an intentional counterweight: a single, curated collection of 70 independent web radio stations, ambient soundscape projects, long-distance highway bus mixtapes, retro television audio, and regional folk music from across India and beyond.
          </p>

          {/* Guiding Principles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
            <div className="p-4 rounded-xl bg-surface-850 border border-surface-700/80">
              <div className="flex items-center gap-2 mb-1.5 text-accent-400 font-semibold text-xs">
                <Compass className="w-4 h-4 shrink-0" />
                <span>Zero Algorithms</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Every feed is selected by hand for its atmosphere, character, and cultural uniqueness. No machine learning re-ranking.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-850 border border-surface-700/80">
              <div className="flex items-center gap-2 mb-1.5 text-accent-400 font-semibold text-xs">
                <Radio className="w-4 h-4 shrink-0" />
                <span>Direct Creator Links</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Clicking any card opens the original creator’s live website in a new tab, supporting their hosting and direct audience.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-850 border border-surface-700/80">
              <div className="flex items-center gap-2 mb-1.5 text-accent-400 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>No Ads or Trackers</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Airwaves contains zero advertisement tracking scripts, zero sponsored rankings, and stores your favorites locally on your device.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-850 border border-surface-700/80">
              <div className="flex items-center gap-2 mb-1.5 text-accent-400 font-semibold text-xs">
                <HeartHandshake className="w-4 h-4 shrink-0" />
                <span>Community Preserved</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                An active archive celebrating the craftsmanship of independent developers and audio archivists across the open web.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 border-t border-surface-700 pt-4">
            Have an independent radio or ambient soundscape project to share? Submissions will soon be open for community review.
          </p>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-white font-medium text-xs border border-surface-600 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
