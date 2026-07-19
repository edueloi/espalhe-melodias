// Cliente HTTP centralizado para a API Espalhe Melodias

const API_ORIGIN = 'http://localhost:3001';
const BASE_URL = `${API_ORIGIN}/api`;

/** Resolve um caminho relativo de upload (ex: /uploads/gallery/x.jpg) para URL absoluta do backend. */
export function resolveUploadUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

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
  author_specialty?: string;
  author_crp?: string;
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
  author_specialty?: string;
  author_crp?: string;
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
  updateReply: (topicId: string, replyId: string, content: string) =>
    put<void>(`/forum/${topicId}/replies/${replyId}`, { content }),
  deleteReply: (topicId: string, replyId: string) =>
    del<void>(`/forum/${topicId}/replies/${replyId}`),
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
  location?: string;
  map_link?: string;
  cover_url?: string;
  rsvp_enabled?: boolean | number;
  allow_guests?: boolean | number;
  item_division?: boolean | number;
  items?: Array<{ id: string; name: string }>;
  division_items?: Array<{ id: string; name: string; takers: string[] }>;
  presents_count?: number;
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
  update: (id: string, data: {
    title?: string; date?: string; time?: string; description?: string; category?: string;
    status?: 'upcoming' | 'past'; location?: string; mapLink?: string; coverUrl?: string;
    rsvpEnabled?: boolean; allowGuests?: boolean;
  }) => put<void>(`/events/${id}`, data),
  delete: (id: string) => del<void>(`/events/${id}`),
  enroll: (id: string) => post<{ enrolled: boolean; participantsCount: number }>(`/events/${id}/enroll`, {}),
  listRsvps: (id: string) => get<Record<string, unknown>[]>(`/events/${id}/rsvps`),
  // Itens do evento (lista de café/contribuição)
  addItem: (eventId: string, name: string) => post<{ id: string; name: string }>(`/events/${eventId}/items`, { name }),
  deleteItem: (eventId: string, itemId: string) => del<void>(`/events/${eventId}/items/${itemId}`),
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

// ─── Peer Help (rede de apoio entre colegas) ──────────────────────────────────

export interface PeerHelpReply {
  id: string;
  request_id: string;
  author_id: string;
  author_name: string;
  message: string;
  is_private: number;
  created_at: string;
}

export interface PeerHelpRequest {
  id: string;
  author_id: string;
  author_name: string;
  author_specialty?: string;
  title: string;
  description: string;
  category: string;
  urgency: 'normal' | 'urgente';
  anonymous: boolean;
  response_pref: 'qualquer' | 'whatsapp' | 'privado';
  status: 'aberto' | 'resolvido';
  isMine: boolean;
  repliesCount: number;
  replies: PeerHelpReply[];
  created_at: string;
  updated_at: string;
}

export const peerHelpApi = {
  list: (params?: { status?: string; mine?: boolean; page?: number }) =>
    getPaged<PeerHelpRequest>('/peer-help', {
      status: params?.status,
      mine: params?.mine ? 'true' : undefined,
      page: params?.page,
    }),
  create: (data: {
    title: string; description: string; category: string;
    urgency?: 'normal' | 'urgente'; anonymous?: boolean;
    responsePref?: 'qualquer' | 'whatsapp' | 'privado';
  }) => post<{ id: string }>('/peer-help', data),
  reply: (requestId: string, data: { message: string; isPrivate?: boolean }) =>
    post<{ id: string }>(`/peer-help/${requestId}/replies`, data),
  resolve: (requestId: string) => patch<void>(`/peer-help/${requestId}/resolve`, {}),
};

// ─── Suggestions ──────────────────────────────────────────────────────────────

