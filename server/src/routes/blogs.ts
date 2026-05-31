import { Router } from 'express';
import { authenticate, professionalOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/blogsController';

const router = Router();

router.get('/',           authenticate, asyncHandler(ctrl.listBlogs));
router.get('/:id',        authenticate, asyncHandler(ctrl.getBlog));
router.post('/',          authenticate, professionalOrAdmin, asyncHandler(ctrl.createBlog));
router.put('/:id',        authenticate, professionalOrAdmin, asyncHandler(ctrl.updateBlog));
router.delete('/:id',     authenticate, professionalOrAdmin, asyncHandler(ctrl.deleteBlog));
router.post('/:id/like',  authenticate, asyncHandler(ctrl.likeBlog));

export default router;
