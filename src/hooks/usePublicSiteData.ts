import { useState, useEffect } from 'react';
import {
  InstagramPost,
  StoryHighlight,
  GalleryPhoto,
  blogsApi,
  eventsApi,
  instagramApi,
  storiesApi,
  galleryApi,
  ApiError,
} from '../lib/api';
import { BlogPost, HealthEvent } from '../types';

// Normaliza o formato da API para o tipo BlogPost local (types.ts)
export function convertBlogPost(api: any): BlogPost {
  const readTimeEstimate = Math.ceil((api.content?.split(/\s+/).length ?? 0) / 200) || 5;
  return {
    id: api.id,
    title: api.title,
    excerpt: api.excerpt,
    content: api.content,
    category: api.category,
    imageUrl: api.image_url ?? '',
    authorName: api.author_name ?? '',
    authorAvatar: api.author_avatar ?? '',
    date: api.created_at || api.post_date || '',
    readTime: api.read_time || `${readTimeEstimate} min`,
  };
}

// Helper to convert API events to local format
function convertHealthEvent(api: any): HealthEvent {
  // If already in local format, return as-is
  if (api.instructorName && api.date && api.time) {
    return api;
  }
  // Convert from API format
  const eventDate = api.event_date || api.start_date;
  const eventTime = api.event_time || '';
  return {
    id: api.id,
    title: api.title,
    instructorName: api.instructor_name || api.organizer_name || 'Espalhe Melodias',
    instructorAvatar: api.instructor_avatar || api.organizer_avatar || '',
    date: eventDate,
    time: eventTime,
    description: api.description,
    category: (api.category || api.type || 'Grupo de Apoio') as HealthEvent['category'],
    status: api.status,
    participantsCount: api.participants_count || api.enrolled_count || 0,
    isEnrolled: api.isEnrolled || false,
    recordingUrl: api.recording_url,
  };
}

// Testimonials (static)
export interface Testimonial {
  id: string;
  authorName: string;
  role: string;
  avatar: string;
  text: string;
  date?: string;
}

export interface ActivityItem {
  id: string;
  type: 'new_blog' | 'new_event' | 'new_member' | 'event_happening';
  title: string;
  description: string;
  timestamp: string;
  relatedId?: string;
}

export interface PublicSiteData {
  // Blog data
  blogs: BlogPost[];
  blogsLoading: boolean;
  blogsError: Error | null;

  // Events data
  events: HealthEvent[];
  upcomingEvents: HealthEvent[];
  pastEvents: HealthEvent[];
  eventsLoading: boolean;
  eventsError: Error | null;

  // Instagram data
  instagramPosts: InstagramPost[];
  instagramLoading: boolean;
  instagramError: Error | null;

  // Stories data
  stories: StoryHighlight[];
  storiesLoading: boolean;
  storiesError: Error | null;

  // Gallery data
  galleryPhotos: GalleryPhoto[];
  galleryLoading: boolean;
  galleryError: Error | null;

  // Testimonials
  testimonials: Testimonial[];

  // Recent activity (computed from other data)
  recentActivity: ActivityItem[];

  // Loading states
  isLoading: boolean;
  hasError: boolean;
  error: Error | null;

  // Refetch function
  refetch: () => Promise<void>;
}

const EMPTY_TESTIMONIALS: Testimonial[] = [];

