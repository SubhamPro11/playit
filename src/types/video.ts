export interface Video {
  id: string;
  orderIndex: number;
  title: string;
  externalLink: string;
  thumbnailUrl: string;
  category: string;
  accentColor?: string;
}

export interface PlaylistData {
  title: string;
  description: string;
  videos: Video[];
}
