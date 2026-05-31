import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/preferencesController';

const router = Router();

router.get('/',                          authenticate, asyncHandler(ctrl.getPreferences));
router.patch('/',                        authenticate, asyncHandler(ctrl.updatePreferences));
router.delete('/reset',                  authenticate, asyncHandler(ctrl.resetPreferences));
router.post('/bookmark/material/:id',    authenticate, asyncHandler(ctrl.toggleBookmarkMaterial));
router.post('/bookmark/topic/:id',       authenticate, asyncHandler(ctrl.toggleBookmarkTopic));
router.post('/enroll/:id',               authenticate, asyncHandler(ctrl.toggleEventEnrollment));

export default router;
