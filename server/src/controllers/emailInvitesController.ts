import { Response } from 'express';
import crypto from 'crypto';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO } from '../utils/helpers';
import { sendEmail } from '../services/emailService';
import { EmailTemplates } from '../services/emailTemplates';
import { config } from '../config';
import type { AuthRequest } from '../middleware/auth';

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listEmailInvites(_req: AuthRequest, res: Response): Promise<void> {
  const rows = await query<Record<string, unknown>>(
    'SELECT * FROM email_invites ORDER BY created_at DESC',
  );
  res.json({ success: true, data: rows });
}

// ─── Create (gera token, salva e envia e-mail para a pessoa convidada) ────────

export async function createEmailInvite(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const { invitedName, invitedEmail, role = 'member', validityDays = 7 } = req.body as {
    invitedName?: string;
    invitedEmail?: string;
    role?: string;
    validityDays?: number;
  };

  if (!invitedName?.trim()) throw new AppError('Informe o nome da pessoa convidada.', 400);
  if (!invitedEmail?.trim()) throw new AppError('Informe o e-mail da pessoa convidada.', 400);
  if (!['super-admin', 'professional', 'member'].includes(role)) {
    throw new AppError('Role inválido.', 400);
  }

  const email = invitedEmail.trim().toLowerCase();
  const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) throw new AppError('Já existe uma conta cadastrada com este e-mail.', 409);

  const days = Math.max(1, Math.min(Number(validityDays) || 7, 90));
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  const expiresStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

  const token = crypto.randomBytes(24).toString('hex');
  const id = newId();
  const now = nowISO();

  const creator = await queryOne<{ name: string }>('SELECT name FROM users WHERE id = ?', [req.user.userId]);

  await execute(
    `INSERT INTO email_invites
     (id, token, invited_name, invited_email, role, status, expires_at, created_by_id, created_by_name, created_at, updated_at)
     VALUES (?,?,?,?,?,'pending',?,?,?,?,?)`,
    [id, token, invitedName.trim(), email, role, expiresStr, req.user.userId, creator?.name ?? 'Admin', now, now],
  );

  const inviteLink = `${config.appUrl}/convite/${token}`;
  const roleLabel = role === 'super-admin' ? 'Administrador(a)' : role === 'professional' ? 'Profissional' : 'Membro';

  try {
    const template = EmailTemplates.inviteEmail(invitedName.trim(), creator?.name ?? 'Espalhe Melodias', roleLabel, inviteLink, days);
    await sendEmail({ to: email, subject: template.subject, html: template.html, text: template.text });
  } catch (err) {
    console.error('[email-invites] Falha ao enviar e-mail de convite:', err);
  }

  const invite = await queryOne<Record<string, unknown>>('SELECT * FROM email_invites WHERE id = ?', [id]);
  res.status(201).json({ success: true, data: invite });
}

// ─── Revoke ───────────────────────────────────────────────────────────────────

export async function revokeEmailInvite(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const invite = await queryOne<{ id: string; status: string }>('SELECT id, status FROM email_invites WHERE id = ?', [id]);
  if (!invite) throw new AppError('Convite não encontrado.', 404);
  if (invite.status === 'used') throw new AppError('Este convite já foi utilizado.', 409);

  await execute('UPDATE email_invites SET status = ?, updated_at = ? WHERE id = ?', ['revoked', nowISO(), id]);
  res.json({ success: true, message: 'Convite revogado.' });
}

// ─── Resend ───────────────────────────────────────────────────────────────────

export async function resendEmailInvite(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const invite = await queryOne<{
    id: string; token: string; invited_name: string; invited_email: string;
    role: string; status: string; expires_at: string;
  }>('SELECT * FROM email_invites WHERE id = ?', [id]);
  if (!invite) throw new AppError('Convite não encontrado.', 404);
  if (invite.status === 'used') throw new AppError('Este convite já foi utilizado.', 409);

  // Renova validade por mais 7 dias
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  const expiresStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

  await execute(
    'UPDATE email_invites SET status = ?, expires_at = ?, updated_at = ? WHERE id = ?',
    ['pending', expiresStr, nowISO(), id],
  );

  const creator = await queryOne<{ name: string }>('SELECT name FROM users WHERE id = ?', [req.user.userId]);
  const inviteLink = `${config.appUrl}/convite/${invite.token}`;
  const roleLabel = invite.role === 'super-admin' ? 'Administrador(a)' : invite.role === 'professional' ? 'Profissional' : 'Membro';

  const template = EmailTemplates.inviteEmail(invite.invited_name, creator?.name ?? 'Espalhe Melodias', roleLabel, inviteLink, 7);
  await sendEmail({ to: invite.invited_email, subject: template.subject, html: template.html, text: template.text });

  res.json({ success: true, message: 'Convite reenviado.' });
}

// ─── Info pública (valida token sem auth) ────────────────────────────────────

export async function getEmailInviteInfo(req: AuthRequest, res: Response): Promise<void> {
  const { token } = req.params;

  const invite = await queryOne<{
    invited_name: string; invited_email: string; role: string; status: string; expires_at: string;
  }>('SELECT invited_name, invited_email, role, status, expires_at FROM email_invites WHERE token = ?', [token]);

  if (!invite) throw new AppError('Convite não encontrado.', 404);
  if (invite.status === 'used') throw new AppError('Este convite já foi utilizado.', 410);
  if (invite.status === 'revoked') throw new AppError('Este convite foi revogado.', 410);
  if (new Date(invite.expires_at) < new Date()) throw new AppError('Este convite expirou.', 410);

  res.json({
    success: true,
    data: {
      invitedName: invite.invited_name,
      invitedEmail: invite.invited_email,
      role: invite.role,
      expiresAt: invite.expires_at,
    },
  });
}

// ─── Use (cadastro via token do convite nominal) ─────────────────────────────

export async function useEmailInvite(req: AuthRequest, res: Response): Promise<void> {
  const { token } = req.params;

  const invite = await queryOne<{
    id: string; invited_email: string; role: string; status: string; expires_at: string;
  }>('SELECT * FROM email_invites WHERE token = ?', [token]);

  if (!invite) throw new AppError('Convite não encontrado.', 404);
  if (invite.status === 'used') throw new AppError('Este convite já foi utilizado.', 410);
  if (invite.status === 'revoked') throw new AppError('Este convite foi revogado.', 410);
  if (new Date(invite.expires_at) < new Date()) throw new AppError('Este convite expirou.', 410);

  const userId = req.user!.userId;

  await execute(
    'UPDATE email_invites SET status = ?, used_at = ?, used_by_id = ?, updated_at = ? WHERE id = ?',
    ['used', nowISO(), userId, nowISO(), invite.id],
  );

  await execute('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [invite.role, nowISO(), userId]);

  res.json({ success: true, data: { userId, role: invite.role } });
}
