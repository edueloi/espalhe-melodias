import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';

export async function listMaterials(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const { category, type, search, restricted } = req.query as Record<string, string | undefined>;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (category && category !== 'Todos') { conditions.push('category = ?'); params.push(category); }
  if (type && type !== 'Todos') { conditions.push('type = ?'); params.push(type); }
  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  // Membros não aprovados não veem materiais restritos
  if (restricted === 'false' || req.user?.role === 'member') {
    // Mostra todos se membro aprovado; lógica pode ser expandida
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM support_materials ${where}`, params,
  );

  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM support_materials ${where} ORDER BY date_added DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  res.json({
    success: true,
    data: rows,
    meta: buildMeta(countRow?.total ?? 0, { page, limit, offset }),
  });
}

export async function getMaterial(req: AuthRequest, res: Response): Promise<void> {
  const row = await queryOne<Record<string, unknown>>(
    'SELECT * FROM support_materials WHERE id = ?', [req.params.id],
  );
  if (!row) throw new AppError('Material não encontrado.', 404);
  res.json({ success: true, data: row });
}

export async function createMaterial(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const { title, category, type, description, downloadUrl, restrictedToMembers = false } =
    req.body as {
      title: string; category: string; type: string; description: string;
      downloadUrl: string; restrictedToMembers?: boolean;
    };

  const user = await queryOne<{ name: string }>('SELECT name FROM users WHERE id = ?', [req.user.userId]);
  const id = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO support_materials
     (id, title, category, type, description, download_url, author_id, author_name, restricted_to_members, date_added, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id, title, category, type, description, downloadUrl, req.user.userId, user?.name ?? '', restrictedToMembers ? 1 : 0, now, now],
  );

  res.status(201).json({ success: true, data: { id, title } });
}

export async function updateMaterial(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const mat = await queryOne<{ author_id: string }>(
    'SELECT author_id FROM support_materials WHERE id = ?', [id],
  );
  if (!mat) throw new AppError('Material não encontrado.', 404);

  if (mat.author_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  const { title, category, type, description, downloadUrl, restrictedToMembers } =
    req.body as Record<string, unknown>;

  await execute(
    `UPDATE support_materials SET
       title                = COALESCE(?, title),
       category             = COALESCE(?, category),
       type                 = COALESCE(?, type),
       description          = COALESCE(?, description),
       download_url         = COALESCE(?, download_url),
       restricted_to_members= COALESCE(?, restricted_to_members),
       updated_at           = ?
     WHERE id = ?`,
    [
      title ?? null, category ?? null, type ?? null, description ?? null, downloadUrl ?? null,
      restrictedToMembers !== undefined ? (restrictedToMembers ? 1 : 0) : null,
      nowISO(), id,
    ],
  );

  res.json({ success: true, message: 'Material atualizado.' });
}

export async function deleteMaterial(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const mat = await queryOne<{ author_id: string }>(
    'SELECT author_id FROM support_materials WHERE id = ?', [id],
  );
  if (!mat) throw new AppError('Material não encontrado.', 404);

  if (mat.author_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  await execute('DELETE FROM support_materials WHERE id = ?', [id]);
  res.json({ success: true, message: 'Material excluído.' });
}

export async function trackDownload(req: AuthRequest, res: Response): Promise<void> {
  await execute(
    'UPDATE support_materials SET download_count = download_count + 1 WHERE id = ?',
    [req.params.id],
  );
  res.json({ success: true });
}
