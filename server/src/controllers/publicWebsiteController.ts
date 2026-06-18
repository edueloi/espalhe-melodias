/**
 * Controller para endpoints públicos do site
 */
import type { Request, Response } from 'express';
import { query, execute, queryOne } from '@/config/db';
import type {
  NewsletterSubscriber,
  ContactMessage,
  EventInscription,
  PublicWebsiteStats,
} from '@/models/publicWebsite';
import { validateEmail, validatePhone } from '@/utils/validators';
import crypto from 'crypto';

// ── Newsletter ──────────────────────────────────────────────────────────────

/**
 * POST /api/newsletter/subscribe
 * Email validation, duplicate check
 */
export async function subscribeNewsletter(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    // Validação
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email é obrigatório' });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ error: 'Email inválido' });
      return;
    }

    // Verificar duplicata
    const existing = await queryOne<NewsletterSubscriber>(
      'SELECT id FROM newsletter_subscribers WHERE LOWER(email) = LOWER(?) AND isActive = true',
      [email]
    );

    if (existing) {
      res.status(409).json({ error: 'Este email já está inscrito' });
      return;
    }

    // Inserir
    const now = new Date().toISOString();
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    await execute(
      'INSERT INTO newsletter_subscribers (email, dateSubscribed, isActive, unsubscribeToken, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [email, now, true, unsubscribeToken, now, now]
    );

    res.status(201).json({ success: true, message: 'Inscrito com sucesso' });
  } catch (err) {
    console.error('[Newsletter Subscribe]', err);
    res.status(500).json({ error: 'Erro ao inscrever-se' });
  }
}

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe com token
 */
export async function unsubscribeNewsletter(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Token obrigatório' });
      return;
    }

    const result = await execute(
      'UPDATE newsletter_subscribers SET isActive = false, updatedAt = ? WHERE unsubscribeToken = ?',
      [new Date().toISOString(), token]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Token inválido ou expirado' });
      return;
    }

    res.status(200).json({ success: true, message: 'Desinscrição realizada' });
  } catch (err) {
    console.error('[Newsletter Unsubscribe]', err);
    res.status(500).json({ error: 'Erro ao desinscrever' });
  }
}

/**
 * GET /api/newsletter/count
 * Total de inscritos ativos
 */
export async function getNewsletterCount(req: Request, res: Response): Promise<void> {
  try {
    const result = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM newsletter_subscribers WHERE isActive = true'
    );

    res.status(200).json({ count: result?.count ?? 0 });
  } catch (err) {
    console.error('[Newsletter Count]', err);
    res.status(500).json({ error: 'Erro ao contar inscritos' });
  }
}

// ── Contact Messages ───────────────────────────────────────────────────────

/**
 * POST /api/contact
 * Enviar mensagem de contato
 */
export async function createContactMessage(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, phone, message } = req.body;

    // Validações
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Nome é obrigatório' });
      return;
    }

    if (!email || !validateEmail(email)) {
      res.status(400).json({ error: 'Email inválido' });
      return;
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      res.status(400).json({ error: 'Mensagem deve ter pelo menos 10 caracteres' });
      return;
    }

    if (phone && !validatePhone(phone)) {
      res.status(400).json({ error: 'Telefone inválido' });
      return;
    }

    // Inserir
    const now = new Date().toISOString();
    const result = await execute(
      'INSERT INTO contact_messages (name, email, phone, message, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), email, phone || null, message.trim(), 'new', now, now]
    );

    res.status(201).json({ success: true, messageId: result.insertId });
  } catch (err) {
    console.error('[Contact Create]', err);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
}

/**
 * GET /api/contact/messages
 * Listar mensagens (admin only, com paginação)
 */
export async function getContactMessages(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as string | undefined;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM contact_messages';
    const params: any[] = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const messages = await query<ContactMessage>(sql, params);

    // Total count
    let countSql = 'SELECT COUNT(*) as count FROM contact_messages';
    const countParams: any[] = [];
    if (status) {
      countSql += ' WHERE status = ?';
      countParams.push(status);
    }
    const countResult = await queryOne<{ count: number }>(countSql, countParams);
    const total = countResult?.count ?? 0;

    res.status(200).json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[Contact Get]', err);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
}

/**
 * PATCH /api/contact/:messageId
 * Atualizar status da mensagem (admin)
 */
