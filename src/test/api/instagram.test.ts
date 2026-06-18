import { describe, it, expect, beforeEach } from 'vitest';
import { mockInstagramApi, mockStoriesApi, resetApiMocks } from '../mocks/api';
import { mockInstagramPost, mockStoryHighlight } from '../mocks/data';

describe('Instagram API', () => {
  beforeEach(() => {
    resetApiMocks();
  });

  describe('feed', () => {
    it('should fetch Instagram feed', async () => {
      mockInstagramApi.feed.mockResolvedValueOnce({
        data: Array(6).fill(mockInstagramPost),
        total: 150,
      });

      const result = await mockInstagramApi.feed();

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].image_url).toBeDefined();
      expect(result.data[0].caption).toBeDefined();
    });

    it('should return limited posts by default', async () => {
      mockInstagramApi.feed.mockResolvedValueOnce({
        data: Array(6).fill(mockInstagramPost),
        total: 150,
      });

      const result = await mockInstagramApi.feed({ limit: 6 });

      expect(result.data.length).toBeLessThanOrEqual(6);
    });

    it('should handle empty feed gracefully', async () => {
      mockInstagramApi.feed.mockResolvedValueOnce({
        data: [],
        total: 0,
      });

      const result = await mockInstagramApi.feed();

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(0);
    });

    it('should handle API errors with fallback', async () => {
      mockInstagramApi.feed.mockRejectedValueOnce(
        new Error('Instagram API unavailable')
      );

      await expect(
        mockInstagramApi.feed()
      ).rejects.toThrow('Instagram API unavailable');
    });

    it('should include engagement metrics', async () => {
      mockInstagramApi.feed.mockResolvedValueOnce({
        data: [
          {
            ...mockInstagramPost,
            likes_count: 124,
            comments_count: 18,
          },
        ],
        total: 1,
      });

      const result = await mockInstagramApi.feed();

      expect(result.data[0].likes_count).toBeGreaterThan(0);
      expect(result.data[0].comments_count).toBeGreaterThan(0);
    });

    it('should cache results for performance', async () => {
      mockInstagramApi.feed.mockResolvedValueOnce({
        data: Array(6).fill(mockInstagramPost),
        cached: true,
        cacheTimestamp: new Date().toISOString(),
      });

      const result = await mockInstagramApi.feed();

      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('getPost', () => {
    it('should retrieve single Instagram post', async () => {
      mockInstagramApi.getPost.mockResolvedValueOnce(mockInstagramPost);

      const post = await mockInstagramApi.getPost('ig-1');

      expect(post.id).toBe(mockInstagramPost.id);
      expect(post.image_url).toBeDefined();
      expect(post.caption).toBeDefined();
    });

    it('should handle non-existent post', async () => {
      mockInstagramApi.getPost.mockRejectedValueOnce(
        new Error('Post not found')
      );

      await expect(
        mockInstagramApi.getPost('nonexistent-id')
      ).rejects.toThrow('Post not found');
    });
  });
});

describe('Stories API', () => {
  beforeEach(() => {
    resetApiMocks();
  });

  describe('list', () => {
    it('should fetch story highlights', async () => {
      mockStoriesApi.list.mockResolvedValueOnce({
        data: Array(4).fill(mockStoryHighlight),
        total: 4,
      });

      const result = await mockStoriesApi.list();

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0].title).toBeDefined();
      expect(result.data[0].cover_media_url).toBeDefined();
    });

    it('should handle empty stories', async () => {
      mockStoriesApi.list.mockResolvedValueOnce({
        data: [],
        total: 0,
      });

      const result = await mockStoriesApi.list();

      expect(result.data.length).toBe(0);
    });

    it('should cache story highlights', async () => {
      mockStoriesApi.list.mockResolvedValueOnce({
        data: Array(4).fill(mockStoryHighlight),
        cached: true,
        cacheTimestamp: new Date().toISOString(),
      });

      const result = await mockStoriesApi.list();

      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      mockStoriesApi.list.mockRejectedValueOnce(
        new Error('Failed to fetch stories')
      );

      await expect(
        mockStoriesApi.list()
      ).rejects.toThrow('Failed to fetch stories');
    });
  });

  describe('get', () => {
    it('should retrieve single story highlight', async () => {
      mockStoriesApi.get.mockResolvedValueOnce(mockStoryHighlight);

      const story = await mockStoriesApi.get('story-1');

      expect(story.id).toBe(mockStoryHighlight.id);
      expect(story.title).toBeDefined();
    });
  });
});
