import { Router } from 'express';
import { authenticate, professionalOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/materialsController';

const router = Router();

router.get('/',            authenticate, asyncHandler(ctrl.listMaterials));
router.get('/:id',         authenticate, asyncHandler(ctrl.getMaterial));
router.post('/',           authenticate, professionalOrAdmin, asyncHandler(ctrl.createMaterial));
router.put('/:id',         authenticate, professionalOrAdmin, asyncHandler(ctrl.updateMaterial));
router.delete('/:id',      authenticate, professionalOrAdmin, asyncHandler(ctrl.deleteMaterial));
router.post('/:id/download', authenticate, asyncHandler(ctrl.trackDownload));

export default router;
