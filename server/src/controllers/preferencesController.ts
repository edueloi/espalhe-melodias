import { Response } from 'express';
import { queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, parseJson } from '../utils/helpers';
import type { AuthRequest } from '../middleware/auth';
import { DEFAULT_PREFERENCES } from '../types/domain';

// ─── Row → objeto tipado ──────────────────────────────────────────────────────

function rowToPrefs(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    theme: row.theme,
    accentColor: row.accent_color,
    fontSize: row.font_size,
    layoutDensity: row.layout_density,
    language: row.language,
    sidebarCollapsed: Boolean(row.sidebar_collapsed),
    notifications: {
      emailNewForumReply:  Boolean(row.notif_forum_reply),
      emailEventReminder:  Boolean(row.notif_event_reminder),
      emailHelpUpdate:     Boolean(row.notif_help_update),
      emailNewMaterial:    Boolean(row.notif_new_material),
      pushEnabled:         Boolean(row.notif_push_enabled),
    },
    dashboard: {
      showWelcomeBanner: Boolean(row.dash_show_welcome),
      showQuoteOfDay:    Boolean(row.dash_show_quote),
      showStatCards:     Boolean(row.dash_show_stats),
      defaultView:       row.dash_default_view,
    },
    filters: {
      forum:     parseJson(row.filter_forum,     DEFAULT_PREFERENCES.filters.forum),
      materials: parseJson(row.filter_materials, DEFAULT_PREFERENCES.filters.materials),
      events:    parseJson(row.filter_events,    DEFAULT_PREFERENCES.filters.events),
      directory: parseJson(row.filter_directory, DEFAULT_PREFERENCES.filters.directory),
    },
    bookmarkedMaterials: parseJson<string[]>(row.bookmarked_materials, []),
    bookmarkedTopics:    parseJson<string[]>(row.bookmarked_topics, []),
    enrolledEvents:      parseJson<string[]>(row.enrolled_events, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── GET /preferences ─────────────────────────────────────────────────────────

export async function getPreferences(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  let row = await queryOne<Record<string, unknown>>(
    'SELECT * FROM user_preferences WHERE user_id = ?',
    [req.user.userId],
  );

  // Cria preferências padrão se ainda não existir
  if (!row) {
    const d = DEFAULT_PREFERENCES;
    const id = newId();
    const now = nowISO();
    await execute(
      `INSERT INTO user_preferences
       (id, user_id, theme, accent_color, font_size, layout_density, language, sidebar_collapsed,
        notif_forum_reply, notif_event_reminder, notif_help_update, notif_new_material, notif_push_enabled,
        dash_show_welcome, dash_show_quote, dash_show_stats, dash_default_view,
        filter_forum, filter_materials, filter_events, filter_directory,
        bookmarked_materials, bookmarked_topics, enrolled_events, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, req.user.userId, d.theme, d.accentColor, d.fontSize, d.layoutDensity, d.language, 0,
        1,1,1,0,0, 1,1,1,'grid',
        JSON.stringify(d.filters.forum), JSON.stringify(d.filters.materials),
        JSON.stringify(d.filters.events), JSON.stringify(d.filters.directory),
        JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), now, now,
      ],
    );
    row = await queryOne<Record<string, unknown>>(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [req.user.userId],
    ) ?? {};
  }

  res.json({ success: true, data: rowToPrefs(row) });
}

// ─── PATCH /preferences ───────────────────────────────────────────────────────

export async function updatePreferences(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const {
    theme, accentColor, fontSize, layoutDensity, language, sidebarCollapsed,
    notifications, dashboard, filters,
    bookmarkedMaterials, bookmarkedTopics, enrolledEvents,
  } = req.body as Partial<{
    theme: string; accentColor: string; fontSize: string; layoutDensity: string;
    language: string; sidebarCollapsed: boolean;
    notifications: Record<string, boolean>;
    dashboard: Record<string, unknown>;
    filters: Record<string, unknown>;
    bookmarkedMaterials: string[];
    bookmarkedTopics: string[];
    enrolledEvents: string[];
  }>;

  const now = nowISO();

  await execute(
    `UPDATE user_preferences SET
       theme               = COALESCE(?, theme),
       accent_color        = COALESCE(?, accent_color),
       font_size           = COALESCE(?, font_size),
       layout_density      = COALESCE(?, layout_density),
       language            = COALESCE(?, language),
       sidebar_collapsed   = COALESCE(?, sidebar_collapsed),
       notif_forum_reply   = COALESCE(?, notif_forum_reply),
       notif_event_reminder= COALESCE(?, notif_event_reminder),
       notif_help_update   = COALESCE(?, notif_help_update),
       notif_new_material  = COALESCE(?, notif_new_material),
       notif_push_enabled  = COALESCE(?, notif_push_enabled),
       dash_show_welcome   = COALESCE(?, dash_show_welcome),
       dash_show_quote     = COALESCE(?, dash_show_quote),
       dash_show_stats     = COALESCE(?, dash_show_stats),
       dash_default_view   = COALESCE(?, dash_default_view),
       filter_forum        = COALESCE(?, filter_forum),
       filter_materials    = COALESCE(?, filter_materials),
       filter_events       = COALESCE(?, filter_events),
       filter_directory    = COALESCE(?, filter_directory),
       bookmarked_materials= COALESCE(?, bookmarked_materials),
       bookmarked_topics   = COALESCE(?, bookmarked_topics),
       enrolled_events     = COALESCE(?, enrolled_events),
       updated_at          = ?
     WHERE user_id = ?`,
    [
      theme ?? null, accentColor ?? null, fontSize ?? null, layoutDensity ?? null,
      language ?? null,
      sidebarCollapsed !== undefined ? (sidebarCollapsed ? 1 : 0) : null,
      notifications?.emailNewForumReply  !== undefined ? (notifications.emailNewForumReply  ? 1 : 0) : null,
      notifications?.emailEventReminder  !== undefined ? (notifications.emailEventReminder  ? 1 : 0) : null,
      notifications?.emailHelpUpdate     !== undefined ? (notifications.emailHelpUpdate     ? 1 : 0) : null,
      notifications?.emailNewMaterial    !== undefined ? (notifications.emailNewMaterial    ? 1 : 0) : null,
      notifications?.pushEnabled         !== undefined ? (notifications.pushEnabled         ? 1 : 0) : null,
      dashboard?.showWelcomeBanner !== undefined ? (dashboard.showWelcomeBanner ? 1 : 0) : null,
      dashboard?.showQuoteOfDay    !== undefined ? (dashboard.showQuoteOfDay    ? 1 : 0) : null,
      dashboard?.showStatCards     !== undefined ? (dashboard.showStatCards     ? 1 : 0) : null,
      dashboard?.defaultView ?? null,
      filters?.forum      ? JSON.stringify(filters.forum)      : null,
      filters?.materials  ? JSON.stringify(filters.materials)  : null,
      filters?.events     ? JSON.stringify(filters.events)     : null,
      filters?.directory  ? JSON.stringify(filters.directory)  : null,
      bookmarkedMaterials ? JSON.stringify(bookmarkedMaterials) : null,
      bookmarkedTopics    ? JSON.stringify(bookmarkedTopics)    : null,
      enrolledEvents      ? JSON.stringify(enrolledEvents)      : null,
      now,
      req.user.userId,
    ],
  );

  const row = await queryOne<Record<string, unknown>>(
    'SELECT * FROM user_preferences WHERE user_id = ?',
    [req.user.userId],
  );

  res.json({ success: true, data: rowToPrefs(row ?? {}) });
}

// ─── POST /preferences/bookmark/material/:id ──────────────────────────────────

export async function toggleBookmarkMaterial(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const id = String(req.params.id);

  const row = await queryOne<{ bookmarked_materials: unknown }>(
    'SELECT bookmarked_materials FROM user_preferences WHERE user_id = ?',
    [req.user.userId],
  );

  const list: string[] = parseJson<string[]>(row?.bookmarked_materials, []);
  const idx = list.indexOf(id);
  const added = idx === -1;
  if (added) list.push(id); else list.splice(idx, 1);

  await execute(
    'UPDATE user_preferences SET bookmarked_materials = ?, updated_at = ? WHERE user_id = ?',
    [JSON.stringify(list), nowISO(), req.user.userId],
  );

  res.json({ success: true, data: { bookmarkedMaterials: list, added } });
}

// ─── POST /preferences/bookmark/topic/:id ────────────────────────────────────

export async function toggleBookmarkTopic(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const id = String(req.params.id);

  const row = await queryOne<{ bookmarked_topics: unknown }>(
    'SELECT bookmarked_topics FROM user_preferences WHERE user_id = ?',
    [req.user.userId],
  );

  const list: string[] = parseJson<string[]>(row?.bookmarked_topics, []);
  const idx = list.indexOf(id);
  const added = idx === -1;
  if (added) list.push(id); else list.splice(idx, 1);

  await execute(
    'UPDATE user_preferences SET bookmarked_topics = ?, updated_at = ? WHERE user_id = ?',
    [JSON.stringify(list), nowISO(), req.user.userId],
  );

  res.json({ success: true, data: { bookmarkedTopics: list, added } });
}

// ─── POST /preferences/enroll/:eventId ───────────────────────────────────────

export async function toggleEventEnrollment(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const id = String(req.params.id);

  const row = await queryOne<{ enrolled_events: unknown }>(
    'SELECT enrolled_events FROM user_preferences WHERE user_id = ?',
    [req.user.userId],
  );

  const list: string[] = parseJson<string[]>(row?.enrolled_events, []);
  const idx = list.indexOf(id);
  const enrolled = idx === -1;
  if (enrolled) list.push(id); else list.splice(idx, 1);

  await execute(
    'UPDATE user_preferences SET enrolled_events = ?, updated_at = ? WHERE user_id = ?',
    [JSON.stringify(list), nowISO(), req.user.userId],
  );

  res.json({ success: true, data: { enrolledEvents: list, enrolled } });
}

// ─── DELETE /preferences/reset ────────────────────────────────────────────────

export async function resetPreferences(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const d = DEFAULT_PREFERENCES;
  const now = nowISO();

  await execute(
    `UPDATE user_preferences SET
       theme='light', accent_color='clay', font_size='md', layout_density='comfortable',
       language='pt-BR', sidebar_collapsed=0,
       notif_forum_reply=1, notif_event_reminder=1, notif_help_update=1, notif_new_material=0, notif_push_enabled=0,
       dash_show_welcome=1, dash_show_quote=1, dash_show_stats=1, dash_default_view='grid',
       filter_forum=?, filter_materials=?, filter_events=?, filter_directory=?,
       bookmarked_materials='[]', bookmarked_topics='[]', enrolled_events='[]',
       updated_at=?
     WHERE user_id=?`,
    [
      JSON.stringify(d.filters.forum), JSON.stringify(d.filters.materials),
      JSON.stringify(d.filters.events), JSON.stringify(d.filters.directory),
      now, req.user.userId,
    ],
  );

  res.json({ success: true, message: 'Preferências restauradas ao padrão.' });
}
