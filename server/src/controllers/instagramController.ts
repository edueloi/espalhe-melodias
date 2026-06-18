/**
 * Controller para endpoints Instagram
 * Valida requests, chama service, retorna respostas
 */

import { Request, Response, NextFunction } from 'express';
import { instagramService } from '../services/instagramService';
import { config } from '../config';

/**
 * GET /api/instagram/feed
 * Retorna últimos 9 posts do Instagram
 *
 * Query params:
 *   - limit: número de posts (1-25, default: 9)
 *   - cache: usar cache (true/false, default: true)
 */
export async function getInstagramFeed(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 9, 25);
    const useCache = req.query.cache !== 'false';

    const result = await instagramService.getFeed(limit, useCache);

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/instagram/stories
 * Retorna últimas 3 stories do Instagram
 *
 * Query params:
 *   - limit: número de stories (1-25, default: 3)
 *   - cache: usar cache (true/false, default: true)
 */
export async function getInstagramStories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 3, 25);
    const useCache = req.query.cache !== 'false';

    const result = await instagramService.getStories(limit);

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/instagram/stats
 * Retorna estatísticas da conta (followers, engagement, etc)
 */
export async function getInstagramStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await instagramService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Instagram stats',
    });
    next(error);
  }
}

/**
 * POST /api/instagram/invalidate-cache
 * Invalida cache (admin only)
 *
 * Body (opcional):
 *   - key: chave específica a invalidar (ex: 'instagram_feed')
 *
 * Chaves disponíveis:
 *   - instagram_feed
 *   - instagram_stories
 *   - instagram_stats
 */
export async function invalidateInstagramCache(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { key } = req.body;

    instagramService.invalidateCache(key);

    res.json({
      success: true,
      message: key
        ? `Cache key '${key}' invalidated`
        : 'All Instagram cache invalidated',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/instagram/cache-status
 * Retorna status do cache (debug only)
 */
export async function getInstagramCacheStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const status = instagramService.getCacheStatus();

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/instagram/health
 * Verifica se a integração está funcionando
 */
export async function checkInstagramHealth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const hasAccountId = !!config.instagram.businessAccountId;
    const hasAccessToken = !!config.instagram.accessToken;

    if (!hasAccountId || !hasAccessToken) {
      return res.status(500).json({
        success: false,
        status: 'MISCONFIGURED',
        message: 'Instagram API credentials not configured',
        details: {
          hasAccountId,
          hasAccessToken,
        },
      });
    }

    // Tenta fazer uma request para validar credenciais
    const stats = await instagramService.getStats();

    res.json({
      success: true,
      status: 'HEALTHY',
      message: 'Instagram integration is working',
      account: {
        username: stats.username,
        followers: stats.followers_count,
        posts: stats.media_count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'ERROR',
      message: 'Instagram integration health check failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
