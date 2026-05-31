import { Router } from 'express';
import { authenticate, professionalOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/suggestionsController';

const router = Router();

router.get('/',           authenticate, asyncHandler(ctrl.listSuggestions));
router.post('/',          authenticate, asyncHandler(ctrl.createSuggestion));
router.post('/:id/like',  authenticate, asyncHandler(ctrl.likeSuggestion));
router.patch('/:id',      authenticate, professionalOrAdmin, asyncHandler(ctrl.updateSuggestion));

export default router;
