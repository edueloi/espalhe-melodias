import { Request, Response, NextFunction } from 'express';
import { instagramService } from '../services/instagramService';

export async function getInstagramFeed(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 9, 25);
    const result = await instagramService.getFeed(limit, true);
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch Instagram feed' });
  }
}

export async function getInstagramStories(
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const result = await instagramService.getStories(3);
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch Instagram stories' });
  }
}

export async function getInstagramStats(
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const stats = await instagramService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch Instagram stats' });
  }
}

export async function invalidateInstagramCache(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const { key } = req.body;
    instagramService.invalidateCache(key);
    res.json({ success: true, message: key ? `Cache key '${key}' invalidated` : 'All Instagram cache invalidated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to invalidate cache' });
  }
}

export async function getInstagramCacheStatus(
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const status = instagramService.getCacheStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch cache status' });
  }
}

export async function checkInstagramHealth(
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const stats = await instagramService.getStats();
    res.json({ success: true, status: 'HEALTHY', data: stats });
  } catch (error) {
    res.status(500).json({ success: false, status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
