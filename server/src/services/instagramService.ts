/**
 * Service para integração com Instagram Graph API
 * Gerencia cache, fetch de dados, tratamento de erros
 */

import axios, { AxiosError } from 'axios';
import { config } from '../config';
import {
  InstagramMediaItem,
  InstagramStats,
  InstagramFeedResponse,
  InstagramStatsResponse,
  InstagramErrorResponse,
} from '../models/instagram';

class InstagramService {
  private readonly baseURL = `https://graph.instagram.com/${config.instagram.apiVersion}`;
  private readonly accountId = config.instagram.businessAccountId;
  private readonly accessToken = config.instagram.accessToken;
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  /**
   * Busca os últimos N posts do Instagram
   * @param limit Número de posts (default: 9)
   * @param useCache Usar cache se disponível (default: true)
   */
  async getFeed(limit: number = 9, useCache: boolean = true): Promise<InstagramFeedResponse> {
    const cacheKey = 'instagram_feed';

    // Verifica cache
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        console.log('[Instagram] Cache hit for feed');
        return { ...cached.data, cacheExpiry: cached.expiry };
      }
    }

    try {
      console.log(`[Instagram] Fetching feed from API (limit=${limit})...`);

      const url = `${this.baseURL}/${this.accountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,like_count,comments_count,timestamp,permalink&limit=${limit}&access_token=${this.accessToken}`;

      const response = await axios.get(url);
      const posts: InstagramMediaItem[] = response.data.data || [];

      console.log(`[Instagram] Received ${posts.length} posts from API`);

      // Busca stats
      const stats = await this.getStats();

      const feedData: InstagramFeedResponse = {
        success: true,
        data: {
          posts,
          stats,
          fetchedAt: new Date().toISOString(),
        },
      };

      // Armazena em cache
      const cacheTTL = config.instagram.cacheTTL * 1000; // converte para ms
      this.cache.set(cacheKey, {
        data: feedData,
        expiry: Date.now() + cacheTTL,
      });

      console.log(`[Instagram] Feed cached for ${config.instagram.cacheTTL}s`);

      return feedData;
    } catch (error) {
      console.error('[Instagram] Error fetching feed:', error);
      return this.handleError(error, 'Failed to fetch Instagram feed');
    }
  }

  /**
   * Busca as 3 últimas stories (se disponível)
   * @param limit Número de stories (default: 3)
   */
  async getStories(limit: number = 3): Promise<InstagramFeedResponse> {
    const cacheKey = 'instagram_stories';

    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      console.log('[Instagram] Cache hit for stories');
      return { ...cached.data, cacheExpiry: cached.expiry };
    }

    try {
      console.log(`[Instagram] Fetching stories from API (limit=${limit})...`);

      const url = `${this.baseURL}/${this.accountId}/stories?fields=id,media_type,media_url,timestamp&limit=${limit}&access_token=${this.accessToken}`;

      const response = await axios.get(url);
      const stories: InstagramMediaItem[] = response.data.data || [];

      console.log(`[Instagram] Received ${stories.length} stories from API`);

      const stats = await this.getStats();

      const storiesData: InstagramFeedResponse = {
        success: true,
        data: {
          posts: stories,
          stats,
          fetchedAt: new Date().toISOString(),
        },
      };

      const cacheTTL = config.instagram.cacheTTL * 1000;
      this.cache.set(cacheKey, {
        data: storiesData,
        expiry: Date.now() + cacheTTL,
      });

      console.log(`[Instagram] Stories cached for ${config.instagram.cacheTTL}s`);

      return storiesData;
    } catch (error) {
      console.error('[Instagram] Error fetching stories:', error);
      // Stories podem não estar disponível, retorna erro gracioso
      return this.handleError(error, 'Instagram stories not available');
    }
  }

  /**
   * Busca estatísticas da conta
   */
  async getStats(): Promise<InstagramStats> {
    const cacheKey = 'instagram_stats';

    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      console.log('[Instagram] Cache hit for stats');
      return cached.data;
    }

    try {
      console.log('[Instagram] Fetching stats from API...');

      const url = `${this.baseURL}/${this.accountId}?fields=id,username,name,biography,website,profile_picture_url,followers_count,media_count&access_token=${this.accessToken}`;

      const response = await axios.get(url);
      const stats: InstagramStats = {
        ig_id: response.data.id,
        username: response.data.username,
        name: response.data.name,
        biography: response.data.biography || '',
        website: response.data.website,
        profile_picture_url: response.data.profile_picture_url,
        followers_count: response.data.followers_count || 0,
        media_count: response.data.media_count || 0,
      };

      const cacheTTL = config.instagram.cacheTTL * 1000;
      this.cache.set(cacheKey, {
        data: stats,
        expiry: Date.now() + cacheTTL,
      });

      console.log(`[Instagram] Stats cached (followers: ${stats.followers_count})`);

      return stats;
    } catch (error) {
      console.error('[Instagram] Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Invalida o cache manualmente
   */
  invalidateCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      console.log(`[Instagram] Cache key '${key}' invalidated`);
    } else {
      this.cache.clear();
      console.log('[Instagram] All cache cleared');
    }
  }

  /**
   * Retorna status do cache (para debug)
   */
  getCacheStatus(): Record<string, any> {
    const status: Record<string, any> = {};

    for (const [key, entry] of this.cache.entries()) {
      const isExpired = entry.expiry <= Date.now();
      status[key] = {
        cached: true,
        expired: isExpired,
        expiresIn: Math.max(0, entry.expiry - Date.now()),
      };
    }

    return status;
  }

  /**
   * Trata erros de forma consistente
   */
  private handleError(error: unknown, defaultMessage: string): InstagramErrorResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      console.error(`[Instagram] API Error [${status}]:`, data);

      let errorMessage = defaultMessage;
      let errorCode = 'INSTAGRAM_API_ERROR';

      if (data?.error) {
        errorMessage = data.error.message || defaultMessage;
        errorCode = data.error.code || errorCode;
      }

      return {
        success: false,
        error: errorMessage,
        code: errorCode,
        message: `HTTP ${status}: ${errorMessage}`,
      };
    }

    return {
      success: false,
      error: defaultMessage,
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export const instagramService = new InstagramService();
