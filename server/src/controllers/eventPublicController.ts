import { Request, Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, parseJson } from '../utils/helpers';
import type { AuthRequest } from '../middleware/auth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isEventOpen(eventDate: unknown, eventTime: string): boolean {
  // O MySQL pode retornar event_date como objeto Date ou como string ISO
  // Normaliza para objeto Date primeiro
  let dt: Date;
  if (eventDate instanceof Date) {
    dt = eventDate;
  } else {
    // String: "2026-06-16T00:00:00.000Z" ou "2026-06-16"
    const s = String(eventDate);
    dt = new Date(s);
  }

  // Extrai ano, mês, dia no fuso local do servidor
  const year  = dt.getFullYear();
  const month = dt.getMonth(); // 0-indexed
  const day   = dt.getDate();

  // Hora do evento
  const t = eventTime.includes('-') ? eventTime.split('-')[0].trim() : eventTime.trim();
  const [hour = 0, minute = 0] = t.split(':').map(Number);

  // Monta datetime do evento em fuso local
  const eventMs = new Date(year, month, day, hour, minute, 0).getTime();

  // Compara com início do dia atual — encerra apenas quando o dia do evento passou
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return eventMs >= todayStart.getTime();
}

// ─── GET /events/public/:id ───────────────────────────────────────────────────

export async function getPublicEvent(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const ev = await queryOne<Record<string, unknown>>(
    'SELECT * FROM health_events WHERE id = ?', [id],
  );
  if (!ev) throw new AppError('Evento não encontrado.', 404);

  // Itens de divisão com quem já pegou
  const items = await query<{ id: string; name: string }>(
    'SELECT id, name FROM event_items WHERE event_id = ? ORDER BY created_at ASC', [id],
  );

  const rsvps = await query<{ item_id: string; name: string }>(
    'SELECT item_id, name FROM event_rsvps WHERE event_id = ? AND item_id IS NOT NULL', [id],
  );

  const itemsWithClaims = items.map(item => ({
    ...item,
    claimedBy: rsvps
      .filter(r => r.item_id === item.id)
      .map(r => ({ name: r.name })),
  }));

  const open = isEventOpen(ev.event_date as unknown, ev.event_time as string);
  const ended = !open;

  res.json({
    success: true,
    data: {
      ...ev,
      rsvp_enabled:  Boolean(ev.rsvp_enabled ?? 1),
      allow_guests:  Boolean(ev.allow_guests ?? 0),
      item_division: Boolean(ev.item_division ?? 0),
      items: itemsWithClaims,
      is_open: open,
      ended,
    },
  });
}

// ─── POST /events/public/:id/rsvp ─────────────────────────────────────────────

