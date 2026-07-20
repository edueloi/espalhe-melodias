import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, parseJson, isDateBeforeToday } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';

export interface HealthEvent {
  id: string;
  title: string;
  slug?: string;
  description: string;
  event_date: string;
  event_time: string;
  location?: string;
  map_link?: string;
  category_id?: string;
  category: string;
  status: 'upcoming' | 'past';
  status_enum?: 'draft' | 'upcoming' | 'ongoing' | 'past' | 'cancelled';
  instructor_id: string;
  instructor_name: string;
  instructor_avatar?: string;
  cover_url?: string;
  thumbnail_url?: string;
  participants_count: number;
  event_capacity: number;
  waitlist_count: number;
  enrolled_user_ids: string[];
  recording_url?: string;
  seo_description?: string;
  registration_deadline?: string;
  created_at: string;
  updated_at: string;
  isEnrolled?: boolean;
}

/** Listar eventos com filtros e paginação */
export async function listEvents(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const { status, status_enum, category, category_id, search } = req.query as Record<
    string,
    string | undefined
  >;

  const conditions: string[] = [];
  const params: unknown[] = [];

  // Status filter
  if (status && status !== 'all') {
    conditions.push('status = ?');
    params.push(status);
  }
  if (status_enum && status_enum !== 'all') {
    conditions.push('(status_enum = ? OR status_enum IS NULL)');
    params.push(status_enum);
  }

  // Category
  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (category_id) {
    conditions.push('category_id = ?');
    params.push(category_id);
  }

  // Search
  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM health_events ${where}`,
    params,
  );

  const rows = await query<Record<string, unknown>>(
    `SELECT id, title, slug, description, event_date, event_time, location,
            category_id, category, status, status_enum, instructor_name,
            instructor_avatar, cover_url, thumbnail_url, participants_count,
            event_capacity, enrolled_user_ids, recording_url
     FROM health_events ${where}
     ORDER BY event_date DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const userId = req.user?.userId;
  const data = rows.map((e) => ({
    ...e,
    enrolledUserIds: parseJson<string[]>(e.enrolled_user_ids, []),
    isEnrolled: userId ? parseJson<string[]>(e.enrolled_user_ids, []).includes(userId) : false,
  }));

  res.json({
    success: true,
    data,
    meta: buildMeta(countRow?.total ?? 0, { page, limit, offset }),
  });
}

/** Obter evento por ID */
export async function getEvent(req: AuthRequest, res: Response): Promise<void> {
  const row = await queryOne<Record<string, unknown>>(
    'SELECT * FROM health_events WHERE id = ?',
    [req.params.id],
  );

  if (!row) throw new AppError('Evento não encontrado.', 404);

  const userId = req.user?.userId;
  const enrolled = parseJson<string[]>(row.enrolled_user_ids, []);

  res.json({
    success: true,
    data: {
      ...row,
      enrolledUserIds: enrolled,
      isEnrolled: userId ? enrolled.includes(userId) : false,
    },
  });
}

/** Obter evento por slug */
export async function getEventBySlug(req: AuthRequest, res: Response): Promise<void> {
  const { slug } = req.params;

  const row = await queryOne<Record<string, unknown>>(
    'SELECT * FROM health_events WHERE slug = ?',
    [slug],
  );

  if (!row) throw new AppError('Evento não encontrado.', 404);

  const userId = req.user?.userId;
  const enrolled = parseJson<string[]>(row.enrolled_user_ids, []);

  res.json({
    success: true,
    data: {
      ...row,
      enrolledUserIds: enrolled,
      isEnrolled: userId ? enrolled.includes(userId) : false,
    },
  });
}

