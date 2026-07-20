export type UserRole = 'super-admin' | 'professional' | 'member';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  specialty?: string;
  crp?: string; // Psychologist Registration Card
  approvalStatus?: 'approved' | 'pending';
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  crp: string;
  specialties: string[];
  bio: string;
  pricePerSession: number;
  rating: number;
  reviewsCount: number;
  contactWhatsapp: string;
  services: string[];
  schedule: string[]; // Time slots
  location: string; // Remote or city
  accentColor: string; // Personal site theme color
  languages: string[];
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
  twitter?: string;
  website?: string;
  extraLinks?: Array<{ label: string; url: string }>;
}

export interface ForumTopic {
  id: string;
  title: string;
  category: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  views: number;
  replies: ForumReply[];
  isSolved?: boolean;
}

export interface ForumReply {
  id: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  content: string;
  createdAt: string;
  isExpertReply?: boolean;
}

export interface SupportMaterial {
  id: string;
  title: string;
  category: 'Ansiedade' | 'Depressão' | 'Autocuidado' | 'Relacionamentos' | 'Meditação' | 'Geral';
  type: 'E-book' | 'PDF' | 'Áudio' | 'Guia de Exercícios' | 'Infográfico';
  description: string;
  downloadUrl: string;
  authorName: string;
  dateAdded: string;
  restrictedToMembers: boolean;
}

export interface HealthEvent {
  id: string;
  title: string;
  instructorName: string;
  instructorAvatar: string;
  date: string;
  time: string;
  description: string;
  category: 'Grupo de Apoio' | 'Palestra Vivencial' | 'Workshop' | 'Meditação Coletiva';
  status: 'upcoming' | 'past';
  participantsCount: number;
  isEnrolled?: boolean;
  recordingUrl?: string; // For past events
}

export interface SupportRequest {
  id: string;
  patientName: string;
  patientEmail: string;
  urgency: 'baixa' | 'media' | 'alta' | 'urgente';
  description: string;
  createdAt: string;
  status: 'Aberto' | 'Em Atendimento' | 'Concluído';
  assignedProfessional?: string;
}

export interface SuggestionIdea {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  likes: number;
}

/** Formato "achatado" do post de blog usado pelo site público (ver convertBlogPost em usePublicSiteData.ts). */
export interface PublicBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  readTime: string;
}
