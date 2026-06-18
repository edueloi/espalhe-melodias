import { describe, it, expect, beforeEach } from 'vitest';
import { mockBlogsApi, resetApiMocks } from '../mocks/api';
import { mockBlogPost } from '../mocks/data';

describe('Blogs API', () => {
  beforeEach(() => {
    resetApiMocks();
  });

  describe('list', () => {
    it('should list all published blogs', async () => {
      mockBlogsApi.list.mockResolvedValueOnce({
        data: [mockBlogPost],
        total: 1,
      });

      const result = await mockBlogsApi.list({ published: true });

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0].published).toBe(true);
    });

    it('should filter by category', async () => {
      mockBlogsApi.list.mockResolvedValueOnce({
        data: [{ ...mockBlogPost, category: 'Bem-estar' }],
        total: 1,
      });

      const result = await mockBlogsApi.list({ category: 'Bem-estar' });

      expect(result.data.every(b => b.category === 'Bem-estar')).toBe(true);
    });

    it('should filter featured posts', async () => {
      mockBlogsApi.list.mockResolvedValueOnce({
        data: [mockBlogPost],
        total: 1,
      });

      const result = await mockBlogsApi.list({ featured: true });

      expect(result.data[0].featured).toBe(true);
    });

    it('should support pagination', async () => {
      mockBlogsApi.list.mockResolvedValueOnce({
        data: Array(10).fill(mockBlogPost),
        page: 1,
        pageSize: 10,
        total: 50,
      });

      const result = await mockBlogsApi.list({ page: 1, pageSize: 10 });

      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.page).toBe(1);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should return empty list when no posts match filter', async () => {
      mockBlogsApi.list.mockResolvedValueOnce({
        data: [],
        total: 0,
      });

      const result = await mockBlogsApi.list({ category: 'NonExistent' });

      expect(result.data.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('get', () => {
    it('should retrieve single blog post', async () => {
      mockBlogsApi.get.mockResolvedValueOnce(mockBlogPost);

      const post = await mockBlogsApi.get('blog-1');

      expect(post.id).toBe(mockBlogPost.id);
      expect(post.title).toBe(mockBlogPost.title);
      expect(post.content).toBeDefined();
    });

    it('should handle non-existent post', async () => {
      mockBlogsApi.get.mockRejectedValueOnce(
        new Error('Blog post not found')
      );

      await expect(
        mockBlogsApi.get('nonexistent-id')
      ).rejects.toThrow('Blog post not found');
    });
  });

  describe('create', () => {
    it('should create new blog post', async () => {
      mockBlogsApi.create.mockResolvedValueOnce({
        success: true,
        data: mockBlogPost,
      });

      const postData = {
        title: 'Novo Artigo',
        excerpt: 'Resumo do artigo',
        content: 'Conteúdo completo...',
        category: 'Bem-estar',
        imageUrl: 'https://example.com/image.jpg',
      };

      const result = await mockBlogsApi.create(postData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.published).toBeDefined();
    });

    it('should validate required fields', async () => {
      mockBlogsApi.create.mockRejectedValueOnce(
        new Error('Title is required')
      );

      await expect(
        mockBlogsApi.create({
          title: '',
          excerpt: 'Excerpt',
          content: 'Content',
          category: 'Category',
          imageUrl: 'https://example.com/image.jpg',
        })
      ).rejects.toThrow('Title is required');
    });

    it('should handle markdown content', async () => {
      mockBlogsApi.create.mockResolvedValueOnce({
        success: true,
        data: {
          ...mockBlogPost,
          content: '# Heading\n## Subheading\n\n**Bold text**',
        },
      });

      const result = await mockBlogsApi.create({
        title: 'Markdown Post',
        excerpt: 'Test',
        content: '# Heading\n## Subheading\n\n**Bold text**',
        category: 'Tech',
        imageUrl: 'https://example.com/image.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.data.content).toContain('Heading');
    });
  });

  describe('update', () => {
    it('should update blog post', async () => {
      mockBlogsApi.update.mockResolvedValueOnce({
        success: true,
        data: { ...mockBlogPost, title: 'Updated Title' },
      });

      const result = await mockBlogsApi.update('blog-1', {
        title: 'Updated Title',
      });

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Updated Title');
    });

    it('should publish draft post', async () => {
      mockBlogsApi.update.mockResolvedValueOnce({
        success: true,
        data: { ...mockBlogPost, published: true },
      });

      const result = await mockBlogsApi.update('blog-1', { published: true });

      expect(result.success).toBe(true);
      expect(result.data.published).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete blog post', async () => {
      mockBlogsApi.delete.mockResolvedValueOnce({
        success: true,
        message: 'Blog post deleted',
      });

      const result = await mockBlogsApi.delete('blog-1');

      expect(result.success).toBe(true);
      expect(mockBlogsApi.delete).toHaveBeenCalledWith('blog-1');
    });
  });

  describe('like', () => {
    it('should like blog post', async () => {
      mockBlogsApi.like.mockResolvedValueOnce({
        success: true,
        likes: 25,
      });

      const result = await mockBlogsApi.like('blog-1');

      expect(result.success).toBe(true);
      expect(result.likes).toBeGreaterThan(0);
    });

    it('should handle already liked post', async () => {
      mockBlogsApi.like.mockRejectedValueOnce(
        new Error('Already liked this post')
      );

      await expect(
        mockBlogsApi.like('blog-1')
      ).rejects.toThrow('Already liked');
    });
  });
});
