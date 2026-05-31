// Cliente HTTP centralizado para a API Espalhe Melodias

const BASE_URL = 'http://localhost:3001/api';

// ─── Token storage ────────────────────────────────────────────────────────────

export const tokenStore = {
  get:           () => localStorage.getItem('melodias_access_token'),
  set:           (t: string) => localStorage.setItem('melodias_access_token', t),
  getRefresh:    () => localStorage.getItem('melodias_refresh_token'),
  setRefresh:    (t: string) => localStorage.setItem('melodias_refresh_token', t),
  clear:         () => {
    localStorage.removeItem('melodias_access_token');
    localStorage.removeItem('melodias_refresh_token');
    localStorage.removeItem('melodias_user');
  },
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function requestResponse<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<ApiResponse<T>> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Token expirado → tenta refresh automático
  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return requestResponse<T>(path, options, false);
    tokenStore.clear();
    window.dispatchEvent(new Event('melodias:logout'));
    throw new ApiError('Sessão expirada. Faça login novamente.', 401);
  }

  const body = await res.json().catch(() => ({})) as ApiResponse<T>;

  if (!res.ok) {
    throw new ApiError(
      body.message ?? `Erro ${res.status}`,
      res.status,
      body.errors,
    );
  }

  return body;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const body = await requestResponse<T>(path, options, retry);
  return body.data as T;
}

