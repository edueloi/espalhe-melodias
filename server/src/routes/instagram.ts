/**
 * Rotas para Instagram API
 * GET /api/instagram/feed
 * GET /api/instagram/stories
 * GET /api/instagram/stats
 * GET /api/instagram/health
 * GET /api/instagram/cache-status
 * POST /api/instagram/invalidate-cache (admin)
 */

import { Router } from 'express';
import {
  getInstagramFeed,
  getInstagramStories,
  getInstagramStats,
  invalidateInstagramCache,
  getInstagramCacheStatus,
  checkInstagramHealth,
} from '../controllers/instagramController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public endpoints
router.get('/feed', getInstagramFeed);
router.get('/stories', getInstagramStories);
router.get('/stats', getInstagramStats);
router.get('/health', checkInstagramHealth);

// Debug endpoints (considerar proteger com auth em produção)
router.get('/cache-status', getInstagramCacheStatus);

// Admin endpoints
router.post('/invalidate-cache', authenticate, invalidateInstagramCache);

export default router;
