import { Router } from 'express';
import { authenticate, optionalAuthenticate, professionalOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/blogsController';
import * as catCtrl from '../controllers/blogCategoriesController';

const router = Router();

// ─── Posts — rotas literais primeiro ──────────────────────────────────────────
router.get('/',              optionalAuthenticate, asyncHandler(ctrl.listBlogs));
router.get('/featured',      optionalAuthenticate, asyncHandler(ctrl.getFeaturedBlogs));
router.get('/popular',       optionalAuthenticate, asyncHandler(ctrl.getPopularBlogs));
router.get('/slug-check',    authenticate,         asyncHandler(ctrl.checkSlug));
router.get('/slug/:slug',    optionalAuthenticate, asyncHandler(ctrl.getBlogBySlug));

// ─── Categorias — antes de /:id para não colidir ──────────────────────────────
router.get('/categories',            optionalAuthenticate, asyncHandler(catCtrl.listBlogCategories));
router.get('/categories/slug/:slug', optionalAuthenticate, asyncHandler(catCtrl.getBlogCategoryBySlug));
router.get('/categories/:id',        optionalAuthenticate, asyncHandler(catCtrl.getBlogCategory));
router.post('/categories',           authenticate, professionalOrAdmin, asyncHandler(catCtrl.createBlogCategory));
router.put('/categories/:id',        authenticate, professionalOrAdmin, asyncHandler(catCtrl.updateBlogCategory));
router.delete('/categories/:id',     authenticate, professionalOrAdmin, asyncHandler(catCtrl.deleteBlogCategory));

// ─── Posts por ID (compat com links antigos) e mutações ───────────────────────
router.get('/:id',           optionalAuthenticate, asyncHandler(ctrl.getBlog));
router.post('/',             authenticate, professionalOrAdmin, asyncHandler(ctrl.createBlog));
router.put('/:id',           authenticate, professionalOrAdmin, asyncHandler(ctrl.updateBlog));
router.delete('/:id',        authenticate, professionalOrAdmin, asyncHandler(ctrl.deleteBlog));
router.post('/:id/like',     authenticate, asyncHandler(ctrl.likeBlog));

export default router;
