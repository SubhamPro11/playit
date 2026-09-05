import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, LogOut, ExternalLink, Search, CheckCircle2, AlertTriangle, Inbox, Check, XCircle, Activity, RefreshCw, Heart, Users, AlertCircle } from 'lucide-react';
import { Video, StationSubmission } from '../../types/video';
import { CATEGORIES, Category } from '../../data/playlist';
import { EditVideoModal } from './EditVideoModal';
import { AddVideoModal } from './AddVideoModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { SupportSettingsPanel } from './SupportSettingsPanel';
import { BrandLogo } from '../BrandLogo';
import { useLinkHealth } from '../../hooks/useLinkHealth';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { supabase } from '../../lib/supabase';

interface AdminDashboardProps {
  videos: Video[];
  submissions: StationSubmission[];
  isSupabaseConfigured: boolean;
  onUpdateVideo: (updated: Video) => Promise<boolean>;
  onDeleteVideo: (id: string) => Promise<boolean>;
  onAddVideo: (newVideo: Omit<Video, 'id'>) => Promise<boolean>;
  onReorderVideos: (reordered: Video[]) => Promise<boolean>;
  onApproveSubmission: (submission: StationSubmission) => Promise<boolean>;
  onRejectSubmission: (id: string) => Promise<boolean>;
  onDeleteSubmission: (id: string) => Promise<boolean>;
  onLogout: () => void;
  onViewPublicSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  videos,
  submissions,
  isSupabaseConfigured,
  onUpdateVideo,
  onDeleteVideo,
  onAddVideo,
  onReorderVideos,
  onApproveSubmission,
  onRejectSubmission,
  onDeleteSubmission,
  onLogout,
  onViewPublicSite,
}) => {
  const [activeTab, setActiveTab] = useState<'entries' | 'submissions' | 'support'>('entries');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Site Settings / Support QR Code State
  const {
    settings: siteSettings,
    isSupportActive,
    updateSettings: updateSiteSettings,
    clearSupportQr,
  } = useSiteSettings();
  
  // Modals state
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [registeredUsersCount, setRegisteredUsersCount] = useState<number | null>(null);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('user_signins')
        .select('user_id', { count: 'exact', head: true })
        .then(({ count, error }) => {
          if (!error && typeof count === 'number') {
            setRegisteredUsersCount(count);
          }
        });
    }
  }, [isSupabaseConfigured]);

  // Link Health State
  const {
    healthMap,
    isCheckingAll,
    progress,
    checkSingleLink,
    checkAllLinks,
    resolveBrokenReport,
  } = useLinkHealth();
  const [healthFilter, setHealthFilter] = useState<'all' | 'flagged' | 'live'>('all');
  const [singleTestingId, setSingleTestingId] = useState<string | null>(null);

  const pendingSubmissionsCount = useMemo(() => {
    return submissions.filter((s) => s.status === 'pending').length;
  }, [submissions]);

  const healthStats = useMemo(() => {
    let live = 0;
    let flagged = 0;
    let visitorReported = 0;
    let unchecked = 0;

    videos.forEach((v) => {
      const h = healthMap[v.id];
      if (!h || h.status === 'unknown') {
        unchecked++;
      } else if (h.error === 'Reported by visitor') {
        visitorReported++;
        flagged++;
      } else if (h.status === 'live' || h.status === 'redirect') {
        live++;
      } else if (h.status === 'broken' || h.status === 'timeout') {
        flagged++;
      }
    });

    return { live, flagged, visitorReported, unchecked, total: videos.length };
  }, [videos, healthMap]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage((current) => (current?.text === text ? null : current));
    }, 4000);
  };

  const handleTestSingle = async (video: Video) => {
    setSingleTestingId(video.id);
    const rep = await checkSingleLink(video);
    setSingleTestingId(null);
    if (rep.status === 'live') {
      showFeedback('success', `"${video.title}" is live and reachable`);
    } else {
      showFeedback('error', `"${video.title}" reported ${rep.status.toUpperCase()} (${rep.error || 'Check failed'})`);
    }
  };

  const filteredVideos = useMemo(() => {
    return videos
      .filter((v) => {
        const matchCategory = selectedCategory === 'All' || v.category === selectedCategory;
        const q = searchQuery.trim().toLowerCase();
        const matchSearch = !q || v.title.toLowerCase().includes(q) || v.externalLink.toLowerCase().includes(q);

        const h = healthMap[v.id];
        let matchHealth = true;
        if (healthFilter === 'flagged') {
          matchHealth = h?.status === 'broken' || h?.status === 'timeout';
        } else if (healthFilter === 'live') {
          matchHealth = h?.status === 'live' || h?.status === 'redirect';
        }

        return matchCategory && matchSearch && matchHealth;
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [videos, searchQuery, selectedCategory, healthFilter, healthMap]);

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
    <div className="min-h-screen bg-surface-900 text-slate-200 font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-900/95 backdrop-blur-md border-b border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <BrandLogo />
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-accent-500/15 text-accent-400 border border-accent-500/30 text-[10px] font-mono font-bold tracking-wider uppercase">
              Admin console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewPublicSite}
              className="px-3.5 py-2 rounded-xl bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white border border-surface-700 font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Public site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-surface-850 hover:bg-surface-800 text-slate-400 hover:text-red-400 border border-surface-700 hover:border-red-500/30 font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-surface-700 bg-surface-850">
          <div className="flex items-center gap-2.5">
            {isSupabaseConfigured ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-semibold">
                  Supabase Cloud Database Connected
                </span>
                <span className="text-xs text-slate-500 hidden md:inline">
                  (Changes persist permanently across all deployments)
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-accent-400" />
                <span className="text-xs text-accent-400 font-semibold">
                  Local Sandbox Mode
                </span>
                <span className="text-xs text-slate-400">
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-surface-700 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('entries')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'entries'
                ? 'bg-accent-500 text-surface-950 font-bold shadow-sm'
                : 'bg-surface-850 text-slate-400 hover:text-white border border-surface-700 hover:border-surface-600'
            }`}
          >
            <span>Live Catalog</span>
            <span className={`px-1.5 py-0.5 rounded-full font-mono text-[10px] ${
              activeTab === 'entries' ? 'bg-surface-950/20 text-surface-950 font-bold' : 'bg-surface-800 text-slate-300'
            }`}>
              {videos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-accent-500 text-surface-950 font-bold shadow-sm'
                : 'bg-surface-850 text-slate-400 hover:text-white border border-surface-700 hover:border-surface-600'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Community Submissions</span>
            {pendingSubmissionsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-surface-950 font-mono text-[10px] font-bold">
                {pendingSubmissionsCount} new
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'support'
                ? 'bg-accent-500 text-surface-950 font-bold shadow-sm'
                : 'bg-surface-850 text-slate-400 hover:text-white border border-surface-700 hover:border-surface-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeTab === 'support' ? 'fill-surface-950 text-surface-950' : 'text-accent-400'}`} />
            <span>Support Me / QR</span>
            {isSupportActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Honest Signed-in Listeners Metric */}
          {registeredUsersCount !== null && (
            <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-850 border border-surface-700 text-xs">
              <Users className="w-3.5 h-3.5 text-accent-400" />
              <span className="text-slate-400">Signed-in Listeners:</span>
              <span className="font-mono font-bold text-white">{registeredUsersCount}</span>
            </div>
          )}
        </div>

        {activeTab === 'entries' ? (
          <>
            {/* Link Health Monitoring Widget */}
            <div className="mb-6 p-4 rounded-xl border border-surface-700 bg-surface-850 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-accent-400" />
                    <h2 className="font-sans font-bold text-sm text-white">
                      Dead-Link Health Monitor
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Lightweight connectivity checks across all {videos.length} external streams. Flagged links are surfaced for manual review only.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => checkAllLinks(videos)}
                    disabled={isCheckingAll}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 text-slate-200 hover:text-white border border-surface-700 hover:border-surface-600 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingAll ? 'animate-spin text-accent-400' : ''}`} />
                    <span>{isCheckingAll ? `Auditing (${progress.current}/${progress.total})...` : 'Run Health Audit'}</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar when checking */}
              {isCheckingAll && (
                <div className="mt-3 w-full bg-surface-950 rounded-full h-1.5 overflow-hidden border border-surface-700">
                  <div
                    className="bg-accent-500 h-full transition-all duration-200"
                    style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
                  />
                </div>
              )}

              {/* Health Quick Filters */}
              <div className="mt-3.5 pt-3 border-t border-surface-700/80 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-500 font-mono text-[11px]">Filter by health:</span>
                <button
                  type="button"
                  onClick={() => setHealthFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    healthFilter === 'all'
                      ? 'bg-surface-700 text-white font-semibold'
                      : 'bg-surface-900 text-slate-400 hover:text-slate-200 border border-surface-750'
                  }`}
                >
                  All ({healthStats.total})
                </button>
                <button
                  type="button"
                  onClick={() => setHealthFilter('live')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    healthFilter === 'live'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'bg-surface-900 text-slate-400 hover:text-slate-200 border border-surface-750'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Reachable ({healthStats.live})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHealthFilter('flagged')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    healthFilter === 'flagged'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-semibold'
                      : 'bg-surface-900 text-slate-400 hover:text-slate-200 border border-surface-750'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Needs Review ({healthStats.flagged})</span>
                  {healthStats.visitorReported > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                      {healthStats.visitorReported} visitor reported
                    </span>
                  )}
                </button>
                {healthStats.unchecked > 0 && (
                  <span className="text-slate-500 text-[11px] ml-auto">
                    {healthStats.unchecked} unchecked
                  </span>
                )}
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-surface-700">
              <div>
                <h1 className="font-sans font-bold text-2xl text-white">
                  Playlist entries
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Manage, edit, reorder, and upload media thumbnails for all {videos.length} items.
                </p>
              </div>

              <button
                onClick={() => setIsAddOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-surface-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add new entry</span>
              </button>
            </div>

            {/* Filter / Search Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search playlist table..."
                  className="w-full pl-9 pr-4 py-2 bg-surface-850 text-xs text-slate-200 rounded-xl border border-surface-700 focus:border-accent-500 focus:outline-none font-sans transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as Category)}
                  className="px-3 py-2 bg-surface-850 text-xs text-slate-300 rounded-xl border border-surface-700 focus:border-accent-500 focus:outline-none font-sans cursor-pointer transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-surface-850 text-slate-200">
                      {cat === 'All' ? 'All categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Entries Table */}
            <div className="bg-surface-850 border border-surface-700 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-surface-700 bg-surface-900 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4 w-16 text-center">Order</th>
                      <th className="py-3 px-4 w-24">Thumb</th>
                      <th className="py-3 px-4">Title & Details</th>
                      <th className="py-3 px-4 w-36">Health</th>
                      <th className="py-3 px-4 w-36">Category</th>
                      <th className="py-3 px-4 w-24 text-center">Reorder</th>
                      <th className="py-3 px-4 w-28 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700 text-xs">
                    {filteredVideos.length > 0 ? (
                      filteredVideos.map((video, idx) => {
                        const health = healthMap[video.id];
                        const isTestingThis = singleTestingId === video.id;

                        return (
                          <tr
                            key={video.id}
                            className="hover:bg-surface-800 transition-colors group"
                          >
                            {/* Order */}
                            <td className="py-3 px-4 text-center font-mono text-accent-400 font-semibold">
                              #{String(video.orderIndex).padStart(2, '0')}
                            </td>

                            {/* Thumbnail */}
                            <td className="py-3 px-4">
                              <div className="w-16 aspect-video rounded-lg overflow-hidden bg-surface-950 border border-surface-700 relative">
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
                              <div className="font-sans font-semibold text-white group-hover:text-accent-400 transition-colors">
                                {video.title}
                              </div>
                              <a
                                href={video.externalLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-slate-400 hover:text-slate-200 truncate block mt-0.5"
                              >
                                {video.externalLink}
                              </a>
                            </td>

                            {/* Health Indicator & Quick Test */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {health?.status === 'live' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span>Live</span>
                                  </span>
                                ) : health?.error === 'Reported by visitor' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[11px]" title="Reported by visitor as not working">
                                    <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span>Visitor Report</span>
                                  </span>
                                ) : health?.status === 'redirect' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[11px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    <span>Redirect</span>
                                  </span>
                                ) : health?.error === 'Reported by visitor' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[11px]" title="Reported broken by visitor">
                                    <AlertCircle className="w-3 h-3 text-amber-400" />
                                    <span>Visitor Report</span>
                                  </span>
                                ) : health?.status === 'broken' || health?.status === 'timeout' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-[11px]" title={health.error || 'Check failed'}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                    <span>Review</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-900 text-slate-500 border border-surface-750 font-mono text-[11px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                    <span>Unchecked</span>
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleTestSingle(video)}
                                  disabled={isTestingThis || isCheckingAll}
                                  title="Test URL live connectivity"
                                  className="p-1 rounded bg-surface-900 hover:bg-surface-750 text-slate-400 hover:text-white border border-surface-750 transition-colors cursor-pointer disabled:opacity-40"
                                >
                                  <RefreshCw className={`w-3 h-3 ${isTestingThis ? 'animate-spin text-accent-400' : ''}`} />
                                </button>

                                {health?.error === 'Reported by visitor' && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await resolveBrokenReport(video.id);
                                      showFeedback('success', `Resolved visitor report for "${video.title}"`);
                                    }}
                                    title="Mark report as resolved"
                                    className="p-1 rounded bg-surface-900 hover:bg-surface-750 text-emerald-400 hover:text-emerald-300 border border-surface-750 transition-colors cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4 text-xs text-slate-300">
                              <span className="px-2.5 py-1 rounded-md bg-surface-900 border border-surface-700 inline-block">
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
                                  className="p-1 rounded-md bg-surface-900 hover:bg-surface-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border border-surface-700"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveDown(idx)}
                                  disabled={idx === filteredVideos.length - 1}
                                  title="Move down"
                                  className="p-1 rounded-md bg-surface-900 hover:bg-surface-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border border-surface-700"
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
                                  className="p-1.5 rounded-lg bg-surface-900 hover:bg-surface-750 text-slate-300 hover:text-white transition-colors cursor-pointer border border-surface-700"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeletingVideo(video)}
                                  title="Delete entry"
                                  className="p-1.5 rounded-lg bg-surface-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer border border-surface-700"
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
                        <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                          No matching playlist entries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeTab === 'submissions' ? (
          /* Submissions Moderation Tab */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-surface-700">
              <div>
                <h1 className="font-sans font-bold text-2xl text-white">
                  Community Submissions
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Review, approve, or reject station suggestions submitted by visitors.
                </p>
              </div>
            </div>

            <div className="bg-surface-850 border border-surface-700 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-surface-700 bg-surface-900 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Proposed Station</th>
                      <th className="py-3 px-4 w-36">Genre</th>
                      <th className="py-3 px-4">Submitter Notes</th>
                      <th className="py-3 px-4 w-28">Status</th>
                      <th className="py-3 px-4 w-36 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700 text-xs">
                    {submissions.length > 0 ? (
                      submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-surface-800 transition-colors">
                          {/* Station Name & Link */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-sans font-semibold text-white">
                              {sub.name}
                            </div>
                            <a
                              href={sub.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-accent-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              <span>{sub.url}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <div className="text-[10px] text-slate-500 font-mono mt-1">
                              Submitted: {new Date(sub.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 text-slate-300">
                            <span className="px-2 py-0.5 rounded-md bg-surface-900 border border-surface-700 text-xs">
                              {sub.category}
                            </span>
                          </td>

                          {/* Notes */}
                          <td className="py-3.5 px-4 text-slate-400 text-xs leading-relaxed max-w-sm">
                            {sub.notes ? sub.notes : <span className="text-slate-600 italic">No notes provided</span>}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase ${
                                sub.status === 'approved'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : sub.status === 'rejected'
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>

                          {/* Moderation Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {sub.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const ok = await onApproveSubmission(sub);
                                      if (ok) {
                                        showFeedback('success', `Approved and published "${sub.name}"!`);
                                      }
                                    }}
                                    title="Approve & Publish to Directory"
                                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const ok = await onRejectSubmission(sub.id);
                                      if (ok) {
                                        showFeedback('error', `Rejected proposal for "${sub.name}"`);
                                      }
                                    }}
                                    title="Reject submission"
                                    className="p-1.5 rounded-lg bg-surface-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer border border-surface-700"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={async () => {
                                  const ok = await onDeleteSubmission(sub.id);
                                  if (ok) {
                                    showFeedback('success', 'Submission removed');
                                  }
                                }}
                                title="Delete record"
                                className="p-1.5 rounded-lg bg-surface-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer border border-surface-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500 font-mono">
                          No suggestions submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Support Me & QR Code Settings Tab */
          <SupportSettingsPanel
            settings={siteSettings}
            onSaveSettings={updateSiteSettings}
            onClearQr={clearSupportQr}
          />
        )}

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
