import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, parseJson } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string;
  category: string;
  image_url?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  read_time: string;
  likes: number;
  liked_by?: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  featured_until?: string;
  views_count: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image_url?: string;
  post_date: string;
  published_at?: string;
  updated_at: string;
}

/** Listar posts com paginação, filtros, busca */
export async function listBlogs(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const { category, category_id, search, published, featured, status } = req.query as Record<string, string | undefined>;

  const conditions: string[] = [];
  const params: unknown[] = [];

  // Status visibility
  if (status === 'all' && req.user?.role === 'super-admin') {
    // Admin vê tudo
  } else if (published === 'all' && ['super-admin', 'professional'].includes(req.user?.role ?? '')) {
    // Professional vê próprios posts + publicados
  } else {
    conditions.push('status = ?');
    params.push('published');
  }

  // Filtros
  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (category_id) {
    conditions.push('category_id = ?');
    params.push(category_id);
  }
  if (featured === 'true') {
    conditions.push('featured = 1 AND (featured_until IS NULL OR featured_until > NOW())');
  }
  if (search) {
    conditions.push('(MATCH(title, content) AGAINST(? IN BOOLEAN MODE) OR excerpt LIKE ?)');
    params.push(`+${search}*`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM blog_posts ${where}`,
    params,
  );

  const rows = await query<Record<string, unknown>>(
    `SELECT id, title, slug, excerpt, category_id, category, image_url,
            author_name, author_avatar, post_date, read_time, likes, status,
            featured, views_count, seo_title, seo_description
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

/** Obter post por ID */
export async function getBlog(req: AuthRequest, res: Response): Promise<void> {
  const post = await queryOne<Record<string, unknown>>(
    'SELECT * FROM blog_posts WHERE id = ?',
    [req.params.id],
  );

  if (!post) throw new AppError('Artigo não encontrado.', 404);

  // Verificar permissão de visibilidade
  if (post.status !== 'published' && req.user?.role === 'member') {
    throw new AppError('Artigo não disponível.', 404);
  }

  // Incrementar views
  await execute('UPDATE blog_posts SET views_count = views_count + 1 WHERE id = ?', [post.id]);

  res.json({
    success: true,
    data: {
      ...post,
      likedBy: parseJson<string[]>(post.liked_by, []),
    },
  });
}

/** Obter post por SLUG (SEO-friendly) */
export async function getBlogBySlug(req: AuthRequest, res: Response): Promise<void> {
  const { slug } = req.params;

  const post = await queryOne<Record<string, unknown>>(
    'SELECT * FROM blog_posts WHERE slug = ?',
    [slug],
  );

  if (!post) throw new AppError('Artigo não encontrado.', 404);

  // Verificar permissão
  if (post.status !== 'published' && req.user?.role === 'member') {
    throw new AppError('Artigo não disponível.', 404);
  }

  // Incrementar views
  await execute('UPDATE blog_posts SET views_count = views_count + 1 WHERE id = ?', [post.id]);

  res.json({
    success: true,
    data: {
      ...post,
      likedBy: parseJson<string[]>(post.liked_by, []),
    },
  });
}

/** Criar post (admin/professional) */
export async function createBlog(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const {
    title,
    slug,
    excerpt,
    content,
    category_id,
    category,
    imageUrl,
    readTime,
    status = 'draft',
    seoTitle,
    seoDescription,
    seoKeywords,
    ogImageUrl,
    featured = false,
  } = req.body as {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category_id?: string;
    category?: string;
    imageUrl?: string;
    readTime?: string;
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    ogImageUrl?: string;
    featured?: boolean;
  };

  if (!title || !slug || !excerpt || !content) {
    throw new AppError('Título, slug, excerpt e content são obrigatórios.', 400);
  }

  // Verificar slug único
  const existing = await queryOne('SELECT id FROM blog_posts WHERE slug = ?', [slug]);
  if (existing) {
    throw new AppError('Slug já existe.', 400);
  }

  const user = await queryOne<{ name: string; avatar: string | null }>(
    'SELECT name, avatar FROM users WHERE id = ?',
    [req.user.userId],
  );

  const id = newId();
  const now = nowISO();
  const publishedAt = status === 'published' ? now : null;

  await execute(
    `INSERT INTO blog_posts
     (id, title, slug, excerpt, content, category_id, category, image_url,
      author_id, author_name, author_avatar, read_time, liked_by, status,
      seo_title, seo_description, seo_keywords, og_image_url,
      featured, views_count, post_date, published_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    [
      id,
      title,
      slug,
      excerpt,
      content,
      category_id ?? null,
      category ?? null,
      imageUrl ?? null,
      req.user.userId,
      user?.name ?? '',
      user?.avatar ?? null,
      readTime ?? '5 min',
      status,
      seoTitle ?? null,
      seoDescription ?? null,
      seoKeywords ?? null,
      ogImageUrl ?? null,
      featured ? 1 : 0,
      now,
      publishedAt,
      now,
    ],
  );

  res.status(201).json({
    success: true,
    data: { id, title, slug, status },
  });
}

/** Atualizar post (owner ou admin) */
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

  const {
    title,
    slug,
    excerpt,
    content,
    category_id,
    category,
    imageUrl,
    readTime,
    status,
    seoTitle,
    seoDescription,
    seoKeywords,
    ogImageUrl,
    featured,
    featured_until,
  } = req.body as Record<string, unknown>;

  // Validar slug se fornecido
  if (slug) {
    const existing = await queryOne('SELECT id FROM blog_posts WHERE slug = ? AND id != ?', [slug, id]);
    if (existing) {
      throw new AppError('Slug já existe.', 400);
    }
  }

  const currentStatus = await queryOne<{ status: string }>(
    'SELECT status FROM blog_posts WHERE id = ?',
    [id],
  );

  const newStatus = status ?? currentStatus?.status;
  const publishedAt = newStatus === 'published' && currentStatus?.status !== 'published' ? nowISO() : undefined;

  await execute(
    `UPDATE blog_posts SET
       title = COALESCE(?, title),
       slug = COALESCE(?, slug),
       excerpt = COALESCE(?, excerpt),
       content = COALESCE(?, content),
       category_id = COALESCE(?, category_id),
       category = COALESCE(?, category),
       image_url = COALESCE(?, image_url),
       read_time = COALESCE(?, read_time),
       status = COALESCE(?, status),
       seo_title = COALESCE(?, seo_title),
       seo_description = COALESCE(?, seo_description),
       seo_keywords = COALESCE(?, seo_keywords),
       og_image_url = COALESCE(?, og_image_url),
       featured = COALESCE(?, featured),
       featured_until = COALESCE(?, featured_until),
       published_at = COALESCE(?, published_at),
       updated_at = ?
     WHERE id = ?`,
    [
      title ?? null,
      slug ?? null,
      excerpt ?? null,
      content ?? null,
      category_id ?? null,
      category ?? null,
      imageUrl ?? null,
      readTime ?? null,
      status ?? null,
      seoTitle ?? null,
      seoDescription ?? null,
      seoKeywords ?? null,
      ogImageUrl ?? null,
      featured !== undefined ? (featured ? 1 : 0) : null,
      featured_until ?? null,
      publishedAt ?? null,
      nowISO(),
      id,
    ],
  );

  res.json({ success: true, message: 'Artigo atualizado.' });
}

/** Deletar post (owner ou admin) */
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

/** Curtir/Descurtir post */
export async function likeBlog(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const post = await queryOne<{ liked_by: unknown }>(
    'SELECT liked_by FROM blog_posts WHERE id = ?',
    [id],
  );

  if (!post) throw new AppError('Artigo não encontrado.', 404);

  const liked: string[] = parseJson<string[]>(post.liked_by, []);
  const idx = liked.indexOf(req.user.userId);
  const added = idx === -1;

  if (added) {
    liked.push(req.user.userId);
  } else {
    liked.splice(idx, 1);
  }

  await execute(
    'UPDATE blog_posts SET liked_by = ?, likes = ? WHERE id = ?',
    [JSON.stringify(liked), liked.length, id],
  );

  res.json({
    success: true,
    data: { likes: liked.length, liked: added },
  });
}

/** Obter posts destacados (featured) */
export async function getFeaturedBlogs(req: AuthRequest, res: Response): Promise<void> {
  const { limit = '5' } = req.query as Record<string, string | undefined>;

  const posts = await query<Record<string, unknown>>(
    `SELECT id, title, slug, excerpt, image_url, author_name,
            post_date, read_time, seo_description
     FROM blog_posts
     WHERE featured = 1
       AND (featured_until IS NULL OR featured_until > NOW())
       AND status = 'published'
     ORDER BY post_date DESC
     LIMIT ?`,
    [parseInt(limit, 10) || 5],
  );

  res.json({
    success: true,
    data: posts,
  });
}

/** Obter posts populares (por likes + views) */
export async function getPopularBlogs(req: AuthRequest, res: Response): Promise<void> {
  const { limit = '10', days = '30' } = req.query as Record<string, string | undefined>;

  const posts = await query<Record<string, unknown>>(
    `SELECT id, title, slug, excerpt, likes, views_count,
            (likes + (views_count / 100)) as popularity_score
     FROM blog_posts
     WHERE status = 'published'
       AND post_date > DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY popularity_score DESC
     LIMIT ?`,
    [parseInt(days, 10) || 30, parseInt(limit, 10) || 10],
  );

  res.json({
    success: true,
    data: posts,
  });
}
