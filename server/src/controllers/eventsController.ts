import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, parseJson, isDateBeforeToday } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';

export async function listEvents(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const { status, category, search } = req.query as Record<string, string | undefined>;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status && status !== 'all') { conditions.push('status = ?'); params.push(status); }
  if (category) { conditions.push('category = ?'); params.push(category); }
  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM health_events ${where}`, params,
  );

  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM health_events ${where} ORDER BY event_date DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const eventIds = rows.map(r => r.id as string);

  // Itens de divisão (café/contribuição) + quem já escolheu cada um
  const itemsByEvent = new Map<string, Array<{ id: string; name: string; takers: string[] }>>();
  const presentsByEvent = new Map<string, number>();

  if (eventIds.length > 0) {
    const placeholders = eventIds.map(() => '?').join(',');

    const items = await query<{ id: string; event_id: string; name: string }>(
      `SELECT id, event_id, name FROM event_items WHERE event_id IN (${placeholders}) ORDER BY created_at ASC`,
      eventIds,
    );
    const rsvpsWithItem = await query<{ event_id: string; item_id: string; name: string }>(
      `SELECT event_id, item_id, name FROM event_rsvps WHERE event_id IN (${placeholders}) AND item_id IS NOT NULL`,
      eventIds,
    );
    items.forEach(item => {
      const list = itemsByEvent.get(item.event_id) ?? [];
      list.push({
        id: item.id,
        name: item.name,
        takers: rsvpsWithItem.filter(r => r.item_id === item.id).map(r => r.name),
      });
      itemsByEvent.set(item.event_id, list);
    });

    const presentsRows = await query<{ event_id: string; total: number }>(
      `SELECT event_id, COUNT(*) AS total FROM event_rsvps WHERE event_id IN (${placeholders}) AND attendance = 'present' GROUP BY event_id`,
      eventIds,
    );
    presentsRows.forEach(r => presentsByEvent.set(r.event_id, r.total));
  }

  const userId = req.user?.userId;
  const data = rows.map(e => ({
    ...e,
    enrolledUserIds: parseJson<string[]>(e.enrolled_user_ids, []),
    isEnrolled: userId ? parseJson<string[]>(e.enrolled_user_ids, []).includes(userId) : false,
    division_items: itemsByEvent.get(e.id as string) ?? [],
    presents_count: presentsByEvent.get(e.id as string) ?? 0,
  }));

  res.json({ success: true, data, meta: buildMeta(countRow?.total ?? 0, { page, limit, offset }) });
}

export async function getEvent(req: AuthRequest, res: Response): Promise<void> {
  const row = await queryOne<Record<string, unknown>>(
    'SELECT * FROM health_events WHERE id = ?', [req.params.id],
  );
  if (!row) throw new AppError('Evento não encontrado.', 404);

  const userId = req.user?.userId;
  const enrolled = parseJson<string[]>(row.enrolled_user_ids, []);

  const items = await query<{ id: string; name: string }>(
    'SELECT id, name FROM event_items WHERE event_id = ? ORDER BY created_at ASC', [req.params.id],
  );

  res.json({
    success: true,
    data: { ...row, enrolledUserIds: enrolled, isEnrolled: userId ? enrolled.includes(userId) : false, items },
  });
}

export async function createEvent(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const {
    title, date, time, description, category, recordingUrl,
    location, mapLink, coverUrl, rsvpEnabled = true, allowGuests = false,
    itemDivision = false, divisionItems = [],
  } = req.body as {
    title: string; date: string; time: string; description: string;
    category: string; recordingUrl?: string; location?: string;
    mapLink?: string; coverUrl?: string; rsvpEnabled?: boolean;
    allowGuests?: boolean; itemDivision?: boolean; divisionItems?: string[];
  };

  const user = await queryOne<{ name: string; avatar: string | null }>(
    'SELECT name, avatar FROM users WHERE id = ?', [req.user.userId],
  );

  const id = newId();
  const now = nowISO();
  const isPast = isDateBeforeToday(date);

  await execute(
    `INSERT INTO health_events
     (id, title, instructor_id, instructor_name, instructor_avatar, event_date, event_time,
      description, category, status, enrolled_user_ids, recording_url,
      location, map_link, cover_url, rsvp_enabled, allow_guests, item_division,
      created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id, title, req.user.userId, user?.name ?? '', user?.avatar ?? null,
      date, time, description, category,
      isPast ? 'past' : 'upcoming',
      JSON.stringify([]), recordingUrl ?? null,
      location ?? null, mapLink ?? null, coverUrl ?? null,
      rsvpEnabled ? 1 : 0, allowGuests ? 1 : 0, itemDivision ? 1 : 0,
      now, now,
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

  res.status(201).json({ success: true, data: { id, title } });
}

export async function updateEvent(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const event = await queryOne<{ instructor_id: string }>(
    'SELECT instructor_id FROM health_events WHERE id = ?', [id],
  );
  if (!event) throw new AppError('Evento não encontrado.', 404);

  if (event.instructor_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  const {
    title, date, time, description, category, status,
    location, mapLink, coverUrl, rsvpEnabled, allowGuests,
  } = req.body as Record<string, unknown>;

  await execute(
    `UPDATE health_events SET
       title           = COALESCE(?, title),
       event_date      = COALESCE(?, event_date),
       event_time      = COALESCE(?, event_time),
       description     = COALESCE(?, description),
       category        = COALESCE(?, category),
       status          = COALESCE(?, status),
       location        = COALESCE(?, location),
       map_link        = COALESCE(?, map_link),
       cover_url       = COALESCE(?, cover_url),
       rsvp_enabled    = COALESCE(?, rsvp_enabled),
       allow_guests    = COALESCE(?, allow_guests),
       updated_at      = ?
     WHERE id = ?`,
    [
      title ?? null, date ?? null, time ?? null, description ?? null, category ?? null,
      status ?? null, location ?? null, mapLink ?? null, coverUrl ?? null,
      rsvpEnabled !== undefined ? (rsvpEnabled ? 1 : 0) : null,
      allowGuests !== undefined ? (allowGuests ? 1 : 0) : null,
      nowISO(), id,
    ],
  );

  res.json({ success: true, message: 'Evento atualizado.' });
}

export async function deleteEvent(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;
  const event = await queryOne<{ instructor_id: string }>(
    'SELECT instructor_id FROM health_events WHERE id = ?', [id],
  );
  if (!event) throw new AppError('Evento não encontrado.', 404);
  if (event.instructor_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }
  await execute('DELETE FROM health_events WHERE id = ?', [id]);
  res.json({ success: true, message: 'Evento excluído.' });
}

export async function enrollEvent(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const event = await queryOne<{ enrolled_user_ids: unknown; status: string }>(
    'SELECT enrolled_user_ids, status FROM health_events WHERE id = ?', [id],
  );
  if (!event) throw new AppError('Evento não encontrado.', 404);
  if (event.status === 'past') throw new AppError('Não é possível se inscrever em eventos passados.', 400);

  const list: string[] = parseJson<string[]>(event.enrolled_user_ids, []);
  const idx = list.indexOf(req.user.userId);
  const enrolled = idx === -1;
  if (enrolled) list.push(req.user.userId); else list.splice(idx, 1);

  await execute(
    'UPDATE health_events SET enrolled_user_ids = ?, participants_count = ?, updated_at = ? WHERE id = ?',
    [JSON.stringify(list), list.length, nowISO(), id],
  );

  res.json({ success: true, data: { enrolled, participantsCount: list.length } });
}
