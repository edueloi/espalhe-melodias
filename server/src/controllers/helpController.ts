import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';

export async function listRequests(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { page, limit, offset } = getPagination(req);
  const { status, urgency } = req.query as Record<string, string | undefined>;

  const conditions: string[] = [];
  const params: unknown[] = [];

  // Membros só veem as próprias solicitações
  if (req.user.role === 'member') {
    conditions.push('patient_id = ?');
    params.push(req.user.userId);
  }

  if (status) { conditions.push('status = ?'); params.push(status); }
  if (urgency) { conditions.push('urgency = ?'); params.push(urgency); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM help_requests ${where}`, params,
  );

  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM help_requests ${where}
     ORDER BY FIELD(urgency,'urgente','alta','media','baixa'), created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  res.json({ success: true, data: rows, meta: buildMeta(countRow?.total ?? 0, { page, limit, offset }) });
}

export async function getRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const row = await queryOne<Record<string, unknown>>(
    'SELECT * FROM help_requests WHERE id = ?', [id],
  );
  if (!row) throw new AppError('Solicitação não encontrada.', 404);

  if (req.user.role === 'member' && row.patient_id !== req.user.userId) {
    throw new AppError('Acesso negado.', 403);
  }

  res.json({ success: true, data: row });
}

export async function createRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { urgency, description } = req.body as { urgency: string; description: string };

  const user = await queryOne<{ name: string; email: string }>(
    'SELECT name, email FROM users WHERE id = ?', [req.user.userId],
  );
  if (!user) throw new AppError('Usuário não encontrado.', 404);

  const id = newId();
  const now = nowISO();

  await execute(
    `INSERT INTO help_requests
     (id, patient_id, patient_name, patient_email, urgency, description, status, created_at, updated_at)
     VALUES (?,?,?,?,?,?,'Aberto',?,?)`,
    [id, req.user.userId, user.name, user.email, urgency, description, now, now],
  );

  res.status(201).json({ success: true, data: { id, urgency, status: 'Aberto' } });
}

export async function updateRequest(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { id } = req.params;

  const row = await queryOne<{ patient_id: string }>(
    'SELECT patient_id FROM help_requests WHERE id = ?', [id],
  );
  if (!row) throw new AppError('Solicitação não encontrada.', 404);

  if (req.user.role === 'member' && row.patient_id !== req.user.userId) {
    throw new AppError('Acesso negado.', 403);
  }

  const { status, assignedProfessionalId, assignedProfessional, notes, urgency } =
    req.body as Record<string, unknown>;

  await execute(
    `UPDATE help_requests SET
       status                    = COALESCE(?, status),
       urgency                   = COALESCE(?, urgency),
       assigned_professional_id  = COALESCE(?, assigned_professional_id),
       assigned_professional     = COALESCE(?, assigned_professional),
       notes                     = COALESCE(?, notes),
       updated_at                = ?
     WHERE id = ?`,
    [
      status ?? null, urgency ?? null,
      assignedProfessionalId ?? null, assignedProfessional ?? null,
      notes ?? null, nowISO(), id,
    ],
  );

  res.json({ success: true, message: 'Solicitação atualizada.' });
}

export async function getStats(_req: AuthRequest, res: Response): Promise<void> {
  const [stats] = await query<Record<string, number>>(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'Aberto')          AS open,
       SUM(status = 'Em Atendimento')  AS inProgress,
       SUM(status = 'Concluído')       AS done,
       SUM(urgency = 'urgente')        AS urgent
     FROM help_requests`,
  );
  res.json({ success: true, data: stats });
}