export interface Suggestion {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_role?: string;
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

export type ProfTheme = 'forest' | 'ocean' | 'rose' | 'gold' | 'melodias' | 'minimal' | 'card' | 'dark';

export interface Professional {
  id: string;
  user_id: string;
  slug?: string;
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
  theme?: ProfTheme;
  languages: string[];
  // Social links
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  tiktok?: string;
  twitter?: string;
  website?: string;
  extra_links?: Array<{ label: string; url: string }>;
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
  list: async (params?: { specialty?: string; search?: string; page?: number; limit?: number }) => {
    const result = await getPaged<Professional>('/professionals', params);
    return { ...result, data: result.data.map(normalizeProfessional) };
  },
  get: async (id: string) => normalizeProfessional(await get<Professional>(`/professionals/${id}`)),
  checkSlug: (slug: string) =>
    get<{ available: boolean; slug?: string; reason?: string }>(`/professionals/slug-check?slug=${encodeURIComponent(slug)}`),
  updateMe: (data: Partial<Professional> & { name?: string }) =>
    put<void>('/professionals/me', {
      name: data.name,
      slug: data.slug,
      crp: data.crp,
      specialties: data.specialties,
      bio: data.bio,
      pricePerSession: data.price_per_session,
      contactWhatsapp: data.contact_whatsapp,
      services: data.services,
      schedule: data.schedule,
      location: data.location,
      accentColor: data.accent_color,
      theme: data.theme,
      languages: data.languages,
      instagram: data.instagram,
      linkedin: data.linkedin,
      facebook: data.facebook,
      tiktok: data.tiktok,
      twitter: data.twitter,
      website: data.website,
      extraLinks: data.extra_links,
    }),
};

// ─── Member Requests ─────────────────────────────────────────────────────────

export interface MemberRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  gender?: string;
  observation?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const memberRequestsApi = {
  create: (data: { name: string; email: string; phone?: string; specialty?: string; gender?: string; observation?: string }) =>
    post<{ id: string }>('/member-requests', data),
  list: (params?: { status?: string; search?: string }) =>
    getPaged<MemberRequest>('/member-requests', params),
  approve: (id: string) => patch<void>(`/member-requests/${id}/approve`, {}),
  reject: (id: string) => patch<void>(`/member-requests/${id}/reject`, {}),
  delete: (id: string) => del<void>(`/member-requests/${id}`),
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
  views?: number;
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
  update: (id: string, data: { title?: string; excerpt?: string; content?: string; category?: string; imageUrl?: string; readTime?: string; published?: boolean }) =>
    put<void>(`/blogs/${id}`, data),
  delete: (id: string) => del<void>(`/blogs/${id}`),
  like: (id: string) => post<{ likes: number; liked: boolean }>(`/blogs/${id}/like`, {}),
};

// ─── Gallery ──────────────────────────────────────────────────────────────────

export interface GalleryPhoto {
  id: string;
  image_url: string;
  caption?: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export const galleryApi = {
  list: (params?: { page?: number; limit?: number }) =>
    getPaged<GalleryPhoto>('/gallery', params),
  get: (id: string) => get<GalleryPhoto>(`/gallery/${id}`),
  create: (data: { imageUrl: string; caption?: string }) =>
    post<{ id: string }>('/gallery', data),
  update: (id: string, data: { caption?: string }) => put<void>(`/gallery/${id}`, data),
  delete: (id: string) => del<void>(`/gallery/${id}`),
};

// ─── Upload ───────────────────────────────────────────────────────────────────

export const uploadApi = {
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const token = tokenStore.get();
    const form = new FormData();
    form.append('avatar', file);
    const res = await fetch(`${BASE_URL}/upload/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const body = await res.json().catch(() => ({})) as ApiResponse<{ avatarUrl: string }>;
    if (!res.ok) throw new ApiError(body.message ?? `Erro ${res.status}`, res.status);
    return body.data!;
  },
  deleteAvatar: () => del<void>('/upload/avatar'),
  uploadGalleryPhoto: async (file: File): Promise<{ imageUrl: string }> => {
    const token = tokenStore.get();
    const form = new FormData();
    form.append('photo', file);
    const res = await fetch(`${BASE_URL}/upload/gallery-photo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const body = await res.json().catch(() => ({})) as ApiResponse<{ imageUrl: string }>;
    if (!res.ok) throw new ApiError(body.message ?? `Erro ${res.status}`, res.status);
    return body.data!;
  },
  uploadMaterial: async (file: File): Promise<{ fileUrl: string; originalName: string; sizeBytes: number; mimeType: string }> => {
    const token = tokenStore.get();
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE_URL}/upload/material`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const body = await res.json().catch(() => ({})) as ApiResponse<{ fileUrl: string; originalName: string; sizeBytes: number; mimeType: string }>;
    if (!res.ok) throw new ApiError(body.message ?? `Erro ${res.status}`, res.status);
    return body.data!;
  },
};

/** Limite de tamanho de arquivo para materiais de apoio (deve bater com server/src/controllers/uploadController.ts) */
export const MATERIAL_MAX_SIZE_MB = 20;

// ─── Newsletter ────────────────────────────────────────────────────────────

export interface NewsletterSubscription {
  id: string;
  email: string;
  subscribed_at: string;
  unsubscribed_at?: string;
  is_active: boolean;
}

export const newsletterApi = {
  subscribe: (email: string) =>
    post<{ id: string; message: string }>('/newsletter/subscribe', { email }),
  unsubscribe: (email: string) =>
    post<{ email: string }>('/newsletter/unsubscribe', { email }),
  count: () =>
    get<{ total: number; active: number }>('/newsletter/count'),
};

// ─── Contact Form ─────────────────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'new' | 'responded' | 'resolved' | 'spam';
  admin_reply?: string;
  responded_at?: string;
}

export const contactApi = {
  send: (data: Omit<ContactMessage, 'id' | 'created_at' | 'status'>) =>
    post<{ id: string; message: string }>('/contact', data),
  list: (params?: { page?: number; limit?: number }) =>
    getPaged<ContactMessage>('/contact', params),
};

// ─── Blog Posts - Expansão ────────────────────────────────────────────────

export interface BlogPostAPI {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  category: string;
  featured?: boolean;
  published: boolean;
  image_url?: string;
  likes: number;
  views: number;
  created_at: string;
  updated_at: string;
}


// ─── Instagram Integration ────────────────────────────────────────────────

export interface InstagramPost {
  id: string;
  image_url: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  instagram_url: string;
  published_at: string;
}

interface InstagramMediaPayload {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
  media_url: string;
  thumbnail_url?: string;
  like_count?: number;
  comments_count?: number;
  permalink: string;
  timestamp: string;
}

interface InstagramFeedPayload {
  posts: InstagramMediaPayload[];
  stats: {
    followers_count: number;
    media_count: number;
  };
  fetchedAt: string;
  cacheExpiry?: number;
}

function normalizeInstagramPost(post: InstagramMediaPayload): InstagramPost {
  return {
    id: post.id,
    image_url: post.thumbnail_url ?? post.media_url,
    caption: post.caption ?? '',
    likes_count: post.like_count ?? 0,
    comments_count: post.comments_count ?? 0,
    instagram_url: post.permalink,
    published_at: post.timestamp,
  };
}

export const instagramApi = {
  feed: async (params?: { limit?: number }) => {
    const query = params?.limit ? `?limit=${encodeURIComponent(String(params.limit))}` : '';
    const payload = await get<InstagramFeedPayload>(`/instagram/feed${query}`);
    return payload.posts.map(normalizeInstagramPost);
  },
  stats: async () => {
    const stats = await get<{
      followers_count: number;
      media_count: number;
    }>('/instagram/stats');
    return {
      followers: stats.followers_count ?? 0,
      posts: stats.media_count ?? 0,
      engagement_rate: 0,
    };
  },
};

// ─── Stories/Highlights ───────────────────────────────────────────────────

export interface StoryHighlight {
  id: string;
  title: string;
  image_url: string;
  order: number;
  link?: string;
  category?: string;
}

export const storiesApi = {
  list: async () => {
    const payload = await get<InstagramFeedPayload>('/instagram/stories');
    return payload.posts.map((story, index) => ({
      id: story.id,
      title: story.caption?.trim().slice(0, 32) || `Story ${index + 1}`,
      image_url: story.thumbnail_url ?? story.media_url,
      order: index + 1,
      link: story.permalink,
    }));
  },
};
