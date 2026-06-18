/**
 * Blog & Events System — Type Definitions
 *
 * Tipos compartilhados para Blog e Events
 */

// ═══════════════════════════════════════════════════════════════════════════════
// BLOG TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order_rank: number;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id?: string;
  category?: string;
  image_url?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  read_time: string;
  likes: number;
  liked_by: string[];
  status: BlogPostStatus;
  featured: boolean;
  featured_until?: string | null;
  views_count: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image_url?: string;
  post_date: string;
  published_at?: string | null;
  updated_at: string;
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id?: string;
  category?: string;
  imageUrl?: string;
  readTime?: string;
  status?: BlogPostStatus;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImageUrl?: string;
  featured?: boolean;
}

export interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category_id?: string;
  category?: string;
  imageUrl?: string;
  readTime?: string;
  status?: BlogPostStatus;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImageUrl?: string;
  featured?: boolean;
  featured_until?: string;
}

export interface CreateBlogCategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order_rank?: number;
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  category?: string;
  category_id?: string;
  search?: string;
  published?: 'all' | 'published';
  featured?: boolean;
  status?: 'all' | BlogPostStatus;
}

export interface BlogListResponse {
  success: true;
  data: BlogPost[];
  meta: {
    page: number;
    limit: number;
    offset: number;
    total: number;
    pages: number;
  };
}

export interface BlogSingleResponse {
  success: true;
  data: BlogPost;
}

export interface BlogLikeResponse {
  success: true;
  data: {
    likes: number;
    liked: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type EventStatus = 'upcoming' | 'past';
export type EventStatusEnum = 'draft' | 'upcoming' | 'ongoing' | 'past' | 'cancelled';

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order_rank: number;
  event_count: number;
  created_at: string;
}

export interface HealthEvent {
  id: string;
  title: string;
  slug?: string;
  description: string;
  event_date: string;
  event_time: string;
  location?: string;
  map_link?: string;
  category_id?: string;
  category?: string;
  status: EventStatus;
  status_enum?: EventStatusEnum;
  instructor_id: string;
  instructor_name: string;
  instructor_avatar?: string;
  cover_url?: string;
  thumbnail_url?: string;
  participants_count: number;
  event_capacity: number;
  waitlist_count: number;
  enrolled_user_ids: string[];
  recording_url?: string;
  seo_description?: string;
  registration_deadline?: string;
  rsvp_enabled: boolean;
  allow_guests: boolean;
  item_division: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthEventWithEnrollment extends HealthEvent {
  isEnrolled: boolean;
  enrolledUserIds: string[];
}

export interface CreateEventInput {
  title: string;
  slug?: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  mapLink?: string;
  category_id?: string;
  category?: string;
  coverUrl?: string;
  thumbnailUrl?: string;
  event_capacity?: number;
  seoDescription?: string;
  registration_deadline?: string;
  status_enum?: EventStatusEnum;
  rsvpEnabled?: boolean;
  allowGuests?: boolean;
  itemDivision?: boolean;
  divisionItems?: string[];
}

export interface UpdateEventInput {
  title?: string;
  slug?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  category_id?: string;
  category?: string;
  status_enum?: EventStatusEnum;
  recordingUrl?: string;
  seoDescription?: string;
  event_capacity?: number;
  registration_deadline?: string;
  coverUrl?: string;
  thumbnailUrl?: string;
}

export interface EventListParams {
  page?: number;
  limit?: number;
  status?: 'upcoming' | 'past' | 'all';
  status_enum?: EventStatusEnum | 'all';
  category?: string;
  category_id?: string;
  search?: string;
}

export interface EventListResponse {
  success: true;
  data: HealthEventWithEnrollment[];
  meta: {
    page: number;
    limit: number;
    offset: number;
    total: number;
    pages: number;
  };
}

export interface EventSingleResponse {
  success: true;
  data: HealthEventWithEnrollment;
}

export interface EventEnrollResponse {
  success: true;
  data: {
    enrolled: boolean;
    participantsCount: number;
    waitlist: boolean;
    message?: string;
  };
}

export interface CreateEventCategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order_rank?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMON TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  offset: number;
  total: number;
  pages: number;
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BlogStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  featured_posts: number;
  avg_likes: number;
  avg_views: number;
  max_views: number;
}

export interface EventStats {
  total_events: number;
  upcoming_events: number;
  total_registrations: number;
  avg_registrations: number;
}

export interface CategoryStats {
  name: string;
  post_count?: number;
  event_count?: number;
  avg_likes?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUERY FILTER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BlogQueryFilters {
  category_id?: string;
  category?: string;
  search?: string;
  status?: BlogPostStatus | 'all';
  featured?: boolean;
  published?: 'all' | 'published';
  sort?: 'newest' | 'oldest' | 'popular' | 'trending';
}

export interface EventQueryFilters {
  category_id?: string;
  category?: string;
  search?: string;
  status?: EventStatus | 'all';
  status_enum?: EventStatusEnum | 'all';
  date_range?: {
    start: string;
    end: string;
  };
  sort?: 'newest' | 'oldest' | 'date' | 'popular';
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR AND ICON ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export enum BadgeColor {
  CLAY = 'clay',
  MOSS = 'moss',
  NAVY = 'navy',
  ROSE = 'rose',
  AMBER = 'amber',
  TEAL = 'teal',
}

export enum IconName {
  HEART = 'heart',
  MEDITATION = 'meditation',
  YOGA = 'yoga',
  APPLE = 'apple',
  STAR = 'star',
  VIDEO = 'video',
  SPEAKER = 'speaker',
  USERS = 'users',
  GLOBE = 'globe',
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT TYPES FOR ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════

export interface DraftPost extends BlogPost {
  status: 'draft';
  published_at: null;
}

export interface PublishedPost extends BlogPost {
  status: 'published';
  published_at: string;
}

export interface EventWithDeadline extends HealthEvent {
  registration_deadline: string;
  days_until_deadline: number;
}

export interface EventWithCapacityStatus extends HealthEvent {
  available_slots: number;
  capacity_status: 'ilimitado' | 'lotado' | 'disponível';
}
