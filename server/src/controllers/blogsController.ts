import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, parseJson } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';

export async function listBlogs(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const { category, search, published } = req.query as Record<string, string | undefined>;

  const conditions: string[] = ['published = 1'];
  const params: unknown[] = [];

  if (req.user && ['super-admin', 'professional'].includes(req.user.role) && published === 'all') {
    conditions.length = 0;
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (search) {
    conditions.push('(title LIKE ? OR excerpt LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM blog_posts ${where}`,
    params,
  );

  const rows = await query<Record<string, unknown>>(
    `SELECT id, title, excerpt, category, image_url, author_name, author_avatar, post_date, read_time, likes, published
     FROM blog_posts ${where} ORDER BY post_date DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  res.json({
    success: true,
    data: rows,
    meta: buildMeta(countRow?.total ?? 0, { page, limit, offset }),
  });
}

export async function getBlog(req: AuthRequest, res: Response): Promise<void> {
  const row = await queryOne<Record<string, unknown>>(
    'SELECT * FROM blog_posts WHERE id = ?',
    [req.params.id],
  );

  if (!row) throw new AppError('Artigo não encontrado.', 404);

  const isPublished = Boolean(Number(row.published ?? 0));
  if (!isPublished && (!req.user || req.user.role === 'member')) {
    throw new AppError('Artigo não disponível.', 404);
  }

  res.json({
    success: true,
    data: { ...row, likedBy: parseJson<string[]>(row.liked_by, []) },
  });
}

export async function createBlog(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const { title, excerpt, content, category, imageUrl, readTime, published = true } = req.body as {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    imageUrl?: string;
    readTime?: string;
    published?: boolean;
  };

  const user = await queryOne<{ name: string; avatar: string | null }>(
    'SELECT name, avatar FROM users WHERE id = ?',
    [req.user.userId],
  );

  const id = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO blog_posts
     (id, title, excerpt, content, category, image_url, author_id, author_name, author_avatar,
      read_time, liked_by, published, post_date, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,'[]',?,?,?)`,
    [
      id,
      title,
      excerpt,
      content,
      category,
      imageUrl ?? null,
      req.user.userId,
      user?.name ?? '',
      user?.avatar ?? null,
      readTime ?? '5 min',
      published ? 1 : 0,
      now,
      now,
    ],
  );

  res.status(201).json({ success: true, data: { id, title } });
}

export async function updateBlog(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const post = await queryOne<{ author_id: string }>(
    'SELECT author_id FROM blog_posts WHERE id = ?',
    [id],
  );
  if (!post) throw new AppError('Artigo não encontrado.', 404);

  if (post.author_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  const { title, excerpt, content, category, imageUrl, readTime, published } =
    req.body as Record<string, unknown>;

  await execute(
    `UPDATE blog_posts SET
       title      = COALESCE(?, title),
       excerpt    = COALESCE(?, excerpt),
       content    = COALESCE(?, content),
       category   = COALESCE(?, category),
       image_url  = COALESCE(?, image_url),
       read_time  = COALESCE(?, read_time),
       published  = COALESCE(?, published),
       updated_at = ?
     WHERE id = ?`,
    [
      title ?? null,
      excerpt ?? null,
      content ?? null,
      category ?? null,
      imageUrl ?? null,
      readTime ?? null,
      published !== undefined ? (published ? 1 : 0) : null,
      nowISO(),
      id,
    ],
  );

  res.json({ success: true, message: 'Artigo atualizado.' });
}

export async function deleteBlog(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const post = await queryOne<{ author_id: string }>(
    'SELECT author_id FROM blog_posts WHERE id = ?',
    [id],
  );
  if (!post) throw new AppError('Artigo não encontrado.', 404);

  if (post.author_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  await execute('DELETE FROM blog_posts WHERE id = ?', [id]);
  res.json({ success: true, message: 'Artigo excluído.' });
}

export async function likeBlog(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const post = await queryOne<{ liked_by: unknown }>(
    'SELECT liked_by FROM blog_posts WHERE id = ?',
    [id],
  );
  if (!post) throw new AppError('Artigo não encontrado.', 404);

  const liked = parseJson<string[]>(post.liked_by, []);
  const idx = liked.indexOf(req.user.userId);
  const added = idx === -1;

  if (added) liked.push(req.user.userId);
  else liked.splice(idx, 1);

  await execute(
    'UPDATE blog_posts SET liked_by = ?, likes = ? WHERE id = ?',
    [JSON.stringify(liked), liked.length, id],
  );

  res.json({ success: true, data: { likes: liked.length, liked: added } });
}
