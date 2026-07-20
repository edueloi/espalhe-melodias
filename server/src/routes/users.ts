import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, requireRole, superAdminOnly } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/usersController';

const router = Router();

// Todos autenticados
router.get('/',          authenticate, requireRole('super-admin', 'professional'), asyncHandler(ctrl.listUsers));
router.get('/stats',     authenticate, superAdminOnly, asyncHandler(ctrl.getStats));
router.get('/:id',       authenticate, asyncHandler(ctrl.getUser));
router.put('/:id',       authenticate, asyncHandler(ctrl.updateUser));
router.post('/me/skip-onboarding', authenticate, asyncHandler(ctrl.skipOnboarding));

// Super-admin
router.post(
  '/',
  authenticate,
  superAdminOnly,
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['super-admin', 'professional', 'member']),
    body('whatsapp').optional().trim(),
    body('gender').optional().isIn(['masculino', 'feminino', 'nao_declarado']),
    body('specialty').optional().trim(),
  ],
  validate,
  asyncHandler(ctrl.createUser),
);

router.patch(
  '/:id/approval',
  authenticate,
  superAdminOnly,
  [body('status').isIn(['approved', 'rejected']).withMessage('Status inválido.')],
  validate,
  asyncHandler(ctrl.setApprovalStatus),
);

router.patch(
  '/:id/role',
  authenticate,
  superAdminOnly,
  [body('role').isIn(['super-admin', 'professional', 'member'])],
  validate,
  asyncHandler(ctrl.changeRole),
);

router.delete('/:id', authenticate, superAdminOnly, asyncHandler(ctrl.deleteUser));

export default router;
