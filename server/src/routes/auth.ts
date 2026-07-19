import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/authController';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nome obrigatório.'),
    body('email').isEmail().withMessage('E-mail inválido.').toLowerCase(),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres.'),
  ],
  validate,
  asyncHandler(ctrl.register),
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('E-mail inválido.').toLowerCase(),
    body('password').notEmpty().withMessage('Senha obrigatória.'),
  ],
  validate,
  asyncHandler(ctrl.login),
);

router.post('/refresh', asyncHandler(ctrl.refreshToken));
router.post('/logout',  asyncHandler(ctrl.logout));

router.get( '/me',             authenticate, asyncHandler(ctrl.me));
router.post('/change-password', authenticate, asyncHandler(ctrl.changePassword));

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('E-mail inválido.').toLowerCase()],
  validate,
  asyncHandler(ctrl.forgotPassword),
);
router.post('/reset-password', asyncHandler(ctrl.resetPassword));

export default router;
