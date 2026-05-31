import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, parseJson } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';

export async function listSuggestions(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const { status } = req.query as Record<string, string | undefined>;

  const where = status ? 'WHERE status = ?' : '';
  const params: unknown[] = status ? [status] : [];

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM suggestion_ideas ${where}`, params,
  );

  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM suggestion_ideas ${where} ORDER BY likes DESC, created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  res.json({
    success: true,
    data: rows.map(r => ({ ...r, likedBy: parseJson<string[]>(r.liked_by, []) })),
    meta: buildMeta(countRow?.total ?? 0, { page, limit, offset }),
  });
}

export async function createSuggestion(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { content } = req.body as { content: string };

  const user = await queryOne<{ name: string }>('SELECT name FROM users WHERE id = ?', [req.user.userId]);
  const id = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO suggestion_ideas (id, author_id, author_name, content, liked_by, status, created_at)
     VALUES (?,?,?,?,'[]','open',?)`,
    [id, req.user.userId, user?.name ?? '', content, now],
  );

  res.status(201).json({ success: true, data: { id, content } });
}

export async function likeSuggestion(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const sug = await queryOne<{ liked_by: unknown }>(
    'SELECT liked_by FROM suggestion_ideas WHERE id = ?', [id],
  );
  if (!sug) throw new AppError('Sugestão não encontrada.', 404);

  const liked: string[] = parseJson<string[]>(sug.liked_by, []);
  const idx = liked.indexOf(req.user.userId);
  const added = idx === -1;
  if (added) liked.push(req.user.userId); else liked.splice(idx, 1);

  await execute(
    'UPDATE suggestion_ideas SET liked_by = ?, likes = ? WHERE id = ?',
    [JSON.stringify(liked), liked.length, id],
  );

  res.json({ success: true, data: { likes: liked.length, liked: added } });
}

export async function updateSuggestion(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;
  const { status, adminNote } = req.body as { status?: string; adminNote?: string };

  await execute(
    `UPDATE suggestion_ideas SET
       status     = COALESCE(?, status),
       admin_note = COALESCE(?, admin_note)
     WHERE id = ?`,
    [status ?? null, adminNote ?? null, id],
  );

  res.json({ success: true, message: 'Sugestão atualizada.' });
}
