import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, ExternalLink, LogOut, Globe, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { Video } from '../../types/video';
import { EditVideoModal } from './EditVideoModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { AddVideoModal } from './AddVideoModal';

interface AdminDashboardProps {
  videos: Video[];
  onUpdateVideo: (updated: Video) => Promise<boolean>;
  onDeleteVideo: (id: string) => Promise<boolean>;
  onAddVideo: (newVideo: Omit<Video, 'id'>) => Promise<boolean>;
  onReorderVideos: (reordered: Video[]) => Promise<boolean>;
  onLogout: () => void;
  onViewPublicSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  videos,
  onUpdateVideo,
  onDeleteVideo,
  onAddVideo,
  onReorderVideos,
  onLogout,
  onViewPublicSite,
}) => {
  const [adminSearch, setAdminSearch] = useState('');
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter videos for admin table
  const filteredVideos = useMemo(() => {
    if (!adminSearch.trim()) return videos;
    const q = adminSearch.toLowerCase().trim();
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.externalLink.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );
  }, [videos, adminSearch]);

  const handleDeleteConfirm = async (id: string) => {
    const success = await onDeleteVideo(id);
    if (success) {
      setDeletingVideo(null);
    }
    return success;
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const newVideos = [...videos];
    const temp = newVideos[index];
    newVideos[index] = newVideos[index - 1];
    newVideos[index - 1] = temp;
    await onReorderVideos(newVideos);
  };

  const handleMoveDown = async (index: number) => {
    if (index >= videos.length - 1) return;
    const newVideos = [...videos];
    const temp = newVideos[index];
    newVideos[index] = newVideos[index + 1];
    newVideos[index + 1] = temp;
    await onReorderVideos(newVideos);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-[#e2e8f0]">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 bg-[#070a12]/95 backdrop-blur-md border-b border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400"></span>
            <div>
              <h1 className="font-sans font-bold text-lg text-slate-100 leading-tight">
                Admin console
              </h1>
              <p className="font-mono text-[11px] text-slate-500">
                Single playlist management · {videos.length} entries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              onClick={onViewPublicSite}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#131d33] hover:bg-[#1e293b] text-slate-300 font-mono text-xs border border-[#1e293b] transition-colors cursor-pointer shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-lime-400" />
              <span>View public site</span>
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#131d33] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 font-mono text-xs border border-[#1e293b] transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              placeholder="Filter entries by title, URL, category..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#0f172a] text-xs text-slate-200 placeholder:text-slate-500 rounded-xl border border-[#1e293b] focus:border-lime-400 focus:outline-none font-sans"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 active:bg-lime-400 text-black font-semibold font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add new entry</span>
          </button>
        </div>

        {/* Entries Table Container with rounded-2xl */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] bg-[#0b0f19] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-28 text-center">Order & reorder</th>
                  <th className="py-3 px-4 w-28">Thumbnail</th>
                  <th className="py-3 px-4">Title & external link</th>
                  <th className="py-3 px-4 w-40">Category</th>
                  <th className="py-3 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/70 font-sans text-xs">
                {filteredVideos.length > 0 ? (
                  filteredVideos.map((video) => {
                    const actualIndex = videos.findIndex((v) => v.id === video.id);
                    const isFirst = actualIndex === 0;
                    const isLast = actualIndex === videos.length - 1;

                    return (
                      <tr
                        key={video.id}
                        className="hover:bg-[#131d33]/50 transition-colors group"
                      >
                        {/* Order & Reorder Arrows */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-mono text-slate-400 font-semibold w-7 text-center">
                              #{String(video.orderIndex).padStart(2, '0')}
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={() => handleMoveUp(actualIndex)}
                                disabled={isFirst || Boolean(adminSearch.trim())}
                                title={adminSearch ? 'Clear search to reorder' : 'Move up'}
                                aria-label={`Move ${video.title} up`}
                                className="p-1 rounded-md bg-[#131d33] hover:bg-[#1e293b] hover:text-lime-400 text-slate-400 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleMoveDown(actualIndex)}
                                disabled={isLast || Boolean(adminSearch.trim())}
                                title={adminSearch ? 'Clear search to reorder' : 'Move down'}
                                aria-label={`Move ${video.title} down`}
                                className="p-1 rounded-md bg-[#131d33] hover:bg-[#1e293b] hover:text-lime-400 text-slate-400 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Thumbnail Preview with matching rounded-lg */}
                        <td className="py-3 px-4">
                          <div className="w-20 aspect-video rounded-lg bg-black overflow-hidden border border-[#1e293b] relative">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </td>

                        {/* Title & Domain Link */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-100 leading-snug">
                            {video.title}
                          </div>
                          <a
                            href={video.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 hover:text-lime-400 transition-colors mt-0.5 max-w-md truncate"
                          >
                            <span className="truncate">{video.externalLink}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>

                        {/* Category badge */}
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#131d33] border border-[#1e293b] font-mono text-[11px] text-slate-300">
                            {video.category}
                          </span>
                        </td>

                        {/* Actions with rounded-lg buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingVideo(video)}
                              title="Edit entry"
                              aria-label={`Edit ${video.title}`}
                              className="p-1.5 rounded-lg bg-[#131d33] hover:bg-[#1e293b] text-slate-300 hover:text-lime-400 border border-[#1e293b] transition-colors cursor-pointer shadow-xs"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingVideo(video)}
                              title="Delete entry"
                              aria-label={`Delete ${video.title}`}
                              className="p-1.5 rounded-lg bg-[#131d33] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-[#1e293b] transition-colors cursor-pointer shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-mono text-xs">
                      No entries found matching &ldquo;{adminSearch}&rdquo;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Modals */}
      {isAddModalOpen && (
        <AddVideoModal
          isOpen={isAddModalOpen}
          nextOrderIndex={videos.length + 1}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={onAddVideo}
        />
      )}

      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          isOpen={Boolean(editingVideo)}
          onClose={() => setEditingVideo(null)}
          onSave={onUpdateVideo}
        />
      )}

      {deletingVideo && (
        <DeleteConfirmModal
          video={deletingVideo}
          isOpen={Boolean(deletingVideo)}
          onClose={() => setDeletingVideo(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};
