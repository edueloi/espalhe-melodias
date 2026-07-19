import { Router } from 'express';
import { authenticate, optionalAuthenticate, professionalOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/blogsController';

const router = Router();

router.get('/',           optionalAuthenticate, asyncHandler(ctrl.listBlogs));
router.get('/:id',        optionalAuthenticate, asyncHandler(ctrl.getBlog));
router.post('/',          authenticate, professionalOrAdmin, asyncHandler(ctrl.createBlog));
router.put('/:id',        authenticate, professionalOrAdmin, asyncHandler(ctrl.updateBlog));
router.delete('/:id',     authenticate, professionalOrAdmin, asyncHandler(ctrl.deleteBlog));
router.post('/:id/like',  authenticate, asyncHandler(ctrl.likeBlog));

export default router;
