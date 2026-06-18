import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO } from '../utils/helpers';
import type { AuthRequest } from '../middleware/auth';

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order_rank: number;
  event_count: number;
  created_at: string;
}

/** Listar todas as categorias de eventos */
export async function listEventCategories(_req: AuthRequest, res: Response): Promise<void> {
  const categories = await query<EventCategory>(
    `SELECT * FROM event_categories ORDER BY order_rank ASC, name ASC`,
  );

  res.json({
    success: true,
    data: categories,
  });
}

/** Obter categoria por ID */
export async function getEventCategory(req: AuthRequest, res: Response): Promise<void> {
  const category = await queryOne<EventCategory>(
    'SELECT * FROM event_categories WHERE id = ?',
    [req.params.id],
  );

  if (!category) {
    throw new AppError('Categoria não encontrada.', 404);
  }

  res.json({
    success: true,
    data: category,
  });
}

/** Obter categoria por slug */
export async function getEventCategoryBySlug(req: AuthRequest, res: Response): Promise<void> {
  const { slug } = req.params;

  const category = await queryOne<EventCategory>(
    'SELECT * FROM event_categories WHERE slug = ?',
    [slug],
  );

  if (!category) {
    throw new AppError('Categoria não encontrada.', 404);
  }

  res.json({
    success: true,
    data: category,
  });
}

/** Criar nova categoria (admin only) */
export async function createEventCategory(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  if (req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado. Apenas admins podem criar categorias.', 403);
  }

  const {
    name,
    slug,
    description,
    icon,
    color,
    order_rank = 999,
  } = req.body as {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    order_rank?: number;
  };

  if (!name || !slug) {
    throw new AppError('Nome e slug são obrigatórios.', 400);
  }

  const id = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO event_categories
     (id, name, slug, description, icon, color, order_rank, event_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [id, name, slug, description ?? null, icon ?? null, color ?? null, order_rank, now],
  );

  res.status(201).json({
    success: true,
    data: { id, name, slug },
  });
}

/** Atualizar categoria (admin only) */
export async function updateEventCategory(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  if (req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  const { id } = req.params;
  const { name, slug, description, icon, color, order_rank } = req.body as Record<string, unknown>;

  const category = await queryOne<{ id: string }>(
    'SELECT id FROM event_categories WHERE id = ?',
    [id],
  );

  if (!category) {
    throw new AppError('Categoria não encontrada.', 404);
  }

  await execute(
    `UPDATE event_categories SET
       name = COALESCE(?, name),
       slug = COALESCE(?, slug),
       description = COALESCE(?, description),
       icon = COALESCE(?, icon),
       color = COALESCE(?, color),
       order_rank = COALESCE(?, order_rank)
     WHERE id = ?`,
    [name ?? null, slug ?? null, description ?? null, icon ?? null, color ?? null, order_rank ?? null, id],
  );

  res.json({
    success: true,
    message: 'Categoria atualizada.',
  });
}

/** Deletar categoria (admin only) */
export async function deleteEventCategory(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  if (req.user.role !== 'super-admin') {
    throw new AppError('Acesso negado.', 403);
  }

  const { id } = req.params;

  const category = await queryOne<{ id: string }>(
    'SELECT id FROM event_categories WHERE id = ?',
    [id],
  );

  if (!category) {
    throw new AppError('Categoria não encontrada.', 404);
  }

  // Verificar se há eventos associados
  const [countResult] = await query<{ count: number }>(
    'SELECT COUNT(*) as count FROM health_events WHERE category_id = ?',
    [id],
  );

  if (countResult?.count ?? 0 > 0) {
    throw new AppError('Não é possível deletar uma categoria com eventos associados.', 400);
  }

  await execute('DELETE FROM event_categories WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'Categoria deletada.',
  });
}