/** Criar evento (admin/professional) */
export async function createEvent(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const {
    title,
    slug,
    description,
    date,
    time,
    location,
    mapLink,
    category_id,
    category,
    coverUrl,
    thumbnailUrl,
    event_capacity = 0,
    seoDescription,
    registration_deadline,
    status_enum = 'draft',
    rsvpEnabled = true,
    allowGuests = false,
    itemDivision = false,
    divisionItems = [],
  } = req.body as {
    title: string;
    slug?: string;
    description: string;
    date: string;
    time: string;
    location?: string;
    mapLink?: string;
    category_id?: string;
    category?: string;
    coverUrl?: string;
    thumbnailUrl?: string;
    event_capacity?: number;
    seoDescription?: string;
    registration_deadline?: string;
    status_enum?: string;
    rsvpEnabled?: boolean;
    allowGuests?: boolean;
    itemDivision?: boolean;
    divisionItems?: string[];
  };

  if (!title || !description || !date || !time) {
    throw new AppError('Título, descrição, data e horário são obrigatórios.', 400);
  }

  // Validar slug se fornecido
  if (slug) {
    const existing = await queryOne('SELECT id FROM health_events WHERE slug = ?', [slug]);
    if (existing) {
      throw new AppError('Slug já existe.', 400);
    }
  }

  const user = await queryOne<{ name: string; avatar: string | null }>(
    'SELECT name, avatar FROM users WHERE id = ?',
    [req.user.userId],
  );

  const id = newId();
  const now = nowISO();
  const generatedSlug = slug || `${title.toLowerCase().replace(/\s+/g, '-')}-${id.substring(0, 8)}`;
  const isPast = isDateBeforeToday(date);
  const status = status_enum === 'draft' ? 'upcoming' : isPast ? 'past' : 'upcoming';

  await execute(
    `INSERT INTO health_events
     (id, title, slug, instructor_id, instructor_name, instructor_avatar,
      event_date, event_time, description, category_id, category,
      status, status_enum, enrolled_user_ids, recording_url,
      location, map_link, cover_url, thumbnail_url,
      rsvp_enabled, allow_guests, item_division,
      event_capacity, seo_description, registration_deadline,
      created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      title,
      generatedSlug,
      req.user.userId,
      user?.name ?? '',
      user?.avatar ?? null,
      date,
      time,
      description,
      category_id ?? null,
      category ?? null,
      status,
      status_enum,
      null,
      location ?? null,
      mapLink ?? null,
      coverUrl ?? null,
      thumbnailUrl ?? null,
      rsvpEnabled ? 1 : 0,
      allowGuests ? 1 : 0,
      itemDivision ? 1 : 0,
      event_capacity,
      seoDescription ?? null,
      registration_deadline ?? null,
      now,
      now,
    ],
  );

  // Salva itens de divisão
  if (itemDivision && Array.isArray(divisionItems)) {
    for (const name of divisionItems.filter((s: string) => s?.trim())) {
      await execute(
        'INSERT INTO event_items (id, event_id, name, created_at) VALUES (?,?,?,?)',
        [newId(), id, name.trim(), now],
      );
    }
  }

  res.status(201).json({
    success: true,
    data: { id, title, slug: generatedSlug, status_enum },
  });
}

/** Atualizar evento (owner ou admin) */
export async function updateEvent(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const event = await queryOne<{ instructor_id: string }>(
    'SELECT instructor_id FROM health_events WHERE id = ?',
    [id],
  );

  if (!event) throw new AppError('Evento não encontrado.', 404);

  if (event.instructor_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  const {
    title,
    description,
    date,
    time,
    location,
    category_id,
    category,
    status_enum,
    recordingUrl,
    seoDescription,
    event_capacity,
    registration_deadline,
    coverUrl,
    thumbnailUrl,
  } = req.body as Record<string, unknown>;

  // Se mudar status_enum para publicado, verificar se precisa atualizar status (upcoming/past)
  let statusUpdate = null;
  if (status_enum === 'upcoming' || status_enum === 'past') {
    statusUpdate = status_enum;
  } else if (date) {
    statusUpdate = isDateBeforeToday(date as string) ? 'past' : 'upcoming';
  }

  await execute(
    `UPDATE health_events SET
       title = COALESCE(?, title),
       description = COALESCE(?, description),
       event_date = COALESCE(?, event_date),
       event_time = COALESCE(?, event_time),
       location = COALESCE(?, location),
       category_id = COALESCE(?, category_id),
       category = COALESCE(?, category),
       status_enum = COALESCE(?, status_enum),
       status = COALESCE(?, status),
       recording_url = COALESCE(?, recording_url),
       seo_description = COALESCE(?, seo_description),
       event_capacity = COALESCE(?, event_capacity),
       registration_deadline = COALESCE(?, registration_deadline),
       cover_url = COALESCE(?, cover_url),
       thumbnail_url = COALESCE(?, thumbnail_url),
       updated_at = ?
     WHERE id = ?`,
    [
      title ?? null,
      description ?? null,
      date ?? null,
      time ?? null,
      location ?? null,
      category_id ?? null,
      category ?? null,
      status_enum ?? null,
      statusUpdate ?? null,
      recordingUrl ?? null,
      seoDescription ?? null,
      event_capacity ?? null,
      registration_deadline ?? null,
      coverUrl ?? null,
      thumbnailUrl ?? null,
      nowISO(),
      id,
    ],
  );

  res.json({ success: true, message: 'Evento atualizado.' });
}

/** Deletar evento (owner ou admin) */
export async function deleteEvent(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const event = await queryOne<{ instructor_id: string }>(
    'SELECT instructor_id FROM health_events WHERE id = ?',
    [id],
  );

  if (!event) throw new AppError('Evento não encontrado.', 404);

  if (event.instructor_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  await execute('DELETE FROM health_events WHERE id = ?', [id]);
  res.json({ success: true, message: 'Evento excluído.' });
}

/** Inscrever/Desinscrever em evento */
export async function enrollEvent(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const event = await queryOne<{ enrolled_user_ids: unknown; status: string; event_capacity: number }>(
    'SELECT enrolled_user_ids, status, event_capacity FROM health_events WHERE id = ?',
    [id],
  );

  if (!event) throw new AppError('Evento não encontrado.', 404);
  if (event.status === 'past') throw new AppError('Não é possível se inscrever em eventos passados.', 400);

  const list: string[] = parseJson<string[]>(event.enrolled_user_ids, []);
  const idx = list.indexOf(req.user.userId);
  const enrolled = idx === -1;

  // Verificar capacidade se inscrevendo
  if (enrolled && event.event_capacity > 0 && list.length >= event.event_capacity) {
    // Adicionar à waitlist
    await execute(
      'UPDATE health_events SET waitlist_count = waitlist_count + 1 WHERE id = ?',
      [id],
    );
    res.json({
      success: true,
      data: {
        enrolled: true,
        participantsCount: list.length,
        waitlist: true,
        message: 'Você foi adicionado à lista de espera.',
      },
    });
  }

  if (enrolled) {
    list.push(req.user.userId);
  } else {
    list.splice(idx, 1);
  }

  await execute(
    'UPDATE health_events SET enrolled_user_ids = ?, participants_count = ?, updated_at = ? WHERE id = ?',
    [JSON.stringify(list), list.length, nowISO(), id],
  );

  res.json({
    success: true,
    data: { enrolled, participantsCount: list.length, waitlist: false },
  });
}

/** Obter eventos próximos (próximos N dias) */
export async function getUpcomingEvents(req: AuthRequest, res: Response): Promise<void> {
  const { limit = '10', days = '30' } = req.query as Record<string, string | undefined>;

  const events = await query<Record<string, unknown>>(
    `SELECT id, title, slug, event_date, event_time, location,
            category, instructor_name, cover_url, participants_count, event_capacity
     FROM health_events
     WHERE status = 'upcoming'
       AND event_date > NOW()
       AND event_date <= DATE_ADD(NOW(), INTERVAL ? DAY)
     ORDER BY event_date ASC
     LIMIT ?`,
    [parseInt(days, 10) || 30, parseInt(limit, 10) || 10],
  );

  res.json({
    success: true,
    data: events,
  });
}

/** Obter eventos populares (mais inscritos) */
export async function getPopularEvents(req: AuthRequest, res: Response): Promise<void> {
  const { limit = '10' } = req.query as Record<string, string | undefined>;

  const events = await query<Record<string, unknown>>(
    `SELECT id, title, slug, event_date, event_time, location,
            category, instructor_name, cover_url, participants_count, event_capacity
     FROM health_events
     WHERE status IN ('upcoming', 'ongoing')
     ORDER BY participants_count DESC
     LIMIT ?`,
    [parseInt(limit, 10) || 10],
  );

  res.json({
    success: true,
    data: events,
  });
}
