import React from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { Video } from '../types/video';
import { VideoCard } from './VideoCard';

interface RecommendedSectionProps {
  videos: Video[];
  isPersonalized: boolean;
  topCategoryName?: string;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onNavigatePermalink?: (slug: string) => void;
  getReactionCount: (id: string) => number;
  hasReacted: (id: string) => boolean;
  onAddReaction: (id: string) => void;
  onRecordView?: (id: string) => void;
  onReportBroken?: (video: { id: string; externalLink: string }) => boolean;
  hasReportedBroken?: (id: string) => boolean;
}

export const RecommendedSection: React.FC<RecommendedSectionProps> = ({
  videos,
  isPersonalized,
  topCategoryName,
  isFavorite,
  onToggleFavorite,
  onNavigatePermalink,
  getReactionCount,
  hasReacted,
  onAddReaction,
  onRecordView,
  onReportBroken,
  hasReportedBroken,
}) => {
  if (videos.length === 0) return null;

  return (
    <section className="mb-8 sm:mb-12 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-surface-900 via-surface-850 to-surface-900 border border-surface-700/80 shadow-md">
      {/* Section Header with Honest Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-surface-750">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center text-accent-400">
            {isPersonalized ? (
              <Sparkles className="w-4 h-4 text-accent-400" />
            ) : (
              <Compass className="w-4 h-4 text-accent-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans font-bold text-base text-white">
                {isPersonalized ? 'Recommended for you' : 'Popular picks to get started'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-500/15 text-accent-300 border border-accent-500/30">
                {isPersonalized ? `Tuned to ${topCategoryName || 'Your Taste'}` : 'Signed-in listener'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isPersonalized
                ? 'More audio feeds matching the categories and channels you listen to most.'
                : 'Favorite or listen to a few stations to personalize this section.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Recommended Stations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <VideoCard
            key={`rec-${video.id}`}
            video={video}
            variant="grid"
            isFavorite={isFavorite(video.id)}
            onToggleFavorite={onToggleFavorite}
            onNavigatePermalink={onNavigatePermalink}
            reactionCount={getReactionCount(video.id)}
            hasReacted={hasReacted(video.id)}
            onAddReaction={onAddReaction}
            onRecordView={onRecordView}
            onReportBroken={onReportBroken}
            isBrokenReported={hasReportedBroken ? hasReportedBroken(video.id) : false}
          />
        ))}
      </div>
    </section>
  );
};
