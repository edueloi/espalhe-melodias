import { Request, Response } from 'express';
import { execute, query, queryOne } from '../config/db';
import type { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, parseJson } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';

function normalizeEmail(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function assertEmail(email: string): void {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) throw new AppError('E-mail inválido.', 400);
}

function requireAdmin(req: AuthRequest): void {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  if (req.user.role !== 'super-admin') throw new AppError('Acesso negado.', 403);
}

export async function subscribeNewsletter(req: Request, res: Response): Promise<void> {
  const email = normalizeEmail(req.body.email);
  assertEmail(email);

  const existing = await queryOne<{ id: string; status: string }>(
    'SELECT id, status FROM newsletter_subscribers WHERE email = ?',
    [email],
  );

  const now = nowISO();
  const id = existing?.id ?? newId();
  let message = 'Inscrição realizada com sucesso.';

  if (!existing) {
    await execute(
      `INSERT INTO newsletter_subscribers
       (id, email, status, subscribedAt, unsubscribedAt, metadata, createdAt, updatedAt)
       VALUES (?, ?, 'subscribed', ?, NULL, JSON_OBJECT('source', 'public-site'), ?, ?)`,
      [id, email, now, now, now],
    );
  } else if (existing.status === 'subscribed') {
    message = 'Este e-mail já está inscrito.';
  } else {
    await execute(
      `UPDATE newsletter_subscribers
       SET status = 'subscribed', subscribedAt = ?, unsubscribedAt = NULL, updatedAt = ?
       WHERE id = ?`,
      [now, now, id],
    );
    message = 'Inscrição reativada com sucesso.';
  }

  res.status(existing ? 200 : 201).json({
    success: true,
    message,
    data: { id, message },
  });
}

export async function unsubscribeNewsletter(req: Request, res: Response): Promise<void> {
  const email = normalizeEmail(req.body.email);
  assertEmail(email);

  const existing = await queryOne<{ id: string; status: string }>(
    'SELECT id, status FROM newsletter_subscribers WHERE email = ?',
    [email],
  );
  if (!existing) throw new AppError('E-mail não encontrado na newsletter.', 404);

  if (existing.status !== 'unsubscribed') {
    const now = nowISO();
    await execute(
      `UPDATE newsletter_subscribers
       SET status = 'unsubscribed', unsubscribedAt = ?, updatedAt = ?
       WHERE id = ?`,
      [now, now, existing.id],
    );
  }

  res.json({
    success: true,
    message: 'E-mail removido da newsletter.',
    data: { email },
  });
}