export function usePublicSiteData(): PublicSiteData {
  // Blog states
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState<Error | null>(null);

  // Events states
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<HealthEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<HealthEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<Error | null>(null);

  // Instagram states
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [instagramLoading, setInstagramLoading] = useState(true);
  const [instagramError, setInstagramError] = useState<Error | null>(null);

  // Stories states
  const [stories, setStories] = useState<StoryHighlight[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [storiesError, setStoriesError] = useState<Error | null>(null);

  // Gallery states
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState<Error | null>(null);

  const [testimonials] = useState<Testimonial[]>(EMPTY_TESTIMONIALS);

  // Overall error state
  const [hasError, setHasError] = useState(false);
  const [globalError, setGlobalError] = useState<Error | null>(null);

  // Load all data
  const loadData = async () => {
    // Reset error states
    setHasError(false);
    setGlobalError(null);

    try {
      // Load blogs
      try {
        setBlogsLoading(true);
        const blogsResult = await blogsApi.list({ limit: 10 });
        const convertedBlogs = blogsResult.data.map(convertBlogPost);
        setBlogs(convertedBlogs);
        setBlogsError(null);
      } catch (err) {
        console.warn('Failed to load blogs:', err);
        setBlogs([]);
        const error = err instanceof ApiError ? err : new Error(String(err));
        setBlogsError(error);
      } finally {
        setBlogsLoading(false);
      }

      // Load events
      try {
        setEventsLoading(true);
        const eventsResult = await eventsApi.list();
        const convertedEvents = eventsResult.data.map(convertHealthEvent);
        setEvents(convertedEvents);

        // Separate upcoming and past events
        const now = new Date();
        const upcoming = convertedEvents.filter(
          (e) => new Date(e.date) > now && e.status === 'upcoming'
        );
        const past = convertedEvents.filter(
          (e) => new Date(e.date) <= now || e.status === 'past'
        );
        setUpcomingEvents(upcoming);
        setPastEvents(past);
        setEventsError(null);
      } catch (err) {
        console.warn('Failed to load events:', err);
        setEvents([]);
        setUpcomingEvents([]);
        setPastEvents([]);
        const error = err instanceof ApiError ? err : new Error(String(err));
        setEventsError(error);
      } finally {
        setEventsLoading(false);
      }

      // Load Instagram posts
      try {
        setInstagramLoading(true);
        const posts = await instagramApi.feed({ limit: 6 });
        setInstagramPosts(posts);
        setInstagramError(null);
      } catch (err) {
        console.warn('Failed to load Instagram feed:', err);
        setInstagramPosts([]);
        const error = err instanceof ApiError ? err : new Error(String(err));
        setInstagramError(error);
      } finally {
        setInstagramLoading(false);
      }

      // Load Stories
      try {
        setStoriesLoading(true);
        const storiesList = await storiesApi.list();
        setStories(storiesList);
        setStoriesError(null);
      } catch (err) {
        console.warn('Failed to load stories:', err);
        setStories([]);
        const error = err instanceof ApiError ? err : new Error(String(err));
        setStoriesError(error);
      } finally {
        setStoriesLoading(false);
      }

      // Load Gallery photos
      try {
        setGalleryLoading(true);
        const galleryResult = await galleryApi.list({ limit: 12 });
        setGalleryPhotos(galleryResult.data);
        setGalleryError(null);
      } catch (err) {
        console.warn('Failed to load gallery photos:', err);
        setGalleryPhotos([]);
        const error = err instanceof ApiError ? err : new Error(String(err));
        setGalleryError(error);
      } finally {
        setGalleryLoading(false);
      }
    } catch (err) {
      // Catch-all for unexpected errors
      const error = err instanceof Error ? err : new Error(String(err));
      setHasError(true);
      setGlobalError(error);
      console.error('Unexpected error loading public site data:', error);
    }
  };

  // Load on mount
  useEffect(() => {
    loadData();
  }, []);

  // Compute recent activity
  const recentActivity: ActivityItem[] = [
    ...(blogs.slice(0, 2).map((b) => ({
      id: `blog-${b.id}`,
      type: 'new_blog' as const,
      title: b.title,
      description: `Novo artigo por ${b.authorName}`,
      timestamp: b.date,
      relatedId: b.id,
    })) || []),
    ...(upcomingEvents.slice(0, 1).map((e) => ({
      id: `event-${e.id}`,
      type: 'event_happening' as const,
      title: e.title,
      description: `Próximo: ${new Date(e.date).toLocaleDateString('pt-BR')}`,
      timestamp: e.date,
      relatedId: e.id,
    })) || []),
  ]
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 5);

  return {
    blogs,
    blogsLoading,
    blogsError,
    events,
    upcomingEvents,
    pastEvents,
    eventsLoading,
    eventsError,
    instagramPosts,
    instagramLoading,
    instagramError,
    stories,
    storiesLoading,
    storiesError,
    galleryPhotos,
    galleryLoading,
    galleryError,
    testimonials,
    recentActivity,
    isLoading:
      blogsLoading || eventsLoading || instagramLoading || storiesLoading || galleryLoading,
    hasError: Boolean(blogsError || eventsError || instagramError || storiesError || galleryError),
    error: globalError,
    refetch: loadData,
  };
}
