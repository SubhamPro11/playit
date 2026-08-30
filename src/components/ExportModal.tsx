import React, { useEffect } from 'react';
import { X, Download, FileCode, FileText, Check, ShieldCheck } from 'lucide-react';
import { Video } from '../types/video';
import { exportStationsAsJson, exportStationsAsOpml } from '../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: Video[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  videos,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    const data = {
      name: 'Airwaves — Curated Audio & Web Radio Showcase',
      totalEntries: videos.length,
      stations: videos.map((v) => ({
        id: v.id,
        title: v.title,
        url: v.externalLink,
        category: v.category,
      })),
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm transition-opacity cursor-pointer"
      />

      {/* Dialog Body */}
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-900 border border-surface-700/90 p-6 sm:p-8 shadow-2xl z-10 font-sans">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close export dialog"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-surface-850 hover:bg-surface-800 border border-surface-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-accent-500 shadow-sm">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 id="export-modal-title" className="font-sans font-bold text-xl sm:text-2xl text-white">
              Export Collection
            </h2>
            <p className="text-xs text-accent-400 font-mono tracking-wide uppercase mt-0.5">
              Portable, open-data formats ({videos.length} feeds)
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          Download the complete human-curated directory for use in your own scripts, bookmark managers, RSS readers, or custom audio tools. No registration required.
        </p>

        {/* Export Option Cards */}
        <div className="space-y-3.5 mb-6">
          {/* JSON Option */}
          <div className="p-4 rounded-xl bg-surface-850 border border-surface-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <FileCode className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-sans font-bold text-sm text-white">
                  JSON Format (.json)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                  Standard structured data including titles, categories, and direct website links.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-3 py-2 rounded-lg bg-surface-800 hover:bg-surface-750 text-slate-300 hover:text-white border border-surface-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                {copied ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> Copied
                  </span>
                ) : (
                  'Copy'
                )}
              </button>
              <button
                type="button"
                onClick={() => exportStationsAsJson(videos)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent-500 hover:bg-accent-400 text-surface-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* OPML Option */}
          <div className="p-4 rounded-xl bg-surface-850 border border-surface-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-sans font-bold text-sm text-white">
                  OPML 2.0 Format (.opml)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                  Categorized outlines compatible with podcast aggregators, NetNewsWire, and feed readers.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => exportStationsAsOpml(videos)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent-500 hover:bg-accent-400 text-surface-950 text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Honest note */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-950/60 border border-surface-800 text-[11px] text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Client-side generation • Instant download • Zero telemetry</span>
        </div>
      </div>
    </div>
  );
};
