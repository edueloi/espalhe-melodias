import { BlogPost, HealthEvent, InstagramPost, StoryHighlight } from '@/src/types';

export const mockBlogPost: BlogPost = {
  id: 'blog-1',
  title: 'Bem-vindo ao Espalhe Melodias',
  excerpt: 'Descubra a jornada de uma comunidade dedicada à saúde mental',
  content: 'Conteúdo completo do artigo...',
  category: 'Bem-estar',
  imageUrl: 'https://images.unsplash.com/photo-1501526029524-a8ea952b3a43?q=80&w=500&auto=format&fit=crop',
  authorName: 'Dra. Carolina Silva',
  authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
  date: new Date().toISOString(),
  readTime: '5 min',
  published: true,
  featured: true,
};

export const mockHealthEvent: HealthEvent = {
  id: 'event-1',
  title: '1º Encontro Espalhe Melodias',
  instructorName: 'Equipe Melodias',
  instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  time: '14:00',
  description: 'Encontro inaugural da comunidade',
  category: 'Encontro',
  status: 'upcoming',
  participantsCount: 25,
  isEnrolled: false,
};

export const mockInstagramPost: InstagramPost = {
  id: 'ig-1',
  image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=500&auto=format&fit=crop',
  caption: 'Conexões que transformam 🎶💚',
  likes_count: 124,
  comments_count: 18,
  instagram_url: 'https://instagram.com/p/abc123',
  published_at: new Date().toISOString(),
};

export const mockStoryHighlight: StoryHighlight = {
  id: 'story-1',
  title: 'Eventos',
  cover_media_url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=400&auto=format&fit=crop',
};

export const mockNewsletterSubscription = {
  email: 'test@example.com',
  subscribed: true,
  subscribedAt: new Date().toISOString(),
};

export const mockContactMessage = {
  id: 'msg-1',
  name: 'João Silva',
  email: 'joao@example.com',
  subject: 'Dúvida sobre inscrição',
  message: 'Gostaria de saber mais sobre o programa...',
  status: 'new',
  createdAt: new Date().toISOString(),
};

export const mockEventInscription = {
  id: 'insc-1',
  eventId: 'event-1',
  userId: 'user-1',
  email: 'user@example.com',
  name: 'User Name',
  phone: '11999999999',
  specialty: 'Psicólogo(a)',
  status: 'confirmed',
  enrolledAt: new Date().toISOString(),
};

export const mockWebsiteStats = {
  subscribers: 150,
  messages: 45,
  events: 8,
  upcomingEvents: 3,
  pastEvents: 5,
  totalParticipants: 320,
  blogPosts: 22,
};
