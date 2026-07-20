import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, sanitizeUser } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';
import { DEFAULT_PREFERENCES } from '../types/domain';

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listUsers(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const { role, status, search } = req.query as Record<string, string | undefined>;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (role) { conditions.push('role = ?'); params.push(role); }
  if (status) { conditions.push('approval_status = ?'); params.push(status); }
  if (search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM users ${where}`, params,
  );
  const total = countRow?.total ?? 0;

  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  res.json({
    success: true,
    data: rows.map(sanitizeUser),
    meta: buildMeta(total, { page, limit, offset }),
  });
}

// ─── Get One ──────────────────────────────────────────────────────────────────

export async function getUser(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  // Membros só podem ver o próprio perfil
  if (req.user?.role === 'member' && req.user.userId !== id) {
    throw new AppError('Acesso negado.', 403);
  }

  const user = await queryOne<Record<string, unknown>>('SELECT * FROM users WHERE id = ?', [id]);
  if (!user) throw new AppError('Usuário não encontrado.', 404);

  res.json({ success: true, data: sanitizeUser(user) });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  // Membros só atualizam o próprio perfil
  if (req.user?.role === 'member' && req.user.userId !== id) {
    throw new AppError('Acesso negado.', 403);
  }

  const { name, avatar, specialty, crp, whatsapp, gender } = req.body as Record<string, string | undefined>;

  await execute(
    `UPDATE users SET
       name      = COALESCE(?, name),
       avatar    = COALESCE(?, avatar),
       specialty = COALESCE(?, specialty),
       crp       = COALESCE(?, crp),
       whatsapp  = COALESCE(?, whatsapp),
       gender    = COALESCE(?, gender),
       updated_at = ?
     WHERE id = ?`,
    [name ?? null, avatar ?? null, specialty ?? null, crp ?? null, whatsapp ?? null, gender ?? null, nowISO(), id],
  );

  const updated = await queryOne<Record<string, unknown>>('SELECT * FROM users WHERE id = ?', [id]);
  res.json({ success: true, data: sanitizeUser(updated ?? {}) });
}

// ─── Approve / Reject Membership ─────────────────────────────────────────────

export async function setApprovalStatus(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { status } = req.body as { status: 'approved' | 'rejected' };

  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Status inválido.', 400);
  }

  const user = await queryOne<{ id: string }>('SELECT id FROM users WHERE id = ?', [id]);
  if (!user) throw new AppError('Usuário não encontrado.', 404);

  await execute('UPDATE users SET approval_status = ?, updated_at = ? WHERE id = ?', [
    status, nowISO(), id,
  ]);

  res.json({ success: true, message: `Membro ${status === 'approved' ? 'aprovado' : 'rejeitado'}.` });
}

// ─── Change Role ──────────────────────────────────────────────────────────────

export async function changeRole(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { role } = req.body as { role: string };

  if (!['super-admin', 'professional', 'member'].includes(role)) {
    throw new AppError('Role inválido.', 400);
  }

  await execute('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [role, nowISO(), id]);
  res.json({ success: true, message: 'Role atualizado.' });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (req.user?.userId === id) throw new AppError('Você não pode excluir sua própria conta.', 400);

  const user = await queryOne<{ id: string }>('SELECT id FROM users WHERE id = ?', [id]);
  if (!user) throw new AppError('Usuário não encontrado.', 404);

  await execute('DELETE FROM users WHERE id = ?', [id]);
  res.json({ success: true, message: 'Usuário excluído.' });
}

// ─── Create (admin) ───────────────────────────────────────────────────────────

export async function createUser(req: AuthRequest, res: Response): Promise<void> {
  const { name, email, password, role = 'member', whatsapp, gender, specialty } = req.body as {
    name: string; email: string; password: string; role?: string;
    whatsapp?: string; gender?: string; specialty?: string;
  };

  const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) throw new AppError('E-mail já cadastrado.', 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const id = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO users (id, name, email, password_hash, role, specialty, whatsapp, gender, approval_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?)`,
    [id, name, email, passwordHash, role, specialty ?? null, whatsapp ?? null, gender ?? null, now, now],
  );

  // Preferências padrão
  const d = DEFAULT_PREFERENCES;
  await execute(
    `INSERT INTO user_preferences
     (id, user_id, theme, accent_color, font_size, layout_density, language, sidebar_collapsed,
      notif_forum_reply, notif_event_reminder, notif_help_update, notif_new_material, notif_push_enabled,
      dash_show_welcome, dash_show_quote, dash_show_stats, dash_default_view,
      filter_forum, filter_materials, filter_events, filter_directory,
      bookmarked_materials, bookmarked_topics, enrolled_events, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      newId(), id, d.theme, d.accentColor, d.fontSize, d.layoutDensity, d.language,
      0,1,1,1,0,0,1,1,1,'grid',
      JSON.stringify(d.filters.forum), JSON.stringify(d.filters.materials),
      JSON.stringify(d.filters.events), JSON.stringify(d.filters.directory),
      JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), now, now,
    ],
  );

  res.status(201).json({ success: true, data: { id, name, email, role, approvalStatus: 'approved' } });
}

// ─── Onboarding: pular ──────────────────────────────────────────────────────

export async function skipOnboarding(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  await execute(
    'UPDATE users SET onboarding_skipped = 1, updated_at = ? WHERE id = ?',
    [nowISO(), req.user.userId],
  );

  res.json({ success: true, message: 'Onboarding adiado.' });
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getStats(_req: AuthRequest, res: Response): Promise<void> {
  const [users] = await query<{ total: number; pending: number; approved: number }>(
    `SELECT
       COUNT(*) AS total,
       SUM(approval_status = 'pending')  AS pending,
       SUM(approval_status = 'approved') AS approved
     FROM users`,
  );

  const [roles] = await query<Record<string, number>>(
    `SELECT
       SUM(role = 'super-admin')  AS superAdmins,
       SUM(role = 'professional') AS professionals,
       SUM(role = 'member')       AS members
     FROM users`,
  );

  res.json({ success: true, data: { ...users, ...roles } });
}
