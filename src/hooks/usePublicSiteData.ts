import { useState, useEffect } from 'react';
import {
  BlogPost,
  BlogPostAPI,
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
    date: api.created_at || new Date().toISOString(),
    readTime: `${readTimeEstimate} min`,
    featured: api.featured,
    published: api.published,
  };
}

// Testimonials (reuse from PublicSite.tsx)
export interface Testimonial {
  id: string;
  authorName: string;
  role: string;
  avatar: string;
  text: string;
  date: string;
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
    authorName: 'Mariana Duarte',
    role: 'Psicóloga Clínica',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    text: 'Encontrar a Espalhe Melodias foi um divisor de águas na minha carreira. Um espaço onde pude me conectar com profissionais que entendem as nuances da saúde mental. Recomendo para todo psicólogo que busca comunidade genuína.',
    date: '2026-06-08'
  },
  {
    id: 'test-2',
    authorName: 'Felipe Gomes',
    role: 'Psicólogo e Pesquisador',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    text: 'A qualidade das discussões no fórum é impressionante. Profissionais dispostos a compartilhar conhecimento, estudos e experiências. Isso elevou significativamente meu trabalho clínico.',
    date: '2026-06-06'
  },
  {
    id: 'test-3',
    authorName: 'Camila Neves',
    role: 'Orientadora Educacional',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    text: 'Os encontros presenciais foram transformadores. Depois de meses de isolamento profissional, encontrar pessoas que falam a mesma língua foi libertador. Espalhe Melodias é esperança concreta.',
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
        // If response is a PagedResult, get the data array
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
        setEvents(eventsList);

        // Separate upcoming and past events
        const now = new Date();
        const upcoming = eventsList.filter(
          (e) => new Date(e.start_date) > now && e.status === 'upcoming'
        );
        const past = eventsList.filter(
          (e) => new Date(e.start_date) <= now || e.status === 'finished'
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
      description: `Novo artigo por ${b.author_name}`,
      timestamp: b.created_at,
      relatedId: b.id,
    })) || []),
    ...(upcomingEvents.slice(0, 1).map((e) => ({
      id: `event-${e.id}`,
      type: 'event_happening' as const,
      title: e.title,
      description: `Próximo: ${new Date(e.start_date).toLocaleDateString('pt-BR')}`,
      timestamp: e.created_at,
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
