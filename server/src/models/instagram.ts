/**
 * Models & Types para integração Instagram API
 * Inclui interfaces para Posts, Stories, Stats
 */

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
  media_url: string;
  thumbnail_url?: string;
  like_count: number;
  comments_count: number;
  timestamp: string;
  permalink: string;
}

export interface InstagramStats {
  username: string;
  name: string;
  biography: string;
  profile_picture_url: string;
  website?: string;
  followers_count: number;
  media_count: number;
  ig_id: string;
}

export interface InstagramFeedResponse {
  success: boolean;
  data: {
    posts: InstagramMediaItem[];
    stats: InstagramStats;
    cacheExpiry?: number;
    fetchedAt: string;
  };
  error?: string;
}

export interface InstagramStatsResponse {
  success: boolean;
  data: InstagramStats;
  error?: string;
}

export interface InstagramErrorResponse {
  success: false;
  error: string;
  code: string;
  message: string;
}
