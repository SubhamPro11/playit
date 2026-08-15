import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Video } from '../../types/video';
import { CATEGORIES, Category } from '../../data/playlist';
import { uploadThumbnailImage } from '../../lib/storage';

interface AddVideoModalProps {
  isOpen: boolean;
  nextOrderIndex: number;
  onClose: () => void;
  onAdd: (newVideo: Omit<Video, 'id'>) => Promise<boolean>;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({
  isOpen,
  nextOrderIndex,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState<Category>('Radio & mixtapes');
  const [orderIndex, setOrderIndex] = useState(nextOrderIndex);
  const [thumbnailMode, setThumbnailMode] = useState<'url' | 'upload'>('url');
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectableCategories = CATEGORIES.filter((c) => c !== 'All') as Category[];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadThumbnailImage(file);
      setThumbnailUrl(uploadedUrl);
    } catch (err) {
      setError((err as Error).message || 'Failed to upload image file');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!externalLink.trim()) {
      setError('External link is required');
      return;
    }
    if (!thumbnailUrl.trim()) {
      setError('Thumbnail image is required');
      return;
    }

    setLoading(true);
    const success = await onAdd({
      title: title.trim(),
      externalLink: externalLink.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      category,
      orderIndex: Number(orderIndex) || nextOrderIndex,
    });

    setLoading(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="bg-[#111114] border border-[#27272a] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#27272a] flex items-center justify-between">
          <div>
            <h2 className="font-sans font-bold text-base text-white">
              Add new playlist entry
            </h2>
            <p className="font-mono text-[11px] text-zinc-500">
              New entry #{String(orderIndex).padStart(2, '0')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1f1f26] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Saloon WTF Radio"
              className="w-full px-3.5 py-2 bg-[#0a0a0d] text-sm text-white rounded-xl border border-[#27272a] focus:border-red-500 focus:outline-none font-sans transition-colors"
            />
          </div>

          {/* External Link */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1">
              External link <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2 bg-[#0a0a0d] text-sm text-white rounded-xl border border-[#27272a] focus:border-red-500 focus:outline-none font-sans transition-colors"
            />
          </div>

          {/* Category & Order Position Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2 bg-[#0a0a0d] text-sm text-white rounded-xl border border-[#27272a] focus:border-red-500 focus:outline-none font-sans cursor-pointer transition-colors"
              >
                {selectableCategories.map((c) => (
                  <option key={c} value={c} className="bg-[#111114] text-zinc-200">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1">
                Order position
              </label>
              <input
                type="number"
                min="1"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#0a0a0d] text-sm text-white rounded-xl border border-[#27272a] focus:border-red-500 focus:outline-none font-mono transition-colors"
              />
            </div>
          </div>

          {/* Thumbnail Image Mode Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-zinc-300 uppercase tracking-wider">
                Thumbnail image <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setThumbnailMode('url')}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono cursor-pointer transition-colors ${
                    thumbnailMode === 'url'
                      ? 'bg-red-600 text-white font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-white bg-[#141418]'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <LinkIcon className="w-2.5 h-2.5" /> URL
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnailMode('upload')}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono cursor-pointer transition-colors ${
                    thumbnailMode === 'upload'
                      ? 'bg-red-600 text-white font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-white bg-[#141418]'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <Upload className="w-2.5 h-2.5" /> Upload
                  </span>
                </button>
              </div>
            </div>

            {thumbnailMode === 'url' ? (
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 bg-[#0a0a0d] text-sm text-white rounded-xl border border-[#27272a] focus:border-red-500 focus:outline-none font-sans transition-colors"
              />
            ) : (
              <label className="flex flex-col items-center justify-center border border-dashed border-[#27272a] hover:border-red-500/80 rounded-xl p-4 bg-[#0a0a0d] cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                <span className="text-xs text-zinc-300">
                  {uploadingImage ? 'Uploading image to storage...' : 'Choose an image file'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono mt-0.5">PNG, JPG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Thumbnail Preview */}
            {thumbnailUrl && (
              <div className="mt-2.5 flex items-center gap-3 p-2.5 bg-[#0a0a0d] rounded-xl border border-[#27272a]">
                <div className="w-16 aspect-video bg-black rounded-lg overflow-hidden shrink-0 border border-[#27272a]">
                  <img
                    src={thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setError('Image URL is unreachable or invalid')}
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs font-mono text-zinc-400 truncate">
                  <div className="text-zinc-200 font-semibold flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-red-500" />
                    <span>Thumbnail preview</span>
                  </div>
                  <div className="truncate text-[10px] text-zinc-500 mt-0.5">
                    {thumbnailUrl}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#27272a] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#141418] hover:bg-[#1f1f26] text-zinc-300 font-mono text-xs cursor-pointer transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-red-950/40"
            >
              {loading ? 'Adding...' : 'Add entry'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
