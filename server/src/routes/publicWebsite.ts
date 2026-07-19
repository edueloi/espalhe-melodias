import { Router } from 'express';
import * as publicWebsiteCtrl from '../controllers/publicWebsiteController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/newsletter/subscribe', publicWebsiteCtrl.subscribeNewsletter);
router.post('/newsletters/subscribe', publicWebsiteCtrl.subscribeNewsletter);

router.post('/newsletter/unsubscribe', publicWebsiteCtrl.unsubscribeNewsletter);
router.post('/newsletters/unsubscribe', publicWebsiteCtrl.unsubscribeNewsletter);

router.get('/newsletter/count', publicWebsiteCtrl.getNewsletterCount);
router.get('/newsletters/stats', publicWebsiteCtrl.getNewsletterCount);

router.post('/contact', publicWebsiteCtrl.createContactMessage);
router.get('/contact', authenticate, publicWebsiteCtrl.getContactMessages);
router.get('/contact/messages', authenticate, publicWebsiteCtrl.getContactMessages);
router.get('/contact/:messageId', authenticate, publicWebsiteCtrl.getMessage);
router.patch('/contact/:messageId', authenticate, publicWebsiteCtrl.updateContactMessage);

router.post('/events/:eventId/subscribe', authenticate, publicWebsiteCtrl.subscribeToEvent);
router.delete('/events/:eventId/subscribe', authenticate, publicWebsiteCtrl.unsubscribeFromEvent);
router.get('/events/:eventId/inscriptions', authenticate, publicWebsiteCtrl.getEventInscriptions);

router.get('/website/stats', publicWebsiteCtrl.getWebsiteStats);

export default router;
