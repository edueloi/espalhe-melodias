/**
 * In-memory store com persistência em JSON.
 * Substitua por um banco real (PostgreSQL/SQLite) quando necessário.
 */
import fs from 'fs';
import path from 'path';
import type {
  AppUser,
  UserPreferences,
  ProfessionalProfile,
  ForumTopic,
  SupportMaterial,
  HealthEvent,
  SupportRequest,
  SuggestionIdea,
  BlogPost,
} from '../types/domain';

interface StoreData {
  users: AppUser[];
  preferences: UserPreferences[];
  professionals: ProfessionalProfile[];
  forumTopics: ForumTopic[];
  materials: SupportMaterial[];
  events: HealthEvent[];
  helpRequests: SupportRequest[];
  suggestions: SuggestionIdea[];
  blogs: BlogPost[];
  refreshTokens: string[];
}

const DATA_FILE = path.resolve(__dirname, '../../data/db.json');

function ensureDataDir(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadFromDisk(): StoreData {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return {
      users: [],
      preferences: [],
      professionals: [],
      forumTopics: [],
      materials: [],
      events: [],
      helpRequests: [],
      suggestions: [],
      blogs: [],
      refreshTokens: [],
    };
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as StoreData;
  } catch {
    console.error('[Store] Failed to parse db.json, starting fresh');
    return {
      users: [],
      preferences: [],
      professionals: [],
      forumTopics: [],
      materials: [],
      events: [],
      helpRequests: [],
      suggestions: [],
      blogs: [],
      refreshTokens: [],
    };
  }
}

