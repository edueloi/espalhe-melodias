import { Router } from 'express';
import { authenticate, professionalOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/professionalsController';

const router = Router();

router.get('/',      authenticate, asyncHandler(ctrl.listProfessionals));
router.get('/:id',   authenticate, asyncHandler(ctrl.getProfessional));
router.put('/me',    authenticate, professionalOrAdmin, asyncHandler(ctrl.upsertProfessional));

export default router;
