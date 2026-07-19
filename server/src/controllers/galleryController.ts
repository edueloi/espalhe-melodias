import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';
import { deleteGalleryFileIfLocal } from './uploadController';

export async function listGalleryPhotos(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM gallery_photos`,
  );

  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM gallery_photos ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset],
  );

  res.json({
    success: true,
    data: rows,
    meta: buildMeta(countRow?.total ?? 0, { page, limit, offset }),
  });
}

export async function getGalleryPhoto(req: AuthRequest, res: Response): Promise<void> {
  const row = await queryOne<Record<string, unknown>>(
    'SELECT * FROM gallery_photos WHERE id = ?', [req.params.id],
  );
  if (!row) throw new AppError('Foto não encontrada.', 404);
  res.json({ success: true, data: row });
}

export async function createGalleryPhoto(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const { imageUrl, caption } = req.body as { imageUrl: string; caption?: string };
  if (!imageUrl) throw new AppError('imageUrl é obrigatório.', 400);

  const user = await queryOne<{ name: string }>('SELECT name FROM users WHERE id = ?', [req.user.userId]);
  const id = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO gallery_photos
     (id, image_url, caption, author_id, author_name, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?)`,
    [id, imageUrl, caption ?? null, req.user.userId, user?.name ?? '', now, now],
  );

  res.status(201).json({ success: true, data: { id } });
}

export async function updateGalleryPhoto(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const photo = await queryOne<{ author_id: string }>(
    'SELECT author_id FROM gallery_photos WHERE id = ?', [id],
  );
  if (!photo) throw new AppError('Foto não encontrada.', 404);

  if (photo.author_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  const { caption } = req.body as Record<string, unknown>;

  await execute(
    `UPDATE gallery_photos SET
       caption    = COALESCE(?, caption),
       updated_at = ?
     WHERE id = ?`,
    [caption ?? null, nowISO(), id],
  );

  res.json({ success: true, message: 'Foto atualizada.' });
}

export async function deleteGalleryPhoto(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const photo = await queryOne<{ author_id: string; image_url: string }>(
    'SELECT author_id, image_url FROM gallery_photos WHERE id = ?', [id],
  );
  if (!photo) throw new AppError('Foto não encontrada.', 404);

  if (photo.author_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  await execute('DELETE FROM gallery_photos WHERE id = ?', [id]);
  deleteGalleryFileIfLocal(photo.image_url);

  res.json({ success: true, message: 'Foto excluída.' });
}
