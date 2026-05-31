import { Response } from 'express';
import crypto from 'crypto';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO } from '../utils/helpers';
import type { AuthRequest } from '../middleware/auth';

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listLinks(_req: AuthRequest, res: Response): Promise<void> {
  const rows = await query<Record<string, unknown>>(
    'SELECT * FROM invite_links ORDER BY created_at DESC',
  );
  res.json({ success: true, data: rows.map(normalizeLink) });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createLink(req: AuthRequest, res: Response): Promise<void> {
  const { label = 'Link de convite', validityDays = 7, role = 'member', maxUses } = req.body as {
    label?: string;
    validityDays?: number;
    role?: string;
    maxUses?: number | null;
  };

  if (!['super-admin', 'professional', 'member'].includes(role)) {
    throw new AppError('Role inválido.', 400);
  }

  const days = Math.max(1, Math.min(Number(validityDays) || 7, 365));
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const token = crypto.randomBytes(24).toString('hex');
  const id    = newId();
  const now   = nowISO();
  const expiresStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

  const creator = await queryOne<{ name: string }>('SELECT name FROM users WHERE id = ?', [req.user!.userId]);

  await execute(
    `INSERT INTO invite_links (id, token, label, role, max_uses, uses_count, is_active, expires_at, created_by_id, created_by_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?, ?, ?, ?)`,
    [id, token, label.trim(), role, maxUses ?? null, expiresStr, req.user!.userId, creator?.name ?? 'Admin', now, now],
  );

  const link = await queryOne<Record<string, unknown>>('SELECT * FROM invite_links WHERE id = ?', [id]);
  res.status(201).json({ success: true, data: normalizeLink(link ?? {}) });
}

// ─── Reactivate ───────────────────────────────────────────────────────────────

export async function reactivateLink(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const link = await queryOne<{ id: string }>('SELECT id FROM invite_links WHERE id = ?', [id]);
  if (!link) throw new AppError('Link não encontrado.', 404);

  // Estende por mais 7 dias a partir de agora
  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 7);
  const expiresStr = newExpiry.toISOString().slice(0, 19).replace('T', ' ');

  await execute(
    'UPDATE invite_links SET is_active = 1, expires_at = ?, updated_at = ? WHERE id = ?',
    [expiresStr, nowISO(), id],
  );

  res.json({ success: true, message: 'Link reativado por mais 7 dias.' });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteLink(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const link = await queryOne<{ id: string }>('SELECT id FROM invite_links WHERE id = ?', [id]);
  if (!link) throw new AppError('Link não encontrado.', 404);

  await execute('DELETE FROM invite_links WHERE id = ?', [id]);
  res.json({ success: true, message: 'Link removido.' });
}

// ─── Get Uses ─────────────────────────────────────────────────────────────────

export async function getLinkUses(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const link = await queryOne<{ id: string }>('SELECT id FROM invite_links WHERE id = ?', [id]);
  if (!link) throw new AppError('Link não encontrado.', 404);

  const uses = await query<Record<string, unknown>>(
    'SELECT * FROM invite_link_uses WHERE link_id = ? ORDER BY used_at DESC',
    [id],
  );
  res.json({ success: true, data: uses });
}

// ─── Info pública (valida token sem auth) ────────────────────────────────────

export async function getLinkInfo(req: AuthRequest, res: Response): Promise<void> {
  const { token } = req.params;

  const link = await queryOne<{
    label: string; role: string; max_uses: number | null;
    uses_count: number; is_active: number; expires_at: string;
  }>('SELECT label, role, max_uses, uses_count, is_active, expires_at FROM invite_links WHERE token = ?', [token]);

  if (!link) throw new AppError('Link não encontrado.', 404);
  if (!link.is_active) throw new AppError('Este link foi desativado.', 410);
  if (new Date(link.expires_at) < new Date()) throw new AppError('Este link expirou.', 410);
  if (link.max_uses !== null && link.uses_count >= link.max_uses) {
    throw new AppError('Este link atingiu o limite de inscrições.', 410);
  }

  res.json({ success: true, data: { label: link.label, role: link.role, expiresAt: link.expires_at } });
}

// ─── Use (cadastro via token público) ────────────────────────────────────────

export async function useLink(req: AuthRequest, res: Response): Promise<void> {
  const { token } = req.params;

  const link = await queryOne<{
    id: string; role: string; max_uses: number | null;
    uses_count: number; is_active: number; expires_at: string;
  }>('SELECT * FROM invite_links WHERE token = ?', [token]);

  if (!link) throw new AppError('Link inválido ou não encontrado.', 404);
  if (!link.is_active) throw new AppError('Este link foi desativado.', 410);
  if (new Date(link.expires_at) < new Date()) throw new AppError('Este link expirou.', 410);
  if (link.max_uses !== null && link.uses_count >= link.max_uses) {
    throw new AppError('Este link atingiu o limite de inscrições.', 410);
  }

  const userId = req.user!.userId;

  // Verifica se já usou
  const already = await queryOne('SELECT id FROM invite_link_uses WHERE link_id = ? AND user_id = ?', [link.id, userId]);
  if (already) throw new AppError('Você já utilizou este link.', 409);

  const userRow = await queryOne<{ name: string; email: string }>('SELECT name, email FROM users WHERE id = ?', [userId]);
  const now = nowISO();

  // Registra uso
  await execute(
    'INSERT INTO invite_link_uses (id, link_id, user_id, user_name, user_email, used_at) VALUES (?, ?, ?, ?, ?, ?)',
    [newId(), link.id, userId, userRow?.name ?? '', userRow?.email ?? '', now],
  );

  // Incrementa contador
  await execute('UPDATE invite_links SET uses_count = uses_count + 1, updated_at = ? WHERE id = ?', [now, link.id]);

  // Aplica role se for upgrade
  await execute('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [link.role, now, userId]);

  res.json({ success: true, data: { userId, role: link.role } });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function normalizeLink(row: Record<string, unknown>) {
  return {
    ...row,
    is_active: Boolean(row.is_active),
    max_uses: row.max_uses ?? null,
  };
}
