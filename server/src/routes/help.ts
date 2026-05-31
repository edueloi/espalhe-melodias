import { Router } from 'express';
import { authenticate, professionalOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/helpController';

const router = Router();

router.get('/',         authenticate, asyncHandler(ctrl.listRequests));
router.get('/stats',    authenticate, professionalOrAdmin, asyncHandler(ctrl.getStats));
router.get('/:id',      authenticate, asyncHandler(ctrl.getRequest));
router.post('/',        authenticate, asyncHandler(ctrl.createRequest));
router.patch('/:id',    authenticate, professionalOrAdmin, asyncHandler(ctrl.updateRequest));

export default router;
