import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { queryOne, execute } from '../config/db';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, sanitizeUser } from '../utils/helpers';
import { ROLE_PERMISSIONS, DEFAULT_PREFERENCES } from '../types/domain';
import type { AuthRequest } from '../middleware/auth';

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role = 'member' } = req.body as {
    name: string; email: string; password: string; role?: string;
  };

  const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) throw new AppError('E-mail já cadastrado.', 409);

  const allowedRoles = ['member', 'professional'];
  const finalRole = allowedRoles.includes(role) ? role : 'member';

  const passwordHash = await bcrypt.hash(password, 12);
  const id = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO users (id, name, email, password_hash, role, approval_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, email, passwordHash, finalRole, 'pending', now, now],
  );

  // Cria preferências padrão
  const prefId = newId();
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
      prefId, id, d.theme, d.accentColor, d.fontSize, d.layoutDensity, d.language,
      d.sidebarCollapsed ? 1 : 0,
      d.notifications.emailNewForumReply ? 1 : 0,
      d.notifications.emailEventReminder ? 1 : 0,
      d.notifications.emailHelpUpdate ? 1 : 0,
      d.notifications.emailNewMaterial ? 1 : 0,
      d.notifications.pushEnabled ? 1 : 0,
      d.dashboard.showWelcomeBanner ? 1 : 0,
      d.dashboard.showQuoteOfDay ? 1 : 0,
      d.dashboard.showStatCards ? 1 : 0,
      d.dashboard.defaultView,
      JSON.stringify(d.filters.forum),
      JSON.stringify(d.filters.materials),
      JSON.stringify(d.filters.events),
      JSON.stringify(d.filters.directory),
      JSON.stringify([]), JSON.stringify([]), JSON.stringify([]),
      now, now,
    ],
  );

  res.status(201).json({
    success: true,
    message: 'Cadastro realizado! Aguarde a aprovação de um administrador.',
    data: { id, email, role: finalRole, approvalStatus: 'pending' },
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  const user = await queryOne<{
    id: string; name: string; email: string; password_hash: string;
    role: string; approval_status: string; avatar: string | null;
  }>(
    'SELECT id, name, email, password_hash, role, approval_status, avatar FROM users WHERE email = ?',
    [email],
  );

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError('E-mail ou senha incorretos.', 401);
  }

  if (user.approval_status === 'pending') {
    throw new AppError('Sua conta ainda não foi aprovada. Aguarde a aprovação do administrador.', 403);
  }
  if (user.approval_status === 'rejected') {
    throw new AppError('Seu cadastro foi rejeitado. Entre em contato com o suporte.', 403);
  }

  const payload = { userId: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await execute(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, tokenHash, expiresAt.toISOString().slice(0, 19).replace('T', ' ')],
  );

  await execute('UPDATE users SET last_login_at = ? WHERE id = ?', [nowISO(), user.id]);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        permissions: ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] ?? [],
      },
    },
  });
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken: rt } = req.body as { refreshToken: string };
  if (!rt) throw new AppError('Refresh token não informado.', 400);

  let payload: { userId: string; email: string; role: string };
  try {
    payload = jwt.verify(rt, config.jwt.refreshSecret) as typeof payload;
  } catch {
    throw new AppError('Refresh token inválido ou expirado.', 401);
  }

  const tokenHash = crypto.createHash('sha256').update(rt).digest('hex');
  const stored = await queryOne<{ id: number }>(
    'SELECT id FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW()',
    [tokenHash],
  );
  if (!stored) throw new AppError('Refresh token revogado.', 401);

  const newAccess = jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] },
  );

  res.json({ success: true, data: { accessToken: newAccess, expiresIn: config.jwt.expiresIn } });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken: rt } = req.body as { refreshToken?: string };
  if (rt) {
    const tokenHash = crypto.createHash('sha256').update(rt).digest('hex');
    await execute('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash]);
  }
  res.json({ success: true, message: 'Logout realizado.' });
}

// ─── Me ───────────────────────────────────────────────────────────────────────

export async function me(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const user = await queryOne<Record<string, unknown>>(
    'SELECT * FROM users WHERE id = ?',
    [req.user.userId],
  );
  if (!user) throw new AppError('Usuário não encontrado.', 404);

  res.json({
    success: true,
    data: {
      ...sanitizeUser(user),
      permissions: ROLE_PERMISSIONS[req.user.role] ?? [],
    },
  });
}

// ─── Change Password ──────────────────────────────────────────────────────────

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string; newPassword: string;
  };

  const user = await queryOne<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE id = ?',
    [req.user.userId],
  );
  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
    throw new AppError('Senha atual incorreta.', 400);
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await execute('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [
    hash, nowISO(), req.user.userId,
  ]);

  // Revoga todos os refresh tokens
  await execute('DELETE FROM refresh_tokens WHERE user_id = ?', [req.user.userId]);

  res.json({ success: true, message: 'Senha alterada com sucesso.' });
}