async function tryRefresh(): Promise<boolean> {
  const rt = tokenStore.getRefresh();
  if (!rt) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const body = await res.json() as ApiResponse<{ accessToken: string }>;
    if (body.data?.accessToken) {
      tokenStore.set(body.data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── ApiError ─────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PagedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function get<T>(path: string) { return request<T>(path); }
function post<T>(path: string, body: unknown) {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}
function put<T>(path: string, body: unknown) {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}
function patch<T>(path: string, body: unknown) {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}
function del<T>(path: string) { return request<T>(path, { method: 'DELETE' }); }

async function getPaged<T>(path: string, params?: Record<string, string | number | undefined>): Promise<PagedResult<T>> {
  const qs = params
    ? '?' + Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')
    : '';
  const body = await requestResponse<T[]>(`${path}${qs}`);
  return {
    data: body.data ?? [],
    meta: body.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 },
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'professional' | 'member';
  avatar?: string;
  permissions: string[];
  approvalStatus?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    post<LoginResponse>('/auth/login', { email, password }),
  logout: (refreshToken: string) =>
    post<void>('/auth/logout', { refreshToken }),
  me: () => get<AuthUser>('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    post<void>('/auth/change-password', { currentPassword, newPassword }),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'professional' | 'member';
  avatar?: string;
  specialty?: string;
  crp?: string;
  approval_status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserStats {
  total: number;
  pending: number;
  approved: number;
  superAdmins: number;
  professionals: number;
  members: number;
}

export const usersApi = {
  list: (params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }) =>
    getPaged<User>('/users', params),
  stats: () => get<UserStats>('/users/stats'),
  get: (id: string) => get<User>(`/users/${id}`),
  update: (id: string, data: Partial<User>) => put<User>(`/users/${id}`, data),
  create: (data: { name: string; email: string; password: string; role: string; specialty?: string; whatsapp?: string; gender?: string }) =>
    post<User>('/users', data),
  setApproval: (id: string, status: 'approved' | 'rejected') =>
    patch<void>(`/users/${id}/approval`, { status }),
  changeRole: (id: string, role: string) =>
    patch<void>(`/users/${id}/role`, { role }),
  delete: (id: string) => del<void>(`/users/${id}`),
};

// ─── Preferences ──────────────────────────────────────────────────────────────

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: 'sm' | 'md' | 'lg';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  language: string;
  sidebarCollapsed: boolean;
  notifications: {
    emailNewForumReply: boolean;
    emailEventReminder: boolean;
    emailHelpUpdate: boolean;
    emailNewMaterial: boolean;
    pushEnabled: boolean;
  };
  dashboard: {
    showWelcomeBanner: boolean;
    showQuoteOfDay: boolean;
    showStatCards: boolean;
    defaultView: 'grid' | 'list';
  };
  filters: {
    forum: { defaultCategory: string; defaultSort: string };
    materials: { defaultCategory: string; defaultType: string; defaultView: string };
    events: { defaultStatus: string };
    directory: { defaultSpecialty: string; defaultView: string };
  };
  bookmarkedMaterials: string[];
  bookmarkedTopics: string[];
  enrolledEvents: string[];
}

export const prefsApi = {
  get: () => get<UserPreferences>('/preferences'),
  update: (data: Partial<UserPreferences>) => patch<UserPreferences>('/preferences', data),
  reset: () => del<void>('/preferences/reset'),
  bookmarkMaterial: (id: string) => post<{ bookmarkedMaterials: string[]; added: boolean }>(`/preferences/bookmark/material/${id}`, {}),
  bookmarkTopic:    (id: string) => post<{ bookmarkedTopics: string[]; added: boolean }>(`/preferences/bookmark/topic/${id}`, {}),
  enrollEvent:      (id: string) => post<{ enrolledEvents: string[]; enrolled: boolean }>(`/preferences/enroll/${id}`, {}),
};

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalMembers: number;
  approvedMembers: number;
  pendingMembers: number;
  totalMaterials: number;
  totalTopics: number;
  openHelpRequests: number;
  upcomingEvents: number;
  totalSuggestions: number;
  totalProfessionals: number;
  totalBlogs: number;
}

export const dashboardApi = {
  stats: async (): Promise<DashboardStats> => {
    const [userStats, helpStats] = await Promise.all([
      usersApi.stats(),
      get<{ total: number; open: number; inProgress: number; done: number; urgent: number }>('/help/stats'),
    ]);
    return {
      totalMembers:      userStats.total,
      approvedMembers:   userStats.approved,
      pendingMembers:    userStats.pending,
      totalMaterials:    0,
      totalTopics:       0,
      openHelpRequests:  helpStats.open ?? 0,
      upcomingEvents:    0,
      totalSuggestions:  0,
      totalProfessionals: userStats.professionals,
      totalBlogs:        0,
    };
  },
};

// ─── Forum ────────────────────────────────────────────────────────────────────

export interface ForumTopic {
  id: string;
  title: string;
  category: string;
  author_id: string;
  author_name: string;
  author_role: string;
  author_avatar?: string;
  content: string;
  likes: number;
  likedBy: string[];
  views: number;
  is_solved: number;
  is_pinned: number;
  is_locked: number;
  replies?: ForumReply[];
  replies_count?: number;
  repliesCount?: number;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  topic_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  author_avatar?: string;
  content: string;
  is_expert_reply: number;
  likes: number;
  likedBy: string[];
  created_at: string;
}

export interface ForumTopicDetail extends ForumTopic {
  replies: ForumReply[];
}

function normalizeForumReply(reply: ForumReply): ForumReply {
  return {
    ...reply,
    likedBy: reply.likedBy ?? [],
  };
}

function normalizeForumTopic<T extends ForumTopic>(topic: T): T {
  const replies = Array.isArray(topic.replies) ? topic.replies.map(normalizeForumReply) : [];
  const repliesCount =
    typeof topic.replies_count === 'number'
      ? topic.replies_count
      : typeof topic.repliesCount === 'number'
        ? topic.repliesCount
        : replies.length;

  return {
    ...topic,
    likedBy: topic.likedBy ?? [],
    replies,
    replies_count: repliesCount,
    repliesCount,
  };
}

export const forumApi = {
  list: async (params?: { category?: string; search?: string; sort?: string; page?: number; limit?: number }) => {
    const result = await getPaged<ForumTopic>('/forum', params);
    return { ...result, data: result.data.map(normalizeForumTopic) };
  },
  get: async (id: string) => normalizeForumTopic(await get<ForumTopicDetail>(`/forum/${id}`)),
  create: (data: { title: string; category: string; content: string }) =>
    post<{ id: string }>('/forum', data),
  update: (id: string, data: Partial<ForumTopic>) => put<void>(`/forum/${id}`, data),
  delete: (id: string) => del<void>(`/forum/${id}`),
  like: (id: string) => post<{ likes: number; liked: boolean }>(`/forum/${id}/like`, {}),
  createReply: (topicId: string, content: string) =>
    post<{ id: string; isExpertReply: boolean }>(`/forum/${topicId}/replies`, { content }),
  likeReply: (topicId: string, replyId: string) =>
    post<{ likes: number; liked: boolean }>(`/forum/${topicId}/replies/${replyId}/like`, {}),
};

// ─── Materials ────────────────────────────────────────────────────────────────

export interface Material {
  id: string;
  title: string;
  category: string;
  type: string;
  description: string;
  download_url: string;
  author_id: string;
  author_name: string;
  restricted_to_members: number;
  download_count: number;
  date_added: string;
  updated_at: string;
}

export const materialsApi = {
  list: (params?: { category?: string; type?: string; search?: string; page?: number; limit?: number }) =>
    getPaged<Material>('/materials', params),
  get: (id: string) => get<Material>(`/materials/${id}`),
  create: (data: { title: string; category: string; type: string; description: string; downloadUrl: string; restrictedToMembers: boolean }) =>
    post<{ id: string }>('/materials', data),
  update: (id: string, data: Partial<Material>) => put<void>(`/materials/${id}`, data),
  delete: (id: string) => del<void>(`/materials/${id}`),
  trackDownload: (id: string) => post<void>(`/materials/${id}/download`, {}),
};

// ─── Events ───────────────────────────────────────────────────────────────────

export interface HealthEvent {
  id: string;
  title: string;
  instructor_id: string;
  instructor_name: string;
  instructor_avatar?: string;
  event_date: string;
  event_time: string;
  description: string;
  category: string;
  status: 'upcoming' | 'past';
  participants_count: number;
  enrolledUserIds: string[];
  isEnrolled: boolean;
  recording_url?: string;
  created_at: string;
}

export const eventsApi = {
  list: (params?: { status?: string; category?: string; search?: string; page?: number }) =>
    getPaged<HealthEvent>('/events', params),
  get: (id: string) => get<HealthEvent>(`/events/${id}`),
  create: (data: {
    title: string; date: string; time: string; description: string; category: string;
    location?: string; mapLink?: string; coverUrl?: string; recordingUrl?: string;
    rsvpEnabled?: boolean; allowGuests?: boolean; itemDivision?: boolean; divisionItems?: string[];
  }) => post<{ id: string }>('/events', data),
  update: (id: string, data: Partial<HealthEvent>) => put<void>(`/events/${id}`, data),
  delete: (id: string) => del<void>(`/events/${id}`),
  enroll: (id: string) => post<{ enrolled: boolean; participantsCount: number }>(`/events/${id}/enroll`, {}),
  listRsvps: (id: string) => get<Record<string, unknown>[]>(`/events/${id}/rsvps`),
  // Listas pré-definidas de itens (persistidas no backend)
  listItemLists: () => get<EventItemList[]>('/events/item-lists'),
  createItemList: (data: { name: string; items: string[] }) => post<EventItemList>('/events/item-lists', data),
  updateItemList: (id: string, data: { name?: string; items?: string[] }) => put<void>(`/events/item-lists/${id}`, data),
  deleteItemList: (id: string) => del<void>(`/events/item-lists/${id}`),
};

export interface EventItemList {
  id: string;
  name: string;
  items: string[];
}

// ─── Help Requests ────────────────────────────────────────────────────────────

export interface HelpRequest {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  urgency: 'baixa' | 'media' | 'alta' | 'urgente';
  description: string;
  status: 'Aberto' | 'Em Atendimento' | 'Concluído';
  assigned_professional_id?: string;
  assigned_professional?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const helpApi = {
  list: (params?: { status?: string; urgency?: string; page?: number }) =>
    getPaged<HelpRequest>('/help', params),
  get: (id: string) => get<HelpRequest>(`/help/${id}`),
  create: (data: { urgency: string; description: string }) =>
    post<{ id: string }>('/help', data),
  update: (id: string, data: Partial<HelpRequest>) =>
    patch<void>(`/help/${id}`, {
      status: data.status,
      urgency: data.urgency,
      notes: data.notes,
      assignedProfessionalId: data.assigned_professional_id,
      assignedProfessional: data.assigned_professional,
    }),
  stats: () => get<{ total: number; open: number; inProgress: number; done: number; urgent: number }>('/help/stats'),
};

// ─── Suggestions ──────────────────────────────────────────────────────────────

export interface Suggestion {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  likes: number;
  likedBy: string[];
  status: 'open' | 'in-progress' | 'done' | 'rejected';
  admin_note?: string;
  created_at: string;
}

export const suggestionsApi = {
  list: (params?: { status?: string; page?: number }) =>
    getPaged<Suggestion>('/suggestions', params),
  create: (content: string) => post<{ id: string }>('/suggestions', { content }),
  like: (id: string) => post<{ likes: number; liked: boolean }>(`/suggestions/${id}/like`, {}),
  update: (id: string, data: { status?: string; adminNote?: string }) =>
    patch<void>(`/suggestions/${id}`, data),
};

// ─── Professionals ────────────────────────────────────────────────────────────

export interface Professional {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar?: string;
  crp: string;
  specialties: string[];
  bio: string;
  price_per_session: number;
  rating: number;
  reviews_count: number;
  contact_whatsapp?: string;
  services: string[];
  schedule: Array<{ day: string; hours: string }>;
  location: string;
  accent_color?: string;
  languages: string[];
}

function toNumericValue(value: unknown, fallback = 0): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeProfessional(professional: Professional): Professional {
  return {
    ...professional,
    price_per_session: toNumericValue(professional.price_per_session),
    rating: toNumericValue(professional.rating),
    reviews_count: toNumericValue(professional.reviews_count),
  };
}

export const professionalsApi = {
  list: async (params?: { specialty?: string; search?: string; page?: number }) => {
    const result = await getPaged<Professional>('/professionals', params);
    return { ...result, data: result.data.map(normalizeProfessional) };
  },
  get: async (id: string) => normalizeProfessional(await get<Professional>(`/professionals/${id}`)),
  updateMe: (data: Partial<Professional> & { name?: string }) =>
    put<void>('/professionals/me', {
      name: data.name,
      crp: data.crp,
      specialties: data.specialties,
      bio: data.bio,
      pricePerSession: data.price_per_session,
      contactWhatsapp: data.contact_whatsapp,
      services: data.services,
      schedule: data.schedule,
      location: data.location,
      accentColor: data.accent_color,
      languages: data.languages,
    }),
};

// ─── Invite Links ─────────────────────────────────────────────────────────────

export interface InviteLink {
  id: string;
  token: string;
  label: string;
  role: string;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  expires_at: string;
  created_by_id: string;
  created_by_name: string;
  created_at: string;
}

export interface InviteLinkUse {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  used_at: string;
}

export const inviteLinksApi = {
  list: () => get<InviteLink[]>('/invite-links'),
  create: (data: { label: string; validityDays: number; role: string; maxUses: number | null }) =>
    post<InviteLink>('/invite-links', data),
  reactivate: (id: string) => patch<void>(`/invite-links/${id}/reactivate`, {}),
  delete: (id: string) => del<void>(`/invite-links/${id}`),
  getUses: (id: string) => get<InviteLinkUse[]>(`/invite-links/${id}/uses`),
  use: (token: string) => post<{ userId: string }>(`/invite-links/use/${token}`, {}),
};

// ─── Blogs ────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  read_time: string;
  likes: number;
  likedBy?: string[];
  published: number;
  post_date: string;
  updated_at: string;
}

export const blogsApi = {
  list: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    getPaged<BlogPost>('/blogs', params),
  get: (id: string) => get<BlogPost>(`/blogs/${id}`),
  create: (data: { title: string; excerpt: string; content: string; category: string; imageUrl?: string; readTime?: string; published?: boolean }) =>
    post<{ id: string }>('/blogs', data),
  update: (id: string, data: Partial<BlogPost>) => put<void>(`/blogs/${id}`, data),
  delete: (id: string) => del<void>(`/blogs/${id}`),
  like: (id: string) => post<{ likes: number; liked: boolean }>(`/blogs/${id}/like`, {}),
};
