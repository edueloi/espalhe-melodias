import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, superAdminOnly } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/memberRequestsController';

const router = Router();

// ─── Público: criar solicitação ───────────────────────────────────────────────
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório.'),
    body('email').isEmail().withMessage('E-mail inválido.').normalizeEmail({ gmail_remove_dots: false }),
    body('phone').optional({ nullable: true }).trim(),
    body('specialty').optional({ nullable: true }).trim(),
    body('gender').optional({ nullable: true }).isIn(['masculino', 'feminino', 'nao_declarado']),
    body('observation').optional({ nullable: true }).trim(),
  ],
  validate,
  asyncHandler(ctrl.createMemberRequest),
);

// ─── Admin: listar ────────────────────────────────────────────────────────────
router.get('/', authenticate, superAdminOnly, asyncHandler(ctrl.listMemberRequests));

// ─── Admin: aprovar ───────────────────────────────────────────────────────────
router.patch('/:id/approve', authenticate, superAdminOnly, asyncHandler(ctrl.approveMemberRequest));

// ─── Admin: rejeitar ──────────────────────────────────────────────────────────
router.patch('/:id/reject', authenticate, superAdminOnly, asyncHandler(ctrl.rejectMemberRequest));

// ─── Admin: deletar ───────────────────────────────────────────────────────────
router.delete('/:id', authenticate, superAdminOnly, asyncHandler(ctrl.deleteMemberRequest));

export default router;
