import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, superAdminOnly } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/emailInvitesController';

const router = Router();

// Rotas de gerenciamento — apenas super-admin
router.get('/', authenticate, superAdminOnly, asyncHandler(ctrl.listEmailInvites));
router.post(
  '/',
  authenticate,
  superAdminOnly,
  [
    body('invitedName').trim().notEmpty().withMessage('Nome da pessoa convidada é obrigatório.'),
    body('invitedEmail').isEmail().withMessage('E-mail inválido.').toLowerCase(),
    body('role').optional().isIn(['super-admin', 'professional', 'member']),
    body('validityDays').optional().isInt({ min: 1, max: 90 }),
  ],
  validate,
  asyncHandler(ctrl.createEmailInvite),
);
router.patch('/:id/revoke', authenticate, superAdminOnly, asyncHandler(ctrl.revokeEmailInvite));
router.post('/:id/resend',  authenticate, superAdminOnly, asyncHandler(ctrl.resendEmailInvite));

// Rotas públicas (sem autenticação)
router.get('/info/:token', asyncHandler(ctrl.getEmailInviteInfo));
router.post('/use/:token', authenticate, asyncHandler(ctrl.useEmailInvite));

export default router;
