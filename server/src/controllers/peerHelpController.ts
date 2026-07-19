import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';

// ─── GET /peer-help — lista pedidos com respostas embutidas ───────────────────

export async function listPeerHelpRequests(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { page, limit, offset } = getPagination(req);
  const { status, mine } = req.query as Record<string, string | undefined>;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (mine === 'true') {
    conditions.push('author_id = ?');
    params.push(req.user.userId);
  } else {
    conditions.push("status = ?");
    params.push(status ?? 'aberto');
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM peer_help_requests ${where}`, params,
  );

  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM peer_help_requests ${where}
     ORDER BY urgency = 'urgente' DESC, created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const ids = rows.map(r => r.id as string);
  const repliesByRequest = new Map<string, Record<string, unknown>[]>();

  if (ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');
    const replies = await query<Record<string, unknown>>(
      `SELECT * FROM peer_help_replies WHERE request_id IN (${placeholders}) ORDER BY created_at ASC`,
      ids,
    );
    replies.forEach(reply => {
      const requestId = reply.request_id as string;
      const list = repliesByRequest.get(requestId) ?? [];
      list.push(reply);
      repliesByRequest.set(requestId, list);
    });
  }

  const userId = req.user.userId;
  const isAdmin = req.user.role === 'super-admin';

  const data = rows.map(r => {
    const anonymous = Boolean(r.anonymous);
    const allReplies = repliesByRequest.get(r.id as string) ?? [];
    const visibleReplies = allReplies.filter(reply => {
      if (!reply.is_private) return true;
      return reply.author_id === userId || isAdmin;
    });
    return {
      ...r,
      anonymous,
      author_name: anonymous ? 'Colega Anônimo(a)' : r.author_name,
      author_specialty: anonymous ? null : r.author_specialty,
      isMine: r.author_id === userId,
      repliesCount: allReplies.length,
      replies: visibleReplies,
    };
  });

  res.json({ success: true, data, meta: buildMeta(countRow?.total ?? 0, { page, limit, offset }) });
}

// ─── POST /peer-help — criar pedido ────────────────────────────────────────────

export async function createPeerHelpRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const { title, description, category, urgency = 'normal', anonymous = false, responsePref = 'qualquer' } =
    req.body as {
      title: string; description: string; category: string;
      urgency?: string; anonymous?: boolean; responsePref?: string;
    };

  if (!title?.trim() || !description?.trim() || !category?.trim()) {
    throw new AppError('Título, descrição e categoria são obrigatórios.', 400);
  }

  const user = await queryOne<{ name: string; specialty: string | null }>(
    'SELECT name, specialty FROM users WHERE id = ?', [req.user.userId],
  );

  const id = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO peer_help_requests
     (id, author_id, author_name, author_specialty, title, description, category, urgency, anonymous, response_pref, status, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,'aberto',?,?)`,
    [
      id, req.user.userId, user?.name ?? '', user?.specialty ?? null,
      title.trim(), description.trim(), category.trim(),
      urgency === 'urgente' ? 'urgente' : 'normal',
      anonymous ? 1 : 0,
      ['qualquer', 'whatsapp', 'privado'].includes(responsePref) ? responsePref : 'qualquer',
      now, now,
    ],
  );

  res.status(201).json({ success: true, data: { id } });
}

// ─── POST /peer-help/:id/replies — responder pedido ────────────────────────────

export async function replyToPeerHelpRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;
  const { message, isPrivate = false } = req.body as { message: string; isPrivate?: boolean };

  if (!message?.trim()) throw new AppError('Mensagem é obrigatória.', 400);

  const request = await queryOne<{ id: string }>('SELECT id FROM peer_help_requests WHERE id = ?', [id]);
  if (!request) throw new AppError('Pedido não encontrado.', 404);

  const user = await queryOne<{ name: string }>('SELECT name FROM users WHERE id = ?', [req.user.userId]);

  const replyId = newId();
  await execute(
    `INSERT INTO peer_help_replies (id, request_id, author_id, author_name, message, is_private, created_at)
     VALUES (?,?,?,?,?,?,?)`,
    [replyId, id, req.user.userId, user?.name ?? '', message.trim(), isPrivate ? 1 : 0, nowISO()],
  );

  res.status(201).json({ success: true, data: { id: replyId } });
}

// ─── PATCH /peer-help/:id/resolve — autor marca como resolvido ────────────────

export async function resolvePeerHelpRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const request = await queryOne<{ author_id: string }>(
    'SELECT author_id FROM peer_help_requests WHERE id = ?', [id],
  );
  if (!request) throw new AppError('Pedido não encontrado.', 404);
  if (request.author_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  await execute(
    'UPDATE peer_help_requests SET status = ?, updated_at = ? WHERE id = ?',
    ['resolvido', nowISO(), id],
  );

  res.json({ success: true, message: 'Pedido marcado como resolvido.' });
}
