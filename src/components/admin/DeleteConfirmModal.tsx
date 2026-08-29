import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Video } from '../../types/video';

interface DeleteConfirmModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<boolean>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  video,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-sans">
      <div className="bg-surface-850 border border-surface-700 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
        
        <div className="px-5 py-4 border-b border-surface-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400 font-sans font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Confirm deletion</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to remove <strong className="text-white">&ldquo;{video.title}&rdquo;</strong> from the playlist?
          </p>
          <div className="mt-3 p-3 rounded-xl bg-surface-900 border border-surface-700 text-xs text-slate-400">
            <div>Order: <span className="font-mono">#{String(video.orderIndex).padStart(2, '0')}</span></div>
            <div className="truncate text-slate-500 mt-0.5 font-mono text-[11px]">{video.externalLink}</div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 text-slate-300 font-medium text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(video.id)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              Delete entry
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
