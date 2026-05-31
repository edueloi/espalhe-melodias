import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, parseJson } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';

// ─── List Topics ──────────────────────────────────────────────────────────────

export async function listTopics(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const { category, search, sort = 'recent', solved } = req.query as Record<string, string | undefined>;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (category && category !== 'Todos') { conditions.push('category = ?'); params.push(category); }
  if (search) {
    conditions.push('(title LIKE ? OR content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (solved === 'true') { conditions.push('is_solved = 1'); }
  if (solved === 'false') { conditions.push('is_solved = 0'); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const orderMap: Record<string, string> = {
    recent:  'created_at DESC',
    popular: 'likes DESC, views DESC',
    solved:  'is_solved DESC, created_at DESC',
  };
  const orderBy = orderMap[sort] ?? 'created_at DESC';

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM forum_topics ${where}`, params,
  );

  const topics = await query<Record<string, unknown>>(
    `SELECT t.*,
            COALESCE(t.author_specialty, u.specialty) AS author_specialty,
            COALESCE(t.author_crp, u.crp) AS author_crp,
            (SELECT COUNT(*) FROM forum_replies r WHERE r.topic_id = t.id) AS replies_count
     FROM forum_topics t
     LEFT JOIN users u ON u.id = t.author_id
     ${where} ORDER BY t.is_pinned DESC, ${orderBy} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const data = topics.map(t => ({
    ...t,
    likedBy: parseJson<string[]>(t.liked_by, []),
    repliesCount: t.replies_count,
  }));

  res.json({
    success: true,
    data,
    meta: buildMeta(countRow?.total ?? 0, { page, limit, offset }),
  });
}

// ─── Get Topic with Replies ───────────────────────────────────────────────────

export async function getTopic(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const topic = await queryOne<Record<string, unknown>>(
    `SELECT t.*, COALESCE(t.author_specialty, u.specialty) AS author_specialty,
            COALESCE(t.author_crp, u.crp) AS author_crp
     FROM forum_topics t LEFT JOIN users u ON u.id = t.author_id
     WHERE t.id = ?`, [id],
  );
  if (!topic) throw new AppError('Tópico não encontrado.', 404);

  await execute('UPDATE forum_topics SET views = views + 1 WHERE id = ?', [id]);

  const replies = await query<Record<string, unknown>>(
    `SELECT r.*, COALESCE(r.author_specialty, u.specialty) AS author_specialty,
            COALESCE(r.author_crp, u.crp) AS author_crp
     FROM forum_replies r LEFT JOIN users u ON u.id = r.author_id
     WHERE r.topic_id = ? ORDER BY r.created_at ASC`, [id],
  );

  res.json({
    success: true,
    data: {
      ...topic,
      likedBy: parseJson<string[]>(topic.liked_by, []),
      replies: replies.map(r => ({ ...r, likedBy: parseJson<string[]>(r.liked_by, []) })),
    },
  });
}

// ─── Create Topic ─────────────────────────────────────────────────────────────

export async function createTopic(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { title, category, content } = req.body as {
    title: string; category: string; content: string;
  };

  const user = await queryOne<{ name: string; avatar: string | null; specialty: string | null; crp: string | null }>(
    'SELECT name, avatar, specialty, crp FROM users WHERE id = ?', [req.user.userId],
  );
  if (!user) throw new AppError('Usuário não encontrado.', 404);

  const id = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO forum_topics
     (id, title, category, author_id, author_name, author_role, author_avatar, author_specialty, author_crp, content, liked_by, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,'[]',?,?)`,
    [id, title, category, req.user.userId, user.name, req.user.role, user.avatar ?? null, user.specialty ?? null, user.crp ?? null, content, now, now],
  );

  res.status(201).json({ success: true, data: { id, title, category } });
}

// ─── Update Topic ─────────────────────────────────────────────────────────────

export async function updateTopic(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;
  const topic = await queryOne<{ author_id: string }>(
    'SELECT author_id FROM forum_topics WHERE id = ?', [id],
  );
  if (!topic) throw new AppError('Tópico não encontrado.', 404);

  if (topic.author_id !== req.user.userId && req.user.role === 'member') {
    throw new AppError('Acesso negado.', 403);
  }

  const { title, content, isSolved, isPinned, isLocked } = req.body as Record<string, unknown>;

  await execute(
    `UPDATE forum_topics SET
       title     = COALESCE(?, title),
       content   = COALESCE(?, content),
       is_solved = COALESCE(?, is_solved),
       is_pinned = COALESCE(?, is_pinned),
       is_locked = COALESCE(?, is_locked),
       updated_at = ?
     WHERE id = ?`,
    [
      title ?? null, content ?? null,
      isSolved !== undefined ? (isSolved ? 1 : 0) : null,
      isPinned !== undefined ? (isPinned ? 1 : 0) : null,
      isLocked !== undefined ? (isLocked ? 1 : 0) : null,
      nowISO(), id,
    ],
  );

  res.json({ success: true, message: 'Tópico atualizado.' });
}

// ─── Delete Topic ─────────────────────────────────────────────────────────────

export async function deleteTopic(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;
  const topic = await queryOne<{ author_id: string }>(
    'SELECT author_id FROM forum_topics WHERE id = ?', [id],
  );
  if (!topic) throw new AppError('Tópico não encontrado.', 404);

  if (topic.author_id !== req.user.userId && req.user.role === 'member') {
    throw new AppError('Acesso negado.', 403);
  }

  await execute('DELETE FROM forum_topics WHERE id = ?', [id]);
  res.json({ success: true, message: 'Tópico excluído.' });
}

// ─── Like Topic ───────────────────────────────────────────────────────────────

export async function likeTopic(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const topic = await queryOne<{ liked_by: unknown }>(
    'SELECT liked_by FROM forum_topics WHERE id = ?', [id],
  );
  if (!topic) throw new AppError('Tópico não encontrado.', 404);

  const liked: string[] = parseJson<string[]>(topic.liked_by, []);
  const idx = liked.indexOf(req.user.userId);
  const added = idx === -1;
  if (added) liked.push(req.user.userId); else liked.splice(idx, 1);

  await execute(
    'UPDATE forum_topics SET liked_by = ?, likes = ?, updated_at = ? WHERE id = ?',
    [JSON.stringify(liked), liked.length, nowISO(), id],
  );

  res.json({ success: true, data: { likes: liked.length, liked: added } });
}

// ─── Create Reply ─────────────────────────────────────────────────────────────

export async function createReply(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id: topicId } = req.params;
  const { content } = req.body as { content: string };

  const topic = await queryOne<{ id: string; is_locked: number }>(
    'SELECT id, is_locked FROM forum_topics WHERE id = ?', [topicId],
  );
  if (!topic) throw new AppError('Tópico não encontrado.', 404);
  if (topic.is_locked) throw new AppError('Este tópico está bloqueado para novas respostas.', 403);

  const user = await queryOne<{ name: string; avatar: string | null; specialty: string | null; crp: string | null }>(
    'SELECT name, avatar, specialty, crp FROM users WHERE id = ?', [req.user.userId],
  );

  const isExpert = ['super-admin', 'professional'].includes(req.user.role);
  const id = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO forum_replies
     (id, topic_id, author_id, author_name, author_role, author_avatar, author_specialty, author_crp, content, is_expert_reply, liked_by, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,'[]',?)`,
    [id, topicId, req.user.userId, user?.name ?? '', req.user.role, user?.avatar ?? null, user?.specialty ?? null, user?.crp ?? null, content, isExpert ? 1 : 0, now],
  );

  res.status(201).json({ success: true, data: { id, content, isExpertReply: isExpert } });
}

// ─── Update Reply ─────────────────────────────────────────────────────────────

export async function updateReply(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { replyId } = req.params;
  const { content } = req.body as { content: string };

  const reply = await queryOne<{ author_id: string }>(
    'SELECT author_id FROM forum_replies WHERE id = ?', [replyId],
  );
  if (!reply) throw new AppError('Resposta não encontrada.', 404);
  if (reply.author_id !== req.user.userId) {
    throw new AppError('Acesso negado.', 403);
  }

  await execute(
    'UPDATE forum_replies SET content = ? WHERE id = ?',
    [content, replyId],
  );

  res.json({ success: true, message: 'Resposta atualizada.' });
}

// ─── Delete Reply ─────────────────────────────────────────────────────────────

export async function deleteReply(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { replyId } = req.params;

  const reply = await queryOne<{ author_id: string }>(
    'SELECT author_id FROM forum_replies WHERE id = ?', [replyId],
  );
  if (!reply) throw new AppError('Resposta não encontrada.', 404);

  const isAdmin = req.user.role === 'super-admin';
  if (reply.author_id !== req.user.userId && !isAdmin) {
    throw new AppError('Acesso negado.', 403);
  }

  await execute('DELETE FROM forum_replies WHERE id = ?', [replyId]);
  res.json({ success: true, message: 'Resposta excluída.' });
}

// ─── Like Reply ───────────────────────────────────────────────────────────────

export async function likeReply(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { replyId } = req.params;

  const reply = await queryOne<{ liked_by: unknown }>(
    'SELECT liked_by FROM forum_replies WHERE id = ?', [replyId],
  );
  if (!reply) throw new AppError('Resposta não encontrada.', 404);

  const liked: string[] = parseJson<string[]>(reply.liked_by, []);
  const idx = liked.indexOf(req.user.userId);
  const added = idx === -1;
  if (added) liked.push(req.user.userId); else liked.splice(idx, 1);

  await execute(
    'UPDATE forum_replies SET liked_by = ?, likes = ? WHERE id = ?',
    [JSON.stringify(liked), liked.length, replyId],
  );

  res.json({ success: true, data: { likes: liked.length, liked: added } });
}
