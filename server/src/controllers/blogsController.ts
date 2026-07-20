import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, parseJson } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(title: string): string {
  return title
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 280);
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base || 'post';
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = excludeId
      ? await queryOne('SELECT id FROM blog_posts WHERE slug = ? AND id != ?', [candidate, excludeId])
      : await queryOne('SELECT id FROM blog_posts WHERE slug = ?', [candidate]);
    if (!existing) return candidate;
    candidate = `${base}-${n}`;
    n++;
  }
}

export async function listBlogs(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const { category, category_id, search, published, status, featured } =
    req.query as Record<string, string | undefined>;

  const conditions: string[] = [];
  const params: unknown[] = [];

  const isStaff = !!req.user && ['super-admin', 'professional'].includes(req.user.role);
  if (status === 'all' && isStaff) {
    // vê tudo (rascunhos, arquivados, publicados)
  } else if (published === 'all' && isStaff) {
    // compat com chamadas antigas que ainda usam published=all
  } else {
    conditions.push("status = 'published'");
  }

  if (category) { conditions.push('category = ?'); params.push(category); }
  if (category_id) { conditions.push('category_id = ?'); params.push(category_id); }
  if (featured === 'true') {
    conditions.push('featured = 1 AND (featured_until IS NULL OR featured_until > NOW())');
  }
  if (search) {
    conditions.push('(title LIKE ? OR excerpt LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM blog_posts ${where}`, params,
  );

  const rows = await query<Record<string, unknown>>(
    `SELECT id, title, slug, excerpt, category_id, category, image_url,
            author_id, author_name, author_avatar, post_date, read_time, likes,
            status, published, featured, views_count, seo_title, seo_description
     FROM blog_posts ${where}
     ORDER BY featured DESC, post_date DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  res.json({
    success: true,
    data: rows,
    meta: buildMeta(countRow?.total ?? 0, { page, limit, offset }),
  });
}

async function respondWithPost(
  req: AuthRequest, res: Response, post: Record<string, unknown> | undefined,
): Promise<void> {
  if (!post) throw new AppError('Artigo não encontrado.', 404);

  if (post.status !== 'published' && (!req.user || req.user.role === 'member')) {
    throw new AppError('Artigo não disponível.', 404);
  }

  if (post.status === 'published') {
    await execute('UPDATE blog_posts SET views_count = views_count + 1 WHERE id = ?', [post.id]);
  }

  res.json({
    success: true,
    data: { ...post, likedBy: parseJson<string[]>(post.liked_by, []) },
  });
}

export async function getBlog(req: AuthRequest, res: Response): Promise<void> {
  const post = await queryOne<Record<string, unknown>>(
    'SELECT * FROM blog_posts WHERE id = ?', [req.params.id],
  );
  await respondWithPost(req, res, post);
}

export async function getBlogBySlug(req: AuthRequest, res: Response): Promise<void> {
  const post = await queryOne<Record<string, unknown>>(
    'SELECT * FROM blog_posts WHERE slug = ?', [req.params.slug],
  );
  await respondWithPost(req, res, post);
}

export async function checkSlug(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { slug, excludeId } = req.query as { slug?: string; excludeId?: string };
  if (!slug) throw new AppError('Parâmetro slug é obrigatório.', 400);

  const clean = slug.trim().toLowerCase();
  if (!SLUG_RE.test(clean)) {
    res.json({ available: false, reason: 'Slug inválido. Use apenas letras, números e hífens.' });
    return;
  }

  const existing = excludeId
    ? await queryOne('SELECT id FROM blog_posts WHERE slug = ? AND id != ?', [clean, excludeId])
    : await queryOne('SELECT id FROM blog_posts WHERE slug = ?', [clean]);

  if (!existing) {
    res.json({ available: true, slug: clean });
  } else {
    res.json({ available: false, reason: 'Este endereço já está em uso por outro artigo.' });
  }
}

export async function createBlog(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const {
    title, excerpt, content, category, category_id, imageUrl, readTime,
    status = 'draft', seoTitle, seoDescription, seoKeywords, ogImageUrl, featured = false,
  } = req.body as {
    title: string; excerpt: string; content: string; category: string; category_id?: string;
    imageUrl?: string; readTime?: string; status?: 'draft' | 'published' | 'archived';
    seoTitle?: string; seoDescription?: string; seoKeywords?: string; ogImageUrl?: string;
    featured?: boolean;
  };

  if (!title?.trim() || !excerpt?.trim() || !content?.trim() || !category?.trim()) {
    throw new AppError('Título, resumo, conteúdo e categoria são obrigatórios.', 400);
  }

  let slug = (req.body as { slug?: string }).slug?.trim().toLowerCase();
  if (slug && !SLUG_RE.test(slug)) throw new AppError('Slug inválido.', 400);
  slug = await uniqueSlug(slug || slugify(title));

  const user = await queryOne<{ name: string; avatar: string | null }>(
    'SELECT name, avatar FROM users WHERE id = ?', [req.user.userId],
  );

  const id = newId();
  const now = nowISO();
  const isPublished = status === 'published';

  await execute(
    `INSERT INTO blog_posts
     (id, title, slug, excerpt, content, category, category_id, image_url,
      author_id, author_name, author_avatar, read_time, liked_by,
      published, status, seo_title, seo_description, seo_keywords, og_image_url,
      featured, views_count, post_date, published_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'[]',?,?,?,?,?,?,?,0,?,?,?)`,
    [
      id, title.trim(), slug, excerpt.trim(), content, category.trim(), category_id ?? null,
      imageUrl ?? null, req.user.userId, user?.name ?? '', user?.avatar ?? null,
      readTime ?? '5 min',
      isPublished ? 1 : 0, status,
      seoTitle ?? null, seoDescription ?? null, seoKeywords ?? null, ogImageUrl ?? null,
      featured ? 1 : 0, now, isPublished ? now : null, now,
    ],
  );

  res.status(201).json({ success: true, data: { id, title: title.trim(), slug } });
}

export async function updateBlog(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const id = String(req.params.id);

  const post = await queryOne<{ author_id: string; status: string }>(
    'SELECT author_id, status FROM blog_posts WHERE id = ?', [id],
  );
  if (!post) throw new AppError('Artigo não encontrado.', 404);
  if (post.author_id !== req.user.userId && req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  const {
    title, excerpt, content, category, category_id, imageUrl, readTime,
    status, seoTitle, seoDescription, seoKeywords, ogImageUrl, featured, featuredUntil,
  } = req.body as Record<string, unknown>;

  let slug = (req.body as { slug?: string }).slug?.trim().toLowerCase();
  if (slug !== undefined) {
    if (!SLUG_RE.test(slug)) throw new AppError('Slug inválido.', 400);
    slug = await uniqueSlug(slug, id);
  }

  const willBePublished = (status ?? post.status) === 'published';
  const justPublished = willBePublished && post.status !== 'published';

  await execute(
    `UPDATE blog_posts SET
       title            = COALESCE(?, title),
       slug             = COALESCE(?, slug),
       excerpt          = COALESCE(?, excerpt),
       content          = COALESCE(?, content),
       category         = COALESCE(?, category),
       category_id      = COALESCE(?, category_id),
       image_url        = COALESCE(?, image_url),
       read_time        = COALESCE(?, read_time),
       status           = COALESCE(?, status),
       published        = COALESCE(?, published),
       seo_title        = COALESCE(?, seo_title),
       seo_description  = COALESCE(?, seo_description),
       seo_keywords     = COALESCE(?, seo_keywords),
       og_image_url     = COALESCE(?, og_image_url),
       featured         = COALESCE(?, featured),
       featured_until   = COALESCE(?, featured_until),
       published_at     = COALESCE(?, published_at),
       updated_at       = ?
     WHERE id = ?`,
    [
      title ?? null, slug ?? null, excerpt ?? null, content ?? null,
      category ?? null, category_id ?? null, imageUrl ?? null, readTime ?? null,
      status ?? null,
      status !== undefined ? (willBePublished ? 1 : 0) : null,
      seoTitle ?? null, seoDescription ?? null, seoKeywords ?? null, ogImageUrl ?? null,
      featured !== undefined ? (featured ? 1 : 0) : null,
      featuredUntil ?? null,
      justPublished ? nowISO() : null,
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
    'SELECT author_id FROM blog_posts WHERE id = ?', [id],
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
    'SELECT liked_by FROM blog_posts WHERE id = ?', [id],
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

export async function getFeaturedBlogs(req: AuthRequest, res: Response): Promise<void> {
  const { limit = '5' } = req.query as Record<string, string | undefined>;

  const posts = await query<Record<string, unknown>>(
    `SELECT id, title, slug, excerpt, category, image_url, author_name, author_avatar,
            post_date, read_time, seo_description
     FROM blog_posts
     WHERE featured = 1
       AND (featured_until IS NULL OR featured_until > NOW())
       AND status = 'published'
     ORDER BY post_date DESC
     LIMIT ?`,
    [parseInt(limit, 10) || 5],
  );

  res.json({ success: true, data: posts });
}

export async function getPopularBlogs(req: AuthRequest, res: Response): Promise<void> {
  const { limit = '10', days = '30' } = req.query as Record<string, string | undefined>;

  const posts = await query<Record<string, unknown>>(
    `SELECT id, title, slug, excerpt, category, image_url, likes, views_count,
            (likes + (views_count / 100)) AS popularity_score
     FROM blog_posts
     WHERE status = 'published'
       AND post_date > DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY popularity_score DESC
     LIMIT ?`,
    [parseInt(days, 10) || 30, parseInt(limit, 10) || 10],
  );

  res.json({ success: true, data: posts });
}