class Store {
  private data: StoreData;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.data = loadFromDisk();
  }

  private scheduleSave(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.persist(), 300);
  }

  private persist(): void {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  get users(): AppUser[] { return this.data.users; }
  findUserById(id: string): AppUser | undefined { return this.data.users.find(u => u.id === id); }
  findUserByEmail(email: string): AppUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  saveUser(user: AppUser): void {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx >= 0) this.data.users[idx] = user;
    else this.data.users.push(user);
    this.scheduleSave();
  }
  deleteUser(id: string): void {
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.scheduleSave();
  }

  // ── Preferences ────────────────────────────────────────────────────────────

  get preferences(): UserPreferences[] { return this.data.preferences; }
  findPreferencesByUserId(userId: string): UserPreferences | undefined {
    return this.data.preferences.find(p => p.userId === userId);
  }
  savePreferences(pref: UserPreferences): void {
    const idx = this.data.preferences.findIndex(p => p.userId === pref.userId);
    if (idx >= 0) this.data.preferences[idx] = pref;
    else this.data.preferences.push(pref);
    this.scheduleSave();
  }

  // ── Professionals ──────────────────────────────────────────────────────────

  get professionals(): ProfessionalProfile[] { return this.data.professionals; }
  findProfessionalById(id: string): ProfessionalProfile | undefined {
    return this.data.professionals.find(p => p.id === id);
  }
  findProfessionalByUserId(userId: string): ProfessionalProfile | undefined {
    return this.data.professionals.find(p => p.userId === userId);
  }
  saveProfessional(prof: ProfessionalProfile): void {
    const idx = this.data.professionals.findIndex(p => p.id === prof.id);
    if (idx >= 0) this.data.professionals[idx] = prof;
    else this.data.professionals.push(prof);
    this.scheduleSave();
  }

  // ── Forum Topics ───────────────────────────────────────────────────────────

  get forumTopics(): ForumTopic[] { return this.data.forumTopics; }
  findTopicById(id: string): ForumTopic | undefined {
    return this.data.forumTopics.find(t => t.id === id);
  }
  saveTopic(topic: ForumTopic): void {
    const idx = this.data.forumTopics.findIndex(t => t.id === topic.id);
    if (idx >= 0) this.data.forumTopics[idx] = topic;
    else this.data.forumTopics.push(topic);
    this.scheduleSave();
  }
  deleteTopic(id: string): void {
    this.data.forumTopics = this.data.forumTopics.filter(t => t.id !== id);
    this.scheduleSave();
  }

  // ── Materials ──────────────────────────────────────────────────────────────

  get materials(): SupportMaterial[] { return this.data.materials; }
  findMaterialById(id: string): SupportMaterial | undefined {
    return this.data.materials.find(m => m.id === id);
  }
  saveMaterial(mat: SupportMaterial): void {
    const idx = this.data.materials.findIndex(m => m.id === mat.id);
    if (idx >= 0) this.data.materials[idx] = mat;
    else this.data.materials.push(mat);
    this.scheduleSave();
  }
  deleteMaterial(id: string): void {
    this.data.materials = this.data.materials.filter(m => m.id !== id);
    this.scheduleSave();
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  get events(): HealthEvent[] { return this.data.events; }
  findEventById(id: string): HealthEvent | undefined {
    return this.data.events.find(e => e.id === id);
  }
  saveEvent(event: HealthEvent): void {
    const idx = this.data.events.findIndex(e => e.id === event.id);
    if (idx >= 0) this.data.events[idx] = event;
    else this.data.events.push(event);
    this.scheduleSave();
  }
  deleteEvent(id: string): void {
    this.data.events = this.data.events.filter(e => e.id !== id);
    this.scheduleSave();
  }

  // ── Help Requests ──────────────────────────────────────────────────────────

  get helpRequests(): SupportRequest[] { return this.data.helpRequests; }
  findHelpRequestById(id: string): SupportRequest | undefined {
    return this.data.helpRequests.find(h => h.id === id);
  }
  saveHelpRequest(req: SupportRequest): void {
    const idx = this.data.helpRequests.findIndex(h => h.id === req.id);
    if (idx >= 0) this.data.helpRequests[idx] = req;
    else this.data.helpRequests.push(req);
    this.scheduleSave();
  }

  // ── Suggestions ────────────────────────────────────────────────────────────

  get suggestions(): SuggestionIdea[] { return this.data.suggestions; }
  findSuggestionById(id: string): SuggestionIdea | undefined {
    return this.data.suggestions.find(s => s.id === id);
  }
  saveSuggestion(sug: SuggestionIdea): void {
    const idx = this.data.suggestions.findIndex(s => s.id === sug.id);
    if (idx >= 0) this.data.suggestions[idx] = sug;
    else this.data.suggestions.push(sug);
    this.scheduleSave();
  }

  // ── Blogs ──────────────────────────────────────────────────────────────────

  get blogs(): BlogPost[] { return this.data.blogs; }
  findBlogById(id: string): BlogPost | undefined {
    return this.data.blogs.find(b => b.id === id);
  }
  saveBlog(blog: BlogPost): void {
    const idx = this.data.blogs.findIndex(b => b.id === blog.id);
    if (idx >= 0) this.data.blogs[idx] = blog;
    else this.data.blogs.push(blog);
    this.scheduleSave();
  }
  deleteBlog(id: string): void {
    this.data.blogs = this.data.blogs.filter(b => b.id !== id);
    this.scheduleSave();
  }

  // ── Refresh Tokens ─────────────────────────────────────────────────────────

  addRefreshToken(token: string): void {
    this.data.refreshTokens.push(token);
    this.scheduleSave();
  }
  removeRefreshToken(token: string): void {
    this.data.refreshTokens = this.data.refreshTokens.filter(t => t !== token);
    this.scheduleSave();
  }
  hasRefreshToken(token: string): boolean {
    return this.data.refreshTokens.includes(token);
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  /** Força gravação imediata (uso no seed). */
  flush(): void {
    this.persist();
  }

  /** Retorna estatísticas gerais do sistema. */
  stats() {
    return {
      users: this.data.users.length,
      professionals: this.data.professionals.length,
      forumTopics: this.data.forumTopics.length,
      materials: this.data.materials.length,
      events: this.data.events.length,
      helpRequests: this.data.helpRequests.length,
      suggestions: this.data.suggestions.length,
      blogs: this.data.blogs.length,
    };
  }
}

export const store = new Store();
