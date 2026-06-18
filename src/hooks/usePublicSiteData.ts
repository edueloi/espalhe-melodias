import { useState, useEffect } from 'react';
import {
  BlogPost,
  HealthEvent,
  InstagramPost,
  StoryHighlight,
  blogsApi,
  eventsApi,
  instagramApi,
  storiesApi,
  ApiError,
} from '../lib/api';
import {
  INITIAL_BLOGS,
  INITIAL_INSTAGRAM_POSTS,
  INITIAL_STORIES,
} from '../mockData';

// Helper to convert API blog posts to local format
function convertBlogPost(api: any): BlogPost {
  // If already in local format, return as-is
  if (api.imageUrl && api.authorName && api.date && api.readTime) {
    return api;
  }
  // Convert from API format
  const readTimeEstimate = Math.ceil(api.content?.split(/\s+/).length / 200) || 5;
  return {
    id: api.id,
    title: api.title,
    excerpt: api.excerpt,
    content: api.content,
    category: api.category,
    imageUrl: api.image_url || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=500&auto=format&fit=crop',
    authorName: api.author_name,
    authorAvatar: api.author_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    date: api.created_at || api.post_date || new Date().toISOString(),
    readTime: api.read_time || `${readTimeEstimate} min`,
    featured: api.featured,
    published: api.published,
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
    instructorAvatar: api.instructor_avatar || api.organizer_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    date: eventDate,
    time: eventTime,
    description: api.description,
    category: api.category || api.type || 'Evento',
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

  // Testimonials (static, loaded separately)
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

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    authorName: 'Dra. Carolina Silva',
    role: 'Psicóloga Clínica',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
    text: 'O Espalhe Melodias abriu portas para conexões genuínas com outros profissionais. Cada encontro nos fortalece e amplia nossas possibilidades.',
    date: '2026-06-08'
  },
  {
    id: 'test-2',
    authorName: 'Dr. Felipe Oliveira',
    role: 'Psiquiatra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    text: 'Raramente encontro um espaço tão acolhedor e profissional. A qualidade das conversas é excepcional.',
    date: '2026-06-06'
  },
  {
    id: 'test-3',
    authorName: 'Terapeuta Ana Costa',
    role: 'Terapeuta Ocupacional',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    text: 'Multidisciplinaridade real! As perspectivas diferentes enriquecem minha prática profissional todos os dias.',
    date: '2026-06-03'
  }
];

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

  // Testimonials (static)
  const [testimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);

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
        const blogsResult = await blogsApi.list({ published: true });
        // Handle both array and PagedResult formats
        const blogsList = Array.isArray(blogsResult)
          ? blogsResult
          : (blogsResult as any).data || INITIAL_BLOGS;
        // Convert to local format
        const convertedBlogs = blogsList.map(convertBlogPost);
        setBlogs(convertedBlogs);
        setBlogsError(null);
      } catch (err) {
        console.warn('Failed to load blogs, using mock data:', err);
        // Fallback to mock data
        const mockBlogs = INITIAL_BLOGS.map(convertBlogPost);
        setBlogs(mockBlogs);
        const error = err instanceof ApiError ? err : new Error(String(err));
        setBlogsError(error);
      } finally {
        setBlogsLoading(false);
      }

      // Load events
      try {
        setEventsLoading(true);
        const eventsResult = await eventsApi.list();
        const eventsList = Array.isArray(eventsResult)
          ? eventsResult
          : (eventsResult as any).data || [];
        // Convert to local format
        const convertedEvents = eventsList.map(convertHealthEvent);
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
        console.warn('Failed to load events, using fallback:', err);
        // Fallback - events might not be available yet
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
        const instagramResult = await instagramApi.feed();
        const posts = Array.isArray(instagramResult)
          ? instagramResult
          : (instagramResult as any).data || INITIAL_INSTAGRAM_POSTS;
        setInstagramPosts(posts.slice(0, 6)); // Show max 6
        setInstagramError(null);
      } catch (err) {
        console.warn('Failed to load Instagram feed, using mock data:', err);
        setInstagramPosts(INITIAL_INSTAGRAM_POSTS.slice(0, 6));
        const error = err instanceof ApiError ? err : new Error(String(err));
        setInstagramError(error);
      } finally {
        setInstagramLoading(false);
      }

      // Load Stories
      try {
        setStoriesLoading(true);
        const storiesResult = await storiesApi.list();
        const storiesList = Array.isArray(storiesResult)
          ? storiesResult
          : (storiesResult as any).data || INITIAL_STORIES;
        setStories(storiesList);
        setStoriesError(null);
      } catch (err) {
        console.warn('Failed to load stories, using mock data:', err);
        setStories(INITIAL_STORIES);
        const error = err instanceof ApiError ? err : new Error(String(err));
        setStoriesError(error);
      } finally {
        setStoriesLoading(false);
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
    testimonials,
    recentActivity,
    isLoading:
      blogsLoading || eventsLoading || instagramLoading || storiesLoading,
    hasError: Boolean(blogsError || eventsError || instagramError || storiesError),
    error: globalError,
    refetch: loadData,
  };
}
