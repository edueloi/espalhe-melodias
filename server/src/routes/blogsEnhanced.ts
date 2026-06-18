import { Router } from 'express';
import { authenticate, professionalOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as ctrl from '../controllers/blogsControllerEnhanced';
import * as catCtrl from '../controllers/blogCategoriesController';

const router = Router();

// ─── Blog Posts ────────────────────────────────────────────────────────────────

/** GET /api/blogs — Listar posts (paginado, com filtros) */
router.get('/', authenticate, asyncHandler(ctrl.listBlogs));

/** GET /api/blogs/featured — Obter posts destacados */
router.get('/featured', authenticate, asyncHandler(ctrl.getFeaturedBlogs));

/** GET /api/blogs/popular — Obter posts populares */
router.get('/popular', authenticate, asyncHandler(ctrl.getPopularBlogs));

/** GET /api/blogs/slug/:slug — Obter post por slug (SEO) */
router.get('/slug/:slug', authenticate, asyncHandler(ctrl.getBlogBySlug));

/** GET /api/blogs/:id — Obter post por ID */
router.get('/:id', authenticate, asyncHandler(ctrl.getBlog));

/** POST /api/blogs — Criar novo post (admin/professional) */
router.post('/', authenticate, professionalOrAdmin, asyncHandler(ctrl.createBlog));

/** PUT /api/blogs/:id — Atualizar post (owner ou admin) */
router.put('/:id', authenticate, professionalOrAdmin, asyncHandler(ctrl.updateBlog));

/** DELETE /api/blogs/:id — Deletar post (owner ou admin) */
router.delete('/:id', authenticate, professionalOrAdmin, asyncHandler(ctrl.deleteBlog));

/** POST /api/blogs/:id/like — Curtir/Descurtir */
router.post('/:id/like', authenticate, asyncHandler(ctrl.likeBlog));

// ─── Blog Categories ───────────────────────────────────────────────────────────

/** GET /api/blogs/categories — Listar categorias */
router.get('/categories', authenticate, asyncHandler(catCtrl.listBlogCategories));

/** GET /api/blogs/categories/:id — Obter categoria por ID */
router.get('/categories/:id', authenticate, asyncHandler(catCtrl.getBlogCategory));

/** GET /api/blogs/categories/slug/:slug — Obter categoria por slug */
router.get('/categories/slug/:slug', authenticate, asyncHandler(catCtrl.getBlogCategoryBySlug));

/** POST /api/blogs/categories — Criar categoria (admin) */
router.post(
  '/categories',
  authenticate,
  professionalOrAdmin,
  asyncHandler(catCtrl.createBlogCategory),
);

/** PUT /api/blogs/categories/:id — Atualizar categoria (admin) */
router.put('/categories/:id', authenticate, professionalOrAdmin, asyncHandler(catCtrl.updateBlogCategory));

/** DELETE /api/blogs/categories/:id — Deletar categoria (admin) */
router.delete(
  '/categories/:id',
  authenticate,
  professionalOrAdmin,
  asyncHandler(catCtrl.deleteBlogCategory),
);

export default router;
