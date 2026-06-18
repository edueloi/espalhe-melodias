import { Router } from 'express';
import { authenticate, professionalOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/eventsControllerEnhanced';
import * as catCtrl from '../controllers/eventCategoriesController';
import * as pub from '../controllers/eventPublicController';

const router = Router();

// ─── Public Events (sem auth) ──────────────────────────────────────────────────
router.get('/public/:id', asyncHandler(pub.getPublicEvent));
router.post('/public/:id/rsvp', asyncHandler(pub.submitRsvp));

// ─── Event Item Lists (autenticado) ───────────────────────────────────────────
router.get('/item-lists', authenticate, asyncHandler(pub.listItemLists));
router.post('/item-lists', authenticate, asyncHandler(pub.createItemList));
router.put('/item-lists/:id', authenticate, asyncHandler(pub.updateItemList));
router.delete('/item-lists/:id', authenticate, asyncHandler(pub.deleteItemList));

// ─── Events ───────────────────────────────────────────────────────────────────

/** GET /api/events — Listar eventos (paginado, com filtros) */
router.get('/', authenticate, asyncHandler(ctrl.listEvents));

/** GET /api/events/upcoming — Eventos próximos */
router.get('/upcoming', authenticate, asyncHandler(ctrl.getUpcomingEvents));

/** GET /api/events/popular — Eventos mais populares */
router.get('/popular', authenticate, asyncHandler(ctrl.getPopularEvents));

/** GET /api/events/slug/:slug — Obter evento por slug */
router.get('/slug/:slug', authenticate, asyncHandler(ctrl.getEventBySlug));

/** GET /api/events/:id — Obter evento por ID */
router.get('/:id', authenticate, asyncHandler(ctrl.getEvent));

/** POST /api/events — Criar novo evento (admin/professional) */
router.post('/', authenticate, professionalOrAdmin, asyncHandler(ctrl.createEvent));

/** PUT /api/events/:id — Atualizar evento (owner ou admin) */
router.put('/:id', authenticate, professionalOrAdmin, asyncHandler(ctrl.updateEvent));

/** DELETE /api/events/:id — Deletar evento (owner ou admin) */
router.delete('/:id', authenticate, professionalOrAdmin, asyncHandler(ctrl.deleteEvent));

/** POST /api/events/:id/enroll — Inscrever/Desinscrever */
router.post('/:id/enroll', authenticate, asyncHandler(ctrl.enrollEvent));

/** GET /api/events/:id/rsvps — Listar RSVPs (admin) */
router.get('/:id/rsvps', authenticate, professionalOrAdmin, asyncHandler(pub.listRsvps));

/** PATCH /api/events/:id/rsvps/:rsvpId — Atualizar RSVP (admin) */
router.patch('/:id/rsvps/:rsvpId', authenticate, professionalOrAdmin, asyncHandler(pub.updateRsvpAttendance));

/** DELETE /api/events/:id/rsvps/:rsvpId — Deletar RSVP (admin) */
router.delete('/:id/rsvps/:rsvpId', authenticate, professionalOrAdmin, asyncHandler(pub.deleteRsvp));

// ─── Event Categories ─────────────────────────────────────────────────────────

/** GET /api/events/categories — Listar categorias */
router.get('/categories', authenticate, asyncHandler(catCtrl.listEventCategories));

/** GET /api/events/categories/:id — Obter categoria por ID */
router.get('/categories/:id', authenticate, asyncHandler(catCtrl.getEventCategory));

/** GET /api/events/categories/slug/:slug — Obter categoria por slug */
router.get('/categories/slug/:slug', authenticate, asyncHandler(catCtrl.getEventCategoryBySlug));

/** POST /api/events/categories — Criar categoria (admin) */
router.post(
  '/categories',
  authenticate,
  professionalOrAdmin,
  asyncHandler(catCtrl.createEventCategory),
);

/** PUT /api/events/categories/:id — Atualizar categoria (admin) */
router.put('/categories/:id', authenticate, professionalOrAdmin, asyncHandler(catCtrl.updateEventCategory));

/** DELETE /api/events/categories/:id — Deletar categoria (admin) */
router.delete(
  '/categories/:id',
  authenticate,
  professionalOrAdmin,
  asyncHandler(catCtrl.deleteEventCategory),
);

export default router;
