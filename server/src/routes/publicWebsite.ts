/**
 * Rotas públicas do site (sem autenticação)
 */
import { Router } from 'express';
import * as publicWebsiteCtrl from '../controllers/publicWebsiteController';
import { authenticate } from '../middleware/auth';

const router = Router();

// ── Newsletter (públicas) ────────────────────────────────────────────────────

/** POST /api/newsletter/subscribe — inscrever */
router.post('/newsletter/subscribe', publicWebsiteCtrl.subscribeNewsletter);

/** POST /api/newsletter/unsubscribe — desinscrever */
router.post('/newsletter/unsubscribe', publicWebsiteCtrl.unsubscribeNewsletter);

/** GET /api/newsletter/count — total de inscritos */
router.get('/newsletter/count', publicWebsiteCtrl.getNewsletterCount);

// ── Contact (públicas) ──────────────────────────────────────────────────────

/** POST /api/contact — enviar mensagem */
router.post('/contact', publicWebsiteCtrl.createContactMessage);

/** GET /api/contact/messages — listar mensagens (admin only) */
router.get(
  '/contact/messages',
  authenticate,
  publicWebsiteCtrl.getContactMessages
);

/** PATCH /api/contact/:messageId — atualizar status (admin only) */
router.patch(
  '/contact/:messageId',
  authenticate,
  publicWebsiteCtrl.updateContactMessage
);

// ── Event Inscriptions (requer autenticação) ────────────────────────────────

/** POST /api/events/:eventId/subscribe — inscrever em evento */
router.post('/events/:eventId/subscribe', authenticate, publicWebsiteCtrl.subscribeToEvent);

/** DELETE /api/events/:eventId/subscribe — cancelar inscrição */
router.delete(
  '/events/:eventId/subscribe',
  authenticate,
  publicWebsiteCtrl.unsubscribeFromEvent
);

/** GET /api/events/:eventId/inscriptions — listar inscrições (admin) */
router.get(
  '/events/:eventId/inscriptions',
  authenticate,
  publicWebsiteCtrl.getEventInscriptions
);

// ── Website Stats (públicas) ────────────────────────────────────────────────

/** GET /api/website/stats — estatísticas públicas */
router.get('/website/stats', publicWebsiteCtrl.getWebsiteStats);

export default router;
