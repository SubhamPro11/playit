import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, LogOut, ExternalLink, Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Video } from '../../types/video';
import { CATEGORIES, Category } from '../../data/playlist';
import { EditVideoModal } from './EditVideoModal';
import { AddVideoModal } from './AddVideoModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { BrandLogo } from '../BrandLogo';

interface AdminDashboardProps {
  videos: Video[];
  isSupabaseConfigured: boolean;
  onUpdateVideo: (updated: Video) => Promise<boolean>;
  onDeleteVideo: (id: string) => Promise<boolean>;
  onAddVideo: (newVideo: Omit<Video, 'id'>) => Promise<boolean>;
  onReorderVideos: (reordered: Video[]) => Promise<boolean>;
  onLogout: () => void;
  onViewPublicSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  videos,
  isSupabaseConfigured,
  onUpdateVideo,
  onDeleteVideo,
  onAddVideo,
  onReorderVideos,
  onLogout,
  onViewPublicSite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Modals state
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage((current) => (current?.text === text ? null : current));
    }, 4000);
  };

  const filteredVideos = useMemo(() => {
    return videos
      .filter((v) => {
        const matchCategory = selectedCategory === 'All' || v.category === selectedCategory;
        if (!searchQuery.trim()) return matchCategory;
        const q = searchQuery.toLowerCase();
        return matchCategory && (v.title.toLowerCase().includes(q) || v.externalLink.toLowerCase().includes(q));
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [videos, searchQuery, selectedCategory]);

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const newVideos = [...videos];
    const currentVideo = filteredVideos[index];
    const prevVideo = filteredVideos[index - 1];
    const idxA = newVideos.findIndex((v) => v.id === currentVideo.id);
    const idxB = newVideos.findIndex((v) => v.id === prevVideo.id);
    if (idxA !== -1 && idxB !== -1) {
      [newVideos[idxA], newVideos[idxB]] = [newVideos[idxB], newVideos[idxA]];
      const ok = await onReorderVideos(newVideos);
      if (ok) {
        showFeedback('success', `Moved "${currentVideo.title}" up`);
      } else {
        showFeedback('error', 'Failed to reorder entries in database');
      }
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= filteredVideos.length - 1) return;
    const newVideos = [...videos];
    const currentVideo = filteredVideos[index];
    const nextVideo = filteredVideos[index + 1];
    const idxA = newVideos.findIndex((v) => v.id === currentVideo.id);
    const idxB = newVideos.findIndex((v) => v.id === nextVideo.id);
    if (idxA !== -1 && idxB !== -1) {
      [newVideos[idxA], newVideos[idxB]] = [newVideos[idxB], newVideos[idxA]];
      const ok = await onReorderVideos(newVideos);
      if (ok) {
        showFeedback('success', `Moved "${currentVideo.title}" down`);
      } else {
        showFeedback('error', 'Failed to reorder entries in database');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-200 font-sans">
      
      {/* Top Admin Navigation */}
      <header className="sticky top-0 z-30 bg-[#0a0a0d]/95 backdrop-blur-md border-b border-[#27272a] px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <BrandLogo />
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold tracking-wider uppercase">
              Admin console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewPublicSite}
              className="px-3.5 py-2 rounded-xl bg-[#141418] hover:bg-[#1f1f26] text-zinc-300 hover:text-white border border-[#27272a] font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Public site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-[#141418] hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-[#27272a] hover:border-red-500/30 font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Database Connection Status Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border bg-[#111114]">
          <div className="flex items-center gap-2.5">
            {isSupabaseConfigured ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-emerald-400 font-semibold">
                  Supabase Cloud Database Connected
                </span>
                <span className="text-[11px] font-mono text-zinc-500 hidden md:inline">
                  (Changes persist permanently across all deployments)
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs text-amber-400 font-semibold">
                  Local Sandbox Mode
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  (Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in deployment environment variables to persist in cloud)
                </span>
              </>
            )}
          </div>

          {/* Toast Notification */}
          {statusMessage && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border animate-in fade-in duration-200 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-300 border-red-500/30'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#27272a]">
          
          <div>
            <h1 className="font-sans font-bold text-2xl text-white">
              Playlist entries
            </h1>
            <p className="font-mono text-xs text-zinc-400 mt-1">
              Manage, edit, reorder, and upload media thumbnails for all {videos.length} items.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 shadow-lg shadow-red-950/50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add new entry</span>
          </button>
        </div>

        {/* Filter / Search Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search playlist table..."
              className="w-full pl-9 pr-4 py-2 bg-[#111114] text-xs text-zinc-200 rounded-xl border border-[#27272a] focus:border-red-500 focus:outline-none font-sans transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="px-3 py-2 bg-[#111114] text-xs text-zinc-300 rounded-xl border border-[#27272a] focus:border-red-500 focus:outline-none font-sans cursor-pointer transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#111114] text-zinc-200">
                  {cat === 'All' ? 'All categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Entries Table */}
        <div className="bg-[#111114] border border-[#27272a] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#0a0a0d] text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">Order</th>
                  <th className="py-3 px-4 w-24">Thumb</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4 w-44">Category</th>
                  <th className="py-3 px-4 w-28 text-center">Reorder</th>
                  <th className="py-3 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a] text-xs">
                {filteredVideos.length > 0 ? (
                  filteredVideos.map((video, idx) => (
                    <tr
                      key={video.id}
                      className="hover:bg-[#16161c] transition-colors group"
                    >
                      {/* Order */}
                      <td className="py-3 px-4 text-center font-mono text-red-400 font-semibold">
                        #{String(video.orderIndex).padStart(2, '0')}
                      </td>

                      {/* Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-16 aspect-video rounded-lg overflow-hidden bg-black border border-[#27272a] relative">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </td>

                      {/* Title & Link */}
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <div className="font-sans font-semibold text-white group-hover:text-red-400 transition-colors">
                          {video.title}
                        </div>
                        <a
                          href={video.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-zinc-500 hover:text-zinc-300 truncate block mt-0.5"
                        >
                          {video.externalLink}
                        </a>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                        <span className="px-2.5 py-1 rounded-md bg-[#141418] border border-[#27272a] inline-block">
                          {video.category}
                        </span>
                      </td>

                      {/* Reorder Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            title="Move up"
                            className="p-1 rounded-md bg-[#141418] hover:bg-[#1f1f26] text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border border-[#27272a]"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx === filteredVideos.length - 1}
                            title="Move down"
                            className="p-1 rounded-md bg-[#141418] hover:bg-[#1f1f26] text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border border-[#27272a]"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingVideo(video)}
                            title="Edit entry"
                            className="p-1.5 rounded-lg bg-[#141418] hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-[#27272a]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingVideo(video)}
                            title="Delete entry"
                            className="p-1.5 rounded-lg bg-[#141418] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer border border-[#27272a]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono">
                      No matching playlist entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Modals */}
      <AddVideoModal
        isOpen={isAddOpen}
        nextOrderIndex={videos.length + 1}
        onClose={() => setIsAddOpen(false)}
        onAdd={async (newVideo) => {
          const success = await onAddVideo(newVideo);
          if (success) {
            showFeedback('success', `Added "${newVideo.title}" to playlist`);
          }
          return success;
        }}
      />

      <EditVideoModal
        video={editingVideo}
        isOpen={!!editingVideo}
        onClose={() => setEditingVideo(null)}
        onSave={async (id, updates) => {
          if (!editingVideo) return false;
          const success = await onUpdateVideo({
            ...editingVideo,
            ...updates,
            id,
          });
          if (success) {
            showFeedback('success', `Saved changes for "${updates.title || editingVideo.title}"`);
          }
          return success;
        }}
      />

      <DeleteConfirmModal
        video={deletingVideo}
        isOpen={!!deletingVideo}
        onClose={() => setDeletingVideo(null)}
        onConfirm={async (id) => {
          const title = deletingVideo?.title || 'Entry';
          const success = await onDeleteVideo(id);
          if (success) {
            showFeedback('success', `Deleted "${title}"`);
          }
          return success;
        }}
      />
    </div>
  );
};
