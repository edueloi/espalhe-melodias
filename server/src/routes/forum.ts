import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/forumController';

const router = Router();

router.get('/',                    authenticate, asyncHandler(ctrl.listTopics));
router.get('/:id',                 authenticate, asyncHandler(ctrl.getTopic));

router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Título obrigatório.'),
    body('category').notEmpty().withMessage('Categoria obrigatória.'),
    body('content').trim().notEmpty().withMessage('Conteúdo obrigatório.'),
  ],
  validate,
  asyncHandler(ctrl.createTopic),
);

router.put('/:id',                 authenticate, asyncHandler(ctrl.updateTopic));
router.delete('/:id',              authenticate, asyncHandler(ctrl.deleteTopic));
router.post('/:id/like',           authenticate, asyncHandler(ctrl.likeTopic));

router.post(
  '/:id/replies',
  authenticate,
  [body('content').trim().notEmpty().withMessage('Conteúdo obrigatório.')],
  validate,
  asyncHandler(ctrl.createReply),
);

router.put('/:id/replies/:replyId',       authenticate, asyncHandler(ctrl.updateReply));
router.delete('/:id/replies/:replyId',    authenticate, asyncHandler(ctrl.deleteReply));
router.post('/:id/replies/:replyId/like', authenticate, asyncHandler(ctrl.likeReply));

export default router;
