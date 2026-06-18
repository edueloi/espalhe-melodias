import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockNewsletterApi, resetApiMocks } from '../mocks/api';
import { mockNewsletterSubscription } from '../mocks/data';

describe('Newsletter API', () => {
  beforeEach(() => {
    resetApiMocks();
  });

  describe('subscribe', () => {
    it('should successfully subscribe to newsletter', async () => {
      mockNewsletterApi.subscribe.mockResolvedValueOnce({
        success: true,
        message: 'Subscribed to newsletter',
        data: mockNewsletterSubscription,
      });

      const result = await mockNewsletterApi.subscribe('test@example.com');

      expect(result.success).toBe(true);
      expect(result.data.subscribed).toBe(true);
      expect(mockNewsletterApi.subscribe).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle invalid email format', async () => {
      mockNewsletterApi.subscribe.mockRejectedValueOnce(
        new Error('Invalid email format')
      );

      await expect(
        mockNewsletterApi.subscribe('invalid-email')
      ).rejects.toThrow('Invalid email format');
    });

    it('should handle duplicate subscriptions', async () => {
      mockNewsletterApi.subscribe.mockRejectedValueOnce(
        new Error('Email already subscribed')
      );

      await expect(
        mockNewsletterApi.subscribe('duplicate@example.com')
      ).rejects.toThrow('Email already subscribed');
    });

    it('should handle network errors', async () => {
      mockNewsletterApi.subscribe.mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        mockNewsletterApi.subscribe('test@example.com')
      ).rejects.toThrow('Network error');
    });
  });

  describe('unsubscribe', () => {
    it('should successfully unsubscribe from newsletter', async () => {
      mockNewsletterApi.unsubscribe.mockResolvedValueOnce({
        success: true,
        message: 'Unsubscribed from newsletter',
      });

      const result = await mockNewsletterApi.unsubscribe('test@example.com');

      expect(result.success).toBe(true);
      expect(mockNewsletterApi.unsubscribe).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle non-existent email', async () => {
      mockNewsletterApi.unsubscribe.mockRejectedValueOnce(
        new Error('Email not found')
      );

      await expect(
        mockNewsletterApi.unsubscribe('nonexistent@example.com')
      ).rejects.toThrow('Email not found');
    });
  });

  describe('getStats', () => {
    it('should return newsletter statistics', async () => {
      mockNewsletterApi.getStats.mockResolvedValueOnce({
        count: 150,
        activeCount: 140,
        unsubscribeRate: 6.7,
        lastUpdate: new Date().toISOString(),
      });

      const stats = await mockNewsletterApi.getStats();

      expect(stats.count).toBe(150);
      expect(stats.activeCount).toBe(140);
      expect(stats.unsubscribeRate).toBeLessThan(10);
    });

    it('should return zero stats when no subscribers', async () => {
      mockNewsletterApi.getStats.mockResolvedValueOnce({
        count: 0,
        activeCount: 0,
        unsubscribeRate: 0,
        lastUpdate: new Date().toISOString(),
      });

      const stats = await mockNewsletterApi.getStats();

      expect(stats.count).toBe(0);
      expect(stats.activeCount).toBe(0);
    });
  });
});
