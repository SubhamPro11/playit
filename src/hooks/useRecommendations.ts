import { useMemo } from 'react';
import { Video } from '../types/video';

export interface RecommendationResult {
  recommendedVideos: Video[];
  isPersonalized: boolean;
  topCategoryName?: string;
}

export function useRecommendations(
  videos: Video[],
  favoriteIds: string[],
  recentlyViewedIds: string[],
  isUserSignedIn: boolean
): RecommendationResult {
  return useMemo(() => {
    if (!isUserSignedIn || videos.length === 0) {
      return {
        recommendedVideos: [],
        isPersonalized: false,
      };
    }

    const interactedIds = new Set([...favoriteIds, ...recentlyViewedIds]);

    // Gather interacted video objects
    const interactedVideos = videos.filter((v) => interactedIds.has(v.id));

    // Calculate category frequency counts from user activity
    const categoryCounts: Record<string, number> = {};
    interactedVideos.forEach((v) => {
      categoryCounts[v.category] = (categoryCounts[v.category] || 0) + 1;
    });

    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    // If user has zero interactions yet, return starter picks as fallback
    if (interactedVideos.length === 0 || sortedCategories.length === 0) {
      const starterPicks = videos.slice(0, 4);
      return {
        recommendedVideos: starterPicks,
        isPersonalized: false,
      };
    }

    // Find unviewed/unfavorited stations in the user's top categories
    const unviewedInTopCategories = videos.filter(
      (v) => sortedCategories.includes(v.category) && !interactedIds.has(v.id)
    );

    // If there are unviewed items in top categories, sort them by category preference
    if (unviewedInTopCategories.length > 0) {
      const topCat = sortedCategories[0];
      const sortedByAffinity = [...unviewedInTopCategories].sort((a, b) => {
        const scoreA = categoryCounts[a.category] || 0;
        const scoreB = categoryCounts[b.category] || 0;
        return scoreB - scoreA;
      });

      return {
        recommendedVideos: sortedByAffinity.slice(0, 4),
        isPersonalized: true,
        topCategoryName: topCat,
      };
    }

    // Fallback: If all stations in preferred categories were already interacted with,
    // surface unviewed stations from other categories
    const otherUnviewed = videos.filter((v) => !interactedIds.has(v.id));
    if (otherUnviewed.length > 0) {
      return {
        recommendedVideos: otherUnviewed.slice(0, 4),
        isPersonalized: true,
        topCategoryName: sortedCategories[0],
      };
    }

    // If literally every station has been interacted with, show the top favorite category
    return {
      recommendedVideos: videos.filter((v) => v.category === sortedCategories[0]).slice(0, 4),
      isPersonalized: true,
      topCategoryName: sortedCategories[0],
    };
  }, [videos, favoriteIds, recentlyViewedIds, isUserSignedIn]);
}
