export interface Video {
  id: string;
  orderIndex: number;
  title: string;
  externalLink: string;
  thumbnailUrl: string;
  category: string;
  accentColor?: string;
  creator?: string;
  creatorUrl?: string;
}

export interface PlaylistData {
  title: string;
  description: string;
  videos: Video[];
}

export const DEFAULT_FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';

export const CATEGORY_FALLBACK_THUMBNAILS: Record<string, string> = {
  'Radio & mixtapes': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  'Travel & transit': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  'Folk & regional': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  'Classical & instrumental': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  'Nostalgia & retro': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80',
  'Devotional & spiritual': 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
  'Ambient & mood': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
};

export function getEffectiveThumbnailUrl(video: Partial<Video>): string {
  if (video.thumbnailUrl && video.thumbnailUrl.trim()) {
    return video.thumbnailUrl.trim();
  }
  if (video.category && CATEGORY_FALLBACK_THUMBNAILS[video.category]) {
    return CATEGORY_FALLBACK_THUMBNAILS[video.category];
  }
  return DEFAULT_FALLBACK_THUMBNAIL;
}

export interface StationSubmission {
  id: string;
  name: string;
  url: string;
  category: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type HealthStatusType = 'live' | 'redirect' | 'broken' | 'timeout' | 'checking' | 'unknown';

export interface LinkHealthReport {
  videoId: string;
  url: string;
  status: HealthStatusType;
  httpStatus?: number;
  lastChecked: string;
  responseTimeMs?: number;
  error?: string;
}