export async function updateContactMessage(req: Request, res: Response): Promise<void> {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'read', 'replied', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }

    const result = await execute(
      'UPDATE contact_messages SET status = ?, updatedAt = ? WHERE id = ?',
      [status, new Date().toISOString(), messageId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Mensagem não encontrada' });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Contact Update]', err);
    res.status(500).json({ error: 'Erro ao atualizar mensagem' });
  }
}

// ── Event Inscriptions ─────────────────────────────────────────────────────

/**
 * POST /api/events/:eventId/subscribe
 * Inscrever em evento (requer autenticação)
 */
export async function subscribeToEvent(req: Request, res: Response): Promise<void> {
  try {
    const { eventId } = req.params;
    const userId = (req as any).userId; // Vem do middleware auth

    if (!userId) {
      res.status(401).json({ error: 'Autenticação obrigatória' });
      return;
    }

    // Verificar se evento existe
    const event = await queryOne('SELECT id FROM health_events WHERE id = ?', [eventId]);
    if (!event) {
      res.status(404).json({ error: 'Evento não encontrado' });
      return;
    }

    // Verificar duplicata
    const existing = await queryOne<EventInscription>(
      'SELECT id FROM event_inscriptions WHERE userId = ? AND eventId = ? AND status != ?',
      [userId, eventId, 'cancelled']
    );

    if (existing) {
      res.status(409).json({ error: 'Você já está inscrito neste evento' });
      return;
    }

    // Inserir
    const now = new Date().toISOString();
    const result = await execute(
      'INSERT INTO event_inscriptions (userId, eventId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      [userId, eventId, 'registered', now, now]
    );

    res.status(201).json({ success: true, inscriptionId: result.insertId });
  } catch (err) {
    console.error('[Event Subscribe]', err);
    res.status(500).json({ error: 'Erro ao inscrever-se no evento' });
  }
}

/**
 * DELETE /api/events/:eventId/subscribe
 * Cancelar inscrição em evento
 */
export async function unsubscribeFromEvent(req: Request, res: Response): Promise<void> {
  try {
    const { eventId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ error: 'Autenticação obrigatória' });
      return;
    }

    const result = await execute(
      'UPDATE event_inscriptions SET status = ?, updatedAt = ? WHERE userId = ? AND eventId = ?',
      ['cancelled', new Date().toISOString(), userId, eventId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Inscrição não encontrada' });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Event Unsubscribe]', err);
    res.status(500).json({ error: 'Erro ao cancelar inscrição' });
  }
}

/**
 * GET /api/events/:eventId/inscriptions
 * Listar inscrições de um evento (admin)
 */
export async function getEventInscriptions(req: Request, res: Response): Promise<void> {
  try {
    const { eventId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const offset = (page - 1) * limit;

    const inscriptions = await query<EventInscription>(
      'SELECT ei.*, u.name, u.email FROM event_inscriptions ei JOIN app_users u ON ei.userId = u.id WHERE ei.eventId = ? AND ei.status != ? ORDER BY ei.createdAt DESC LIMIT ? OFFSET ?',
      [eventId, 'cancelled', limit, offset]
    );

    const countResult = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM event_inscriptions WHERE eventId = ? AND status != ?',
      [eventId, 'cancelled']
    );

    res.status(200).json({
      inscriptions,
      pagination: {
        page,
        limit,
        total: countResult?.count ?? 0,
        pages: Math.ceil((countResult?.count ?? 0) / limit),
      },
    });
  } catch (err) {
    console.error('[Event Inscriptions Get]', err);
    res.status(500).json({ error: 'Erro ao buscar inscrições' });
  }
}

// ── Website Stats ──────────────────────────────────────────────────────────

/**
 * GET /api/website/stats
 * Estatísticas públicas do site
 */
export async function getWebsiteStats(req: Request, res: Response): Promise<void> {
  try {
    const subscribers = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM newsletter_subscribers WHERE isActive = true'
    );

    const messages = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM contact_messages'
    );

    const newMessages = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM contact_messages WHERE status = ?',
      ['new']
    );

    const inscriptions = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM event_inscriptions WHERE status != ?',
      ['cancelled']
    );

    const stats: PublicWebsiteStats = {
      totalSubscribers: subscribers?.count ?? 0,
      totalMessages: messages?.count ?? 0,
      totalInscriptions: inscriptions?.count ?? 0,
      newMessagesCount: newMessages?.count ?? 0,
    };

    res.status(200).json(stats);
  } catch (err) {
    console.error('[Website Stats]', err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
}
