import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, superAdminOnly } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/inviteLinksController';

const router = Router();

// Rotas de gerenciamento — apenas super-admin
router.get('/',                  authenticate, superAdminOnly, asyncHandler(ctrl.listLinks));
router.post(
  '/',
  authenticate,
  superAdminOnly,
  [
    body('label').optional().trim(),
    body('validityDays').optional().isInt({ min: 1, max: 365 }),
    body('role').optional().isIn(['super-admin', 'professional', 'member']),
    body('maxUses').optional({ nullable: true }).isInt({ min: 1 }),
  ],
  validate,
  asyncHandler(ctrl.createLink),
);
router.patch('/:id/reactivate', authenticate, superAdminOnly, asyncHandler(ctrl.reactivateLink));
router.delete('/:id',           authenticate, superAdminOnly, asyncHandler(ctrl.deleteLink));
router.get('/:id/uses',         authenticate, superAdminOnly, asyncHandler(ctrl.getLinkUses));

// Rotas públicas (sem autenticação)
router.get('/info/:token',  asyncHandler(ctrl.getLinkInfo));
router.post('/use/:token', authenticate, asyncHandler(ctrl.useLink));

export default router;
