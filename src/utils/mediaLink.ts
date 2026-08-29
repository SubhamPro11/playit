/**
 * Utility functions for parsing media links, detecting providers (e.g. YouTube),
 * and extracting thumbnail images automatically.
 */

export interface ParsedMediaLink {
  isYouTube: boolean;
  youTubeId: string | null;
  suggestedThumbnailUrl: string | null;
  normalizedUrl: string;
}

/**
 * Extracts YouTube 11-character video ID from diverse URL formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/v/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://www.youtube.com/live/dQw4w9WgXcQ
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Pattern matching standard youtube and youtu.be URLs
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : null;
}

/**
 * Returns the highest quality thumbnail URL available for a given YouTube Video ID.
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: 'maxres' | 'hq' | 'mq' = 'hq'
): string {
  if (quality === 'maxres') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  if (quality === 'mq') {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Parses any incoming media URL and returns detected metadata and suggested thumbnail.
 */
export function parseMediaLink(url: string): ParsedMediaLink {
  const trimmed = (url || '').trim();
  const youTubeId = extractYouTubeId(trimmed);

  if (youTubeId) {
    return {
      isYouTube: true,
      youTubeId,
      suggestedThumbnailUrl: getYouTubeThumbnailUrl(youTubeId, 'hq'),
      normalizedUrl: trimmed,
    };
  }

  return {
    isYouTube: false,
    youTubeId: null,
    suggestedThumbnailUrl: null,
    normalizedUrl: trimmed,
  };
}

/**
 * Checks if a string is a syntactically valid HTTP/HTTPS URL.
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