export async function submitRsvp(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { name, phone, guests = 0, itemId, observation } = req.body as {
    name: string; phone?: string; guests?: number; itemId?: string; observation?: string;
  };

  if (!name?.trim()) throw new AppError('Nome é obrigatório.', 400);

  const ev = await queryOne<{
    id: string; rsvp_enabled: number; event_date: string; event_time: string;
  }>('SELECT id, rsvp_enabled, event_date, event_time FROM health_events WHERE id = ?', [id]);

  if (!ev) throw new AppError('Evento não encontrado.', 404);
  if (!ev.rsvp_enabled) throw new AppError('RSVP não habilitado neste evento.', 400);

  if (!isEventOpen(ev.event_date as unknown, ev.event_time as string)) {
    throw new AppError('As inscrições para este evento foram encerradas.', 410);
  }

  // Valida item se fornecido
  if (itemId) {
    const item = await queryOne<{ id: string }>(
      'SELECT id FROM event_items WHERE id = ? AND event_id = ?', [itemId, id],
    );
    if (!item) throw new AppError('Item inválido.', 400);
  }

  const rsvpId = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO event_rsvps (id, event_id, user_id, name, phone, guests, item_id, observation, created_at)
     VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?)`,
    [rsvpId, id, name.trim(), phone ?? null, guests, itemId ?? null, observation ?? null, now],
  );

  // Atualiza contagem de participantes
  await execute(
    'UPDATE health_events SET participants_count = participants_count + 1, updated_at = ? WHERE id = ?',
    [now, id],
  );

  res.status(201).json({ success: true, data: { id: rsvpId } });
}

// ─── GET /events/:id/rsvps (admin) ────────────────────────────────────────────

export async function listRsvps(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const rsvps = await query<Record<string, unknown>>(
    `SELECT r.*, ei.name AS item_name
     FROM event_rsvps r
     LEFT JOIN event_items ei ON ei.id = r.item_id
     WHERE r.event_id = ?
     ORDER BY r.created_at ASC`,
    [id],
  );
  res.json({ success: true, data: rsvps });
}

// ─── PATCH /events/:eventId/rsvps/:rsvpId (toggle presença) ──────────────────

export async function updateRsvpAttendance(req: AuthRequest, res: Response): Promise<void> {
  const { rsvpId } = req.params;
  const { attendance } = req.body as { attendance: string };

  if (!['confirmed', 'present', 'absent'].includes(attendance)) {
    throw new AppError('Valor inválido para attendance.', 400);
  }

  const rsvp = await queryOne<{ id: string }>('SELECT id FROM event_rsvps WHERE id = ?', [rsvpId]);
  if (!rsvp) throw new AppError('Inscrição não encontrada.', 404);

  await execute('UPDATE event_rsvps SET attendance = ? WHERE id = ?', [attendance, rsvpId]);
  res.json({ success: true });
}

// ─── DELETE /events/:eventId/rsvps/:rsvpId ────────────────────────────────────

export async function deleteRsvp(req: AuthRequest, res: Response): Promise<void> {
  const { rsvpId } = req.params;
  await execute('DELETE FROM event_rsvps WHERE id = ?', [rsvpId]);
  res.json({ success: true });
}

// ─── CRUD de itens de um evento específico (admin do evento) ──────────────────

export async function addEventItem(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id: eventId } = req.params;
  const { name } = req.body as { name: string };
  if (!name?.trim()) throw new AppError('Nome do item é obrigatório.', 400);

  const event = await queryOne<{ instructor_id: string }>(
    'SELECT instructor_id FROM health_events WHERE id = ?', [eventId],
  );
  if (!event) throw new AppError('Evento não encontrado.', 404);
  if (event.instructor_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  const id = newId();
  await execute(
    'INSERT INTO event_items (id, event_id, name, created_at) VALUES (?,?,?,?)',
    [id, eventId, name.trim(), nowISO()],
  );

  // Garante que o evento fica marcado como tendo divisão de itens
  await execute('UPDATE health_events SET item_division = 1 WHERE id = ?', [eventId]);

  res.status(201).json({ success: true, data: { id, name: name.trim() } });
}

export async function deleteEventItem(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id: eventId, itemId } = req.params;

  const event = await queryOne<{ instructor_id: string }>(
    'SELECT instructor_id FROM health_events WHERE id = ?', [eventId],
  );
  if (!event) throw new AppError('Evento não encontrado.', 404);
  if (event.instructor_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  const item = await queryOne<{ id: string }>(
    'SELECT id FROM event_items WHERE id = ? AND event_id = ?', [itemId, eventId],
  );
  if (!item) throw new AppError('Item não encontrado.', 404);

  // Libera RSVPs que tinham escolhido esse item, antes de excluí-lo
  await execute('UPDATE event_rsvps SET item_id = NULL WHERE item_id = ?', [itemId]);
  await execute('DELETE FROM event_items WHERE id = ?', [itemId]);

  res.json({ success: true, message: 'Item removido.' });
}

// ─── CRUD de listas pré-definidas (autenticado) ───────────────────────────────

export async function listItemLists(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const rows = await query<Record<string, unknown>>(
    'SELECT * FROM event_item_lists WHERE user_id = ? ORDER BY created_at ASC', [userId],
  );
  res.json({ success: true, data: rows.map(r => ({ ...r, items: parseJson<string[]>(r.items, []) })) });
}

export async function createItemList(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { name, items = [] } = req.body as { name: string; items?: string[] };
  if (!name?.trim()) throw new AppError('Nome é obrigatório.', 400);

  const id = newId();
  const now = nowISO();
  await execute(
    'INSERT INTO event_item_lists (id, user_id, name, items, created_at, updated_at) VALUES (?,?,?,?,?,?)',
    [id, userId, name.trim(), JSON.stringify(items), now, now],
  );
  res.status(201).json({ success: true, data: { id, name: name.trim(), items } });
}

export async function updateItemList(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { name, items } = req.body as { name?: string; items?: string[] };

  const existing = await queryOne<{ user_id: string }>(
    'SELECT user_id FROM event_item_lists WHERE id = ?', [id],
  );
  if (!existing) throw new AppError('Lista não encontrada.', 404);
  if (existing.user_id !== userId) throw new AppError('Acesso negado.', 403);

  await execute(
    `UPDATE event_item_lists
     SET name = COALESCE(?, name),
         items = COALESCE(?, items),
         updated_at = ?
     WHERE id = ?`,
    [name?.trim() ?? null, items ? JSON.stringify(items) : null, nowISO(), id],
  );
  res.json({ success: true });
}

export async function deleteItemList(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id } = req.params;

  const existing = await queryOne<{ user_id: string }>(
    'SELECT user_id FROM event_item_lists WHERE id = ?', [id],
  );
  if (!existing) throw new AppError('Lista não encontrada.', 404);
  if (existing.user_id !== userId) throw new AppError('Acesso negado.', 403);

  await execute('DELETE FROM event_item_lists WHERE id = ?', [id]);
  res.json({ success: true });
}
