/**
 * Models para o site público do Espalhe Melodias
 * - Newsletter subscribers
 * - Contact messages
 * - Event inscriptions
 * - Blog categories
 */

export interface NewsletterSubscriber {
  id: number;
  email: string;
  dateSubscribed: string;
  isActive: boolean;
  unsubscribeToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface EventInscription {
  id: number;
  userId: number;
  eventId: number;
  status: 'registered' | 'confirmed' | 'cancelled';
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  color: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicWebsiteStats {
  totalSubscribers: number;
  totalMessages: number;
  totalInscriptions: number;
  newMessagesCount: number;
}
