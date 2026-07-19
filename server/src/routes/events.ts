import { Router } from 'express';
import { authenticate, optionalAuthenticate, professionalOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/eventsController';
import * as pub from '../controllers/eventPublicController';

const router = Router();

// ── Rotas públicas (sem auth) ─────────────────────────────────────────────────
router.get('/public/:id',        asyncHandler(pub.getPublicEvent));
router.post('/public/:id/rsvp',  asyncHandler(pub.submitRsvp));

// ── Listas de itens (autenticado) ─────────────────────────────────────────────
router.get('/item-lists',        authenticate, asyncHandler(pub.listItemLists));
router.post('/item-lists',       authenticate, asyncHandler(pub.createItemList));
router.put('/item-lists/:id',    authenticate, asyncHandler(pub.updateItemList));
router.delete('/item-lists/:id', authenticate, asyncHandler(pub.deleteItemList));

// ── Rotas autenticadas ────────────────────────────────────────────────────────
router.get('/',            optionalAuthenticate, asyncHandler(ctrl.listEvents));
router.get('/:id',         optionalAuthenticate, asyncHandler(ctrl.getEvent));
router.post('/',           authenticate, professionalOrAdmin, asyncHandler(ctrl.createEvent));
router.put('/:id',         authenticate, professionalOrAdmin, asyncHandler(ctrl.updateEvent));
router.delete('/:id',      authenticate, professionalOrAdmin, asyncHandler(ctrl.deleteEvent));
router.post('/:id/enroll', authenticate, asyncHandler(ctrl.enrollEvent));
router.get('/:id/rsvps',              authenticate, professionalOrAdmin, asyncHandler(pub.listRsvps));
router.patch('/:id/rsvps/:rsvpId',   authenticate, professionalOrAdmin, asyncHandler(pub.updateRsvpAttendance));
router.delete('/:id/rsvps/:rsvpId',  authenticate, professionalOrAdmin, asyncHandler(pub.deleteRsvp));
router.post('/:id/items',            authenticate, professionalOrAdmin, asyncHandler(pub.addEventItem));
router.delete('/:id/items/:itemId',  authenticate, professionalOrAdmin, asyncHandler(pub.deleteEventItem));

export default router;
