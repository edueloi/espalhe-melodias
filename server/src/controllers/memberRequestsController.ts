import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';
import { DEFAULT_PREFERENCES } from '../types/domain';
import { sendEmail } from '../services/emailService';
import { EmailTemplates } from '../services/emailTemplates';
import { config } from '../config';

// ─── Create (público) ─────────────────────────────────────────────────────────

export async function createMemberRequest(req: Request, res: Response): Promise<void> {
  const { name, email, phone, specialty, gender, observation } = req.body as {
    name: string;
    email: string;
    phone?: string;
    specialty?: string;
    gender?: string;
    observation?: string;
  };

  if (!name?.trim()) throw new AppError('Nome é obrigatório.', 400);
  if (!email?.trim()) throw new AppError('E-mail é obrigatório.', 400);

  // Verifica duplicidade em member_requests
  const existingRequest = await queryOne<{ id: string }>(
    'SELECT id FROM member_requests WHERE email = ?',
    [email.toLowerCase().trim()],
  );
  if (existingRequest) throw new AppError('Já existe uma solicitação com este e-mail.', 409);

  // Verifica duplicidade em users
  const existingUser = await queryOne<{ id: string }>(
    'SELECT id FROM users WHERE email = ?',
    [email.toLowerCase().trim()],
  );
  if (existingUser) throw new AppError('Este e-mail já possui uma conta ativa.', 409);

  const id = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO member_requests (id, name, email, phone, specialty, gender, observation, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [
      id,
      name.trim(),
      email.toLowerCase().trim(),
      phone?.trim() || null,
      specialty?.trim() || null,
      gender || null,
      observation?.trim() || null,
      now,
      now,
    ],
  );

  res.status(201).json({ success: true, data: { id } });

  const adminEmail = config.contact.adminEmails;
  if (adminEmail) {
    const { subject, html, text } = EmailTemplates.memberRequestAdminNotification(
      name.trim(),
      email.toLowerCase().trim(),
      phone?.trim() || null,
      specialty?.trim() || null,
      observation?.trim() || null,
    );
    sendEmail({ to: adminEmail, subject, html, text }).catch(err =>
      console.error('[member-requests] Falha ao notificar admin por e-mail:', err),
    );
  }
}

// ─── List (superAdminOnly) ────────────────────────────────────────────────────

export async function listMemberRequests(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const { status, search } = req.query as Record<string, string | undefined>;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM member_requests ${where}`,
    params,
  );
  const total = countRow?.total ?? 0;

  const rows = await query<Record<string, unknown>>(
    `SELECT id, name, email, phone, specialty, gender, observation, status, created_at, updated_at
     FROM member_requests ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  res.json({
    success: true,
    data: rows,
    meta: buildMeta(total, { page, limit, offset }),
  });
}

// ─── Approve (superAdminOnly) ─────────────────────────────────────────────────

export async function approveMemberRequest(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const mr = await queryOne<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    specialty: string | null;
    gender: string | null;
    status: string;
  }>('SELECT * FROM member_requests WHERE id = ?', [id]);

  if (!mr) throw new AppError('Solicitação não encontrada.', 404);
  if (mr.status !== 'pending') throw new AppError('Esta solicitação já foi processada.', 409);

  // Verifica se o e-mail já existe em users
  const existingUser = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = ?', [mr.email]);
  if (existingUser) throw new AppError('Este e-mail já possui uma conta ativa.', 409);

  const DEFAULT_PASSWORD = 'Melodias@2025';
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const userId = newId();
  const now = nowISO();

  // Cria o usuário
  await execute(
    `INSERT INTO users (id, name, email, password_hash, role, specialty, whatsapp, gender, approval_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'member', ?, ?, ?, 'approved', ?, ?)`,
    [userId, mr.name, mr.email, passwordHash, mr.specialty ?? null, mr.phone ?? null, mr.gender ?? null, now, now],
  );

  // Cria preferências padrão
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
      newId(), userId, d.theme, d.accentColor, d.fontSize, d.layoutDensity, d.language,
      0, 1, 1, 1, 0, 0, 1, 1, 1, 'grid',
      JSON.stringify(d.filters.forum), JSON.stringify(d.filters.materials),
      JSON.stringify(d.filters.events), JSON.stringify(d.filters.directory),
      JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), now, now,
    ],
  );

  // Marca solicitação como approved
  await execute(
    'UPDATE member_requests SET status = ?, updated_at = ? WHERE id = ?',
    ['approved', now, id],
  );

  res.json({ success: true, message: 'Membro aprovado com sucesso.' });
}

// ─── Reject (superAdminOnly) ──────────────────────────────────────────────────

export async function rejectMemberRequest(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const mr = await queryOne<{ id: string; status: string }>('SELECT id, status FROM member_requests WHERE id = ?', [id]);
  if (!mr) throw new AppError('Solicitação não encontrada.', 404);
  if (mr.status !== 'pending') throw new AppError('Esta solicitação já foi processada.', 409);

  await execute(
    'UPDATE member_requests SET status = ?, updated_at = ? WHERE id = ?',
    ['rejected', nowISO(), id],
  );

  res.json({ success: true, message: 'Solicitação rejeitada.' });
}

// ─── Delete (superAdminOnly) ──────────────────────────────────────────────────

export async function deleteMemberRequest(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const mr = await queryOne<{ id: string }>('SELECT id FROM member_requests WHERE id = ?', [id]);
  if (!mr) throw new AppError('Solicitação não encontrada.', 404);

  await execute('DELETE FROM member_requests WHERE id = ?', [id]);

  res.json({ success: true, message: 'Solicitação excluída.' });
}
