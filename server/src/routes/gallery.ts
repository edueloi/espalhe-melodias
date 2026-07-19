import { Router } from 'express';
import { authenticate, optionalAuthenticate, professionalOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/galleryController';

const router = Router();

router.get('/',       optionalAuthenticate, asyncHandler(ctrl.listGalleryPhotos));
router.get('/:id',    optionalAuthenticate, asyncHandler(ctrl.getGalleryPhoto));
router.post('/',      authenticate, professionalOrAdmin, asyncHandler(ctrl.createGalleryPhoto));
router.put('/:id',    authenticate, professionalOrAdmin, asyncHandler(ctrl.updateGalleryPhoto));
router.delete('/:id', authenticate, professionalOrAdmin, asyncHandler(ctrl.deleteGalleryPhoto));

export default router;
