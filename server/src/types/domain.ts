// ─── Roles & Permissions ──────────────────────────────────────────────────────

export type UserRole = 'super-admin' | 'professional' | 'member';
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export type Permission =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'users:approve'
  | 'materials:read'
  | 'materials:write'
  | 'materials:delete'
  | 'forum:read'
  | 'forum:write'
  | 'forum:moderate'
  | 'events:read'
  | 'events:write'
  | 'events:delete'
  | 'help:read'
  | 'help:write'
  | 'help:triage'
  | 'suggestions:read'
  | 'suggestions:write'
  | 'professionals:read'
  | 'professionals:write'
  | 'blogs:read'
  | 'blogs:write'
  | 'blogs:delete'
  | 'preferences:read'
  | 'preferences:write'
  | 'admin:access';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'super-admin': [
    'users:read', 'users:write', 'users:delete', 'users:approve',
    'materials:read', 'materials:write', 'materials:delete',
    'forum:read', 'forum:write', 'forum:moderate',
    'events:read', 'events:write', 'events:delete',
    'help:read', 'help:write', 'help:triage',
    'suggestions:read', 'suggestions:write',
    'professionals:read', 'professionals:write',
    'blogs:read', 'blogs:write', 'blogs:delete',
    'preferences:read', 'preferences:write',
    'admin:access',
  ],
  professional: [
    'users:read',
    'materials:read', 'materials:write',
    'forum:read', 'forum:write', 'forum:moderate',
    'events:read', 'events:write',
    'help:read', 'help:write', 'help:triage',
    'suggestions:read', 'suggestions:write',
    'professionals:read', 'professionals:write',
    'blogs:read', 'blogs:write',
    'preferences:read', 'preferences:write',
    'admin:access',
  ],
  member: [
    'materials:read',
    'forum:read', 'forum:write',
    'events:read',
    'help:write',
    'suggestions:read', 'suggestions:write',
    'professionals:read',
    'blogs:read',
    'preferences:read', 'preferences:write',
  ],
};

// ─── User ─────────────────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  specialty?: string;
  crp?: string;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type PublicUser = Omit<AppUser, 'passwordHash'>;

// ─── User Preferences ─────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'clay' | 'moss' | 'navy' | 'rose' | 'amber' | 'teal';
export type FontSize = 'sm' | 'md' | 'lg';
export type LayoutDensity = 'compact' | 'comfortable' | 'spacious';
export type Language = 'pt-BR' | 'en-US';

export interface NotificationPreferences {
  emailNewForumReply: boolean;
  emailEventReminder: boolean;
  emailHelpUpdate: boolean;
  emailNewMaterial: boolean;
  pushEnabled: boolean;
}

export interface DashboardPreferences {
  showWelcomeBanner: boolean;
  showQuoteOfDay: boolean;
  showStatCards: boolean;
  defaultView: 'grid' | 'list';
}

export interface FilterPreferences {
  forum: {
    defaultCategory: string;
    defaultSort: 'recent' | 'popular' | 'solved';
  };
  materials: {
    defaultCategory: string;
    defaultType: string;
    defaultView: 'grid' | 'list';
  };
  events: {
    defaultStatus: 'upcoming' | 'past' | 'all';
  };
  directory: {
    defaultSpecialty: string;
    defaultView: 'grid' | 'list';
  };
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: ThemeMode;
  accentColor: AccentColor;
  fontSize: FontSize;
  layoutDensity: LayoutDensity;
  language: Language;
  sidebarCollapsed: boolean;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
  filters: FilterPreferences;
  bookmarkedMaterials: string[];
  bookmarkedTopics: string[];
  enrolledEvents: string[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  theme: 'light',
  accentColor: 'clay',
  fontSize: 'md',
  layoutDensity: 'comfortable',
  language: 'pt-BR',
  sidebarCollapsed: false,
  notifications: {
    emailNewForumReply: true,
    emailEventReminder: true,
    emailHelpUpdate: true,
    emailNewMaterial: false,
    pushEnabled: false,
  },
  dashboard: {
    showWelcomeBanner: true,
    showQuoteOfDay: true,
    showStatCards: true,
    defaultView: 'grid',
  },
  filters: {
    forum: { defaultCategory: 'Todos', defaultSort: 'recent' },
    materials: { defaultCategory: 'Todos', defaultType: 'Todos', defaultView: 'grid' },
    events: { defaultStatus: 'all' },
    directory: { defaultSpecialty: 'Todos', defaultView: 'grid' },
  },
  bookmarkedMaterials: [],
  bookmarkedTopics: [],
  enrolledEvents: [],
};

// ─── Professional Profile ─────────────────────────────────────────────────────

export interface ProfessionalProfile {
  id: string;
  userId: string;
  crp: string;
  specialties: string[];
  bio: string;
  pricePerSession: number;
  rating: number;
  reviewsCount: number;
  contactWhatsapp?: string;
  services: string[];
  schedule: ScheduleSlot[];
  location: string;
  accentColor: string;
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleSlot {
  day: string;
  hours: string;
}

// ─── Forum ────────────────────────────────────────────────────────────────────

export interface ForumTopic {
  id: string;
  title: string;
  category: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  likedBy: string[];
  views: number;
  isSolved: boolean;
  isPinned: boolean;
  isLocked: boolean;
  replies: ForumReply[];
}

export interface ForumReply {
  id: string;
  topicId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  isExpertReply: boolean;
  likes: number;
  likedBy: string[];
}

// ─── Support Material ─────────────────────────────────────────────────────────

export type MaterialCategory = 'Ansiedade' | 'Depressão' | 'Autocuidado' | 'Relacionamentos' | 'Meditação' | 'Geral';
export type MaterialType = 'E-book' | 'PDF' | 'Áudio' | 'Guia de Exercícios' | 'Infográfico';

export interface SupportMaterial {
  id: string;
  title: string;
  category: MaterialCategory;
  type: MaterialType;
  description: string;
  downloadUrl: string;
  authorId: string;
  authorName: string;
  dateAdded: string;
  updatedAt: string;
  restrictedToMembers: boolean;
  downloadCount: number;
}

// ─── Health Event ─────────────────────────────────────────────────────────────

export type EventCategory = 'Grupo de Apoio' | 'Palestra Vivencial' | 'Workshop' | 'Meditação Coletiva';
export type EventStatus = 'upcoming' | 'past';

export interface HealthEvent {
  id: string;
  title: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  date: string;
  time: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  participantsCount: number;
  enrolledUserIds: string[];
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Help Request ─────────────────────────────────────────────────────────────

export type HelpUrgency = 'baixa' | 'media' | 'alta' | 'urgente';
export type HelpStatus = 'Aberto' | 'Em Atendimento' | 'Concluído';

export interface SupportRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  urgency: HelpUrgency;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: HelpStatus;
  assignedProfessionalId?: string;
  assignedProfessional?: string;
  notes?: string;
}

// ─── Suggestions ──────────────────────────────────────────────────────────────

export interface SuggestionIdea {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  status: 'open' | 'in-progress' | 'done' | 'rejected';
  adminNote?: string;
}

// ─── Blog / Learnings ─────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  updatedAt: string;
  readTime: string;
  likes: number;
  likedBy: string[];
  published: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