export async function getNewsletterCount(_req: Request, res: Response): Promise<void> {
  const stats = await queryOne<{ total: number; active: number }>(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'subscribed' THEN 1 ELSE 0 END) AS active
     FROM newsletter_subscribers`,
  );

  res.json({
    success: true,
    data: {
      total: Number(stats?.total ?? 0),
      active: Number(stats?.active ?? 0),
    },
  });
}

export async function createContactMessage(req: Request, res: Response): Promise<void> {
  const name = String(req.body.name ?? '').trim();
  const email = normalizeEmail(req.body.email);
  const phone = String(req.body.phone ?? '').trim();
  const subject = String(req.body.subject ?? '').trim();
  const messageBody = String(req.body.message ?? '').trim();

  if (!name) throw new AppError('Nome é obrigatório.', 400);
  assertEmail(email);
  if (!subject) throw new AppError('Assunto é obrigatório.', 400);
  if (messageBody.length < 10) throw new AppError('A mensagem deve ter pelo menos 10 caracteres.', 400);

  const id = newId();
  const now = nowISO();
  const successMessage = 'Mensagem enviada com sucesso.';

  await execute(
    `INSERT INTO contact_messages
     (id, name, email, phone, subject, message, status, adminReply, respondedAt, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 'new', NULL, NULL, ?, ?)`,
    [id, name, email, phone || null, subject, messageBody, now, now],
  );

  res.status(201).json({
    success: true,
    message: successMessage,
    data: { id, message: successMessage },
  });
}

export async function getMessage(req: AuthRequest, res: Response): Promise<void> {
  requireAdmin(req);

  const message = await queryOne<Record<string, unknown>>(
    `SELECT
       id,
       name,
       email,
       phone,
       subject,
       message,
       status,
       adminReply AS admin_reply,
       respondedAt AS responded_at,
       createdAt AS created_at,
       updatedAt AS updated_at
     FROM contact_messages
     WHERE id = ?`,
    [req.params.messageId],
  );

  if (!message) throw new AppError('Mensagem não encontrada.', 404);
  res.json({ success: true, data: message });
}

export async function getContactMessages(req: AuthRequest, res: Response): Promise<void> {
  requireAdmin(req);

  const { page, limit, offset } = getPagination(req);
  const { status } = req.query as Record<string, string | undefined>;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM contact_messages ${where}`,
    params,
  );

  const rows = await query<Record<string, unknown>>(
    `SELECT
       id,
       name,
       email,
       phone,
       subject,
       message,
       status,
       adminReply AS admin_reply,
       respondedAt AS responded_at,
       createdAt AS created_at,
       updatedAt AS updated_at
     FROM contact_messages
     ${where}
     ORDER BY createdAt DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  res.json({
    success: true,
    data: rows,
    meta: buildMeta(Number(countRow?.total ?? 0), { page, limit, offset }),
  });
}

export async function updateContactMessage(req: AuthRequest, res: Response): Promise<void> {
  requireAdmin(req);

  const { messageId } = req.params;
  const { status, adminReply } = req.body as { status?: string; adminReply?: string };

  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM contact_messages WHERE id = ?',
    [messageId],
  );
  if (!existing) throw new AppError('Mensagem não encontrada.', 404);

  const trimmedReply = adminReply?.trim() || null;
  const repliedAt = trimmedReply ? nowISO() : null;

  await execute(
    `UPDATE contact_messages
     SET status = COALESCE(?, status),
         adminReply = COALESCE(?, adminReply),
         respondedAt = CASE
           WHEN ? IS NOT NULL THEN COALESCE(respondedAt, ?)
           ELSE respondedAt
         END,
         updatedAt = ?
     WHERE id = ?`,
    [status ?? null, trimmedReply, trimmedReply, repliedAt, nowISO(), messageId],
  );

  res.json({ success: true, message: 'Mensagem atualizada.' });
}

export async function respondToMessage(req: AuthRequest, res: Response): Promise<void> {
  await updateContactMessage(req, res);
}

export async function exportMessages(req: AuthRequest, res: Response): Promise<void> {
  requireAdmin(req);

  const rows = await query<Record<string, unknown>>(
    `SELECT
       id,
       name,
       email,
       phone,
       subject,
       message,
       status,
       adminReply AS admin_reply,
       respondedAt AS responded_at,
       createdAt AS created_at
     FROM contact_messages
     ORDER BY createdAt DESC`,
  );

  res.json({ success: true, data: rows });
}

export async function getWebsiteStats(_req: Request, res: Response): Promise<void> {
  const [newsletterStats, messageStats, eventStats, inscriptionStats] = await Promise.all([
    queryOne<{ total: number; active: number }>(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'subscribed' THEN 1 ELSE 0 END) AS active
       FROM newsletter_subscribers`,
    ),
    queryOne<{ total: number; new_messages: number }>(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_messages
       FROM contact_messages`,
    ),
    queryOne<{ total: number }>('SELECT COUNT(*) AS total FROM health_events'),
    queryOne<{ total: number }>('SELECT COUNT(*) AS total FROM event_rsvps'),
  ]);

  res.json({
    success: true,
    data: {
      subscribers: Number(newsletterStats?.active ?? 0),
      totalSubscribers: Number(newsletterStats?.total ?? 0),
      messages: Number(messageStats?.total ?? 0),
      newMessages: Number(messageStats?.new_messages ?? 0),
      events: Number(eventStats?.total ?? 0),
      inscriptions: Number(inscriptionStats?.total ?? 0),
    },
  });
}

export async function subscribeToEvent(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const event = await queryOne<{ enrolled_user_ids: unknown; status: string }>(
    'SELECT enrolled_user_ids, status FROM health_events WHERE id = ?',
    [req.params.eventId],
  );
  if (!event) throw new AppError('Evento não encontrado.', 404);
  if (event.status === 'past') throw new AppError('Não é possível se inscrever em eventos passados.', 400);

  const enrolled = parseJson<string[]>(event.enrolled_user_ids, []);
  if (!enrolled.includes(req.user.userId)) {
    enrolled.push(req.user.userId);
    await execute(
      'UPDATE health_events SET enrolled_user_ids = ?, participants_count = ?, updated_at = ? WHERE id = ?',
      [JSON.stringify(enrolled), enrolled.length, nowISO(), req.params.eventId],
    );
  }

  res.json({
    success: true,
    data: { enrolled: true, participantsCount: enrolled.length },
  });
}

export async function unsubscribeFromEvent(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const event = await queryOne<{ enrolled_user_ids: unknown }>(
    'SELECT enrolled_user_ids FROM health_events WHERE id = ?',
    [req.params.eventId],
  );
  if (!event) throw new AppError('Evento não encontrado.', 404);

  const enrolled = parseJson<string[]>(event.enrolled_user_ids, []).filter(
    userId => userId !== req.user!.userId,
  );

  await execute(
    'UPDATE health_events SET enrolled_user_ids = ?, participants_count = ?, updated_at = ? WHERE id = ?',
    [JSON.stringify(enrolled), enrolled.length, nowISO(), req.params.eventId],
  );

  res.json({
    success: true,
    data: { enrolled: false, participantsCount: enrolled.length },
  });
}

export async function getEventInscriptions(req: AuthRequest, res: Response): Promise<void> {
  requireAdmin(req);

  const event = await queryOne<{ enrolled_user_ids: unknown }>(
    'SELECT enrolled_user_ids FROM health_events WHERE id = ?',
    [req.params.eventId],
  );
  if (!event) throw new AppError('Evento não encontrado.', 404);

  const enrolledIds = parseJson<string[]>(event.enrolled_user_ids, []);
  if (enrolledIds.length === 0) {
    res.json({ success: true, data: [] });
    return;
  }

  const placeholders = enrolledIds.map(() => '?').join(', ');
  const rows = await query<Record<string, unknown>>(
    `SELECT id, name, email, role, avatar
     FROM users
     WHERE id IN (${placeholders})`,
    enrolledIds,
  );

  res.json({ success: true, data: rows });
}
