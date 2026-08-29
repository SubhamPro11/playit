import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { Video } from '../../types/video';
import { CATEGORIES, Category } from '../../data/playlist';
import { uploadThumbnailImage } from '../../lib/storage';
import { parseMediaLink, isValidUrl } from '../../utils/mediaLink';

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
  const [isAutoExtracted, setIsAutoExtracted] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectableCategories = CATEGORIES.filter((c) => c !== 'All') as Category[];

  // Auto-detect YouTube thumbnail when link changes
  const handleLinkChange = (value: string) => {
    setExternalLink(value);
    const parsed = parseMediaLink(value);
    if (parsed.isYouTube && parsed.suggestedThumbnailUrl) {
      if (!thumbnailUrl || isAutoExtracted) {
        setThumbnailUrl(parsed.suggestedThumbnailUrl);
        setIsAutoExtracted(true);
      }
    }
  };

  const handleAutoExtract = () => {
    const parsed = parseMediaLink(externalLink);
    if (parsed.isYouTube && parsed.suggestedThumbnailUrl) {
      setThumbnailUrl(parsed.suggestedThumbnailUrl);
      setIsAutoExtracted(true);
      setError(null);
    } else {
      setError('Could not auto-extract thumbnail. Enter an image URL or upload a file.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadThumbnailImage(file);
      setThumbnailUrl(uploadedUrl);
      setIsAutoExtracted(false);
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
    if (!isValidUrl(externalLink.trim())) {
      setError('Please enter a valid HTTP/HTTPS URL for the external link');
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
    } else {
      setError('Failed to add entry to database. Please check Supabase connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="bg-surface-850 border border-surface-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-surface-700 flex items-center justify-between">
          <div>
            <h2 className="font-sans font-bold text-base text-white">
              Add new playlist entry
            </h2>
            <p className="font-mono text-xs text-slate-400">
              New entry #{String(orderIndex).padStart(2, '0')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs text-slate-300 font-medium uppercase tracking-wider mb-1">
              Title <span className="text-accent-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Saloon WTF Radio"
              className="w-full px-3.5 py-2 bg-surface-900 text-sm text-white rounded-xl border border-surface-700 focus:border-accent-500 focus:outline-none font-sans transition-colors"
            />
          </div>

          {/* External Link */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-slate-300 font-medium uppercase tracking-wider">
                External link <span className="text-accent-400">*</span>
              </label>
              {parseMediaLink(externalLink).isYouTube && (
                <span className="text-[11px] font-mono text-accent-400 bg-accent-500/10 border border-accent-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent-400" /> YouTube detected
                </span>
              )}
            </div>
            <input
              type="url"
              value={externalLink}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder="https://example.com or https://youtube.com/watch?v=..."
              className="w-full px-3.5 py-2 bg-surface-900 text-sm text-white rounded-xl border border-surface-700 focus:border-accent-500 focus:outline-none font-sans transition-colors"
            />
          </div>

          {/* Category & Order Position Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 font-medium uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2 bg-surface-900 text-sm text-white rounded-xl border border-surface-700 focus:border-accent-500 focus:outline-none font-sans cursor-pointer transition-colors"
              >
                {selectableCategories.map((c) => (
                  <option key={c} value={c} className="bg-surface-850 text-slate-200">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium uppercase tracking-wider mb-1">
                Order position
              </label>
              <input
                type="number"
                min="1"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-surface-900 text-sm text-white rounded-xl border border-surface-700 focus:border-accent-500 focus:outline-none font-mono transition-colors"
              />
            </div>
          </div>

          {/* Thumbnail Image Mode Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-300 font-medium uppercase tracking-wider flex items-center gap-1.5">
                <span>Thumbnail image</span>
                <span className="text-accent-400">*</span>
              </label>
              <div className="flex items-center gap-1">
                {parseMediaLink(externalLink).isYouTube && (
                  <button
                    type="button"
                    onClick={handleAutoExtract}
                    className="px-2 py-0.5 rounded-md text-xs cursor-pointer text-accent-400 bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/30 transition-colors inline-flex items-center gap-1 mr-1"
                    title="Auto-fetch YouTube thumbnail"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setThumbnailMode('url')}
                  className={`px-2.5 py-0.5 rounded-md text-xs cursor-pointer transition-colors ${
                    thumbnailMode === 'url'
                      ? 'bg-accent-500 text-surface-950 font-bold'
                      : 'text-slate-400 hover:text-white bg-surface-800'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> URL
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnailMode('upload')}
                  className={`px-2.5 py-0.5 rounded-md text-xs cursor-pointer transition-colors ${
                    thumbnailMode === 'upload'
                      ? 'bg-accent-500 text-surface-950 font-bold'
                      : 'text-slate-400 hover:text-white bg-surface-800'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload
                  </span>
                </button>
              </div>
            </div>

            {thumbnailMode === 'url' ? (
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => {
                  setThumbnailUrl(e.target.value);
                  setIsAutoExtracted(false);
                }}
                placeholder="https://images.unsplash.com/... or https://img.youtube.com/..."
                className="w-full px-3.5 py-2 bg-surface-900 text-sm text-white rounded-xl border border-surface-700 focus:border-accent-500 focus:outline-none font-sans transition-colors"
              />
            ) : (
              <label className="flex flex-col items-center justify-center border border-dashed border-surface-700 hover:border-accent-500/80 rounded-xl p-4 bg-surface-900 cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs text-slate-300">
                  {uploadingImage ? 'Uploading image to storage...' : 'Choose an image file'}
                </span>
                <span className="text-xs text-slate-500 font-mono mt-0.5">PNG, JPG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Thumbnail Live Preview */}
            {thumbnailUrl && (
              <div className="mt-2.5 flex items-center gap-3 p-2.5 bg-surface-900 rounded-xl border border-surface-700">
                <div className="w-16 aspect-video bg-surface-950 rounded-lg overflow-hidden shrink-0 border border-surface-700">
                  <img
                    src={thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setError('Image URL could not be loaded. Please verify the link or upload a file.')}
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs text-slate-400 truncate">
                  <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3 text-accent-500" />
                    <span>Live thumbnail preview</span>
                    {isAutoExtracted && (
                      <span className="text-[10px] font-mono text-accent-400 bg-accent-500/10 px-1.5 py-0.2 rounded">Auto-fetched</span>
                    )}
                  </div>
                  <div className="truncate text-xs text-slate-500 mt-0.5 font-mono">
                    {thumbnailUrl}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-surface-700 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="px-4 py-2 rounded-xl bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-surface-950 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-md"
            >
              {loading ? 'Adding...' : 'Add entry'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
