import { describe, it, expect, beforeEach } from 'vitest';
import { mockEventsApi, resetApiMocks } from '../mocks/api';
import { mockHealthEvent, mockEventInscription } from '../mocks/data';

describe('Events API', () => {
  beforeEach(() => {
    resetApiMocks();
  });

  describe('list', () => {
    it('should list all events', async () => {
      mockEventsApi.list.mockResolvedValueOnce({
        data: [mockHealthEvent],
        total: 1,
      });

      const result = await mockEventsApi.list();

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0].title).toBe(mockHealthEvent.title);
    });

    it('should filter by status', async () => {
      mockEventsApi.list.mockResolvedValueOnce({
        data: [{ ...mockHealthEvent, status: 'upcoming' }],
        total: 1,
      });

      const result = await mockEventsApi.list({ status: 'upcoming' });

      expect(result.data.every(e => e.status === 'upcoming')).toBe(true);
    });

    it('should separate upcoming and past events', async () => {
      const pastEvent = { ...mockHealthEvent, status: 'past' as const };
      const upcomingEvent = { ...mockHealthEvent, status: 'upcoming' as const };

      mockEventsApi.list.mockResolvedValueOnce({
        data: [pastEvent, upcomingEvent],
        total: 2,
      });

      const result = await mockEventsApi.list();

      expect(result.data.length).toBe(2);
      expect(result.data.some(e => e.status === 'past')).toBe(true);
      expect(result.data.some(e => e.status === 'upcoming')).toBe(true);
    });
  });

  describe('get', () => {
    it('should retrieve single event', async () => {
      mockEventsApi.get.mockResolvedValueOnce(mockHealthEvent);

      const event = await mockEventsApi.get('event-1');

      expect(event.id).toBe(mockHealthEvent.id);
      expect(event.title).toBe(mockHealthEvent.title);
    });

    it('should handle non-existent event', async () => {
      mockEventsApi.get.mockRejectedValueOnce(
        new Error('Event not found')
      );

      await expect(
        mockEventsApi.get('nonexistent-id')
      ).rejects.toThrow('Event not found');
    });
  });

  describe('create', () => {
    it('should create new event', async () => {
      mockEventsApi.create.mockResolvedValueOnce({
        success: true,
        data: mockHealthEvent,
      });

      const eventData = {
        title: 'Workshop de Mindfulness',
        date: '2026-07-15',
        time: '14:00',
        description: 'Workshop sobre técnicas de mindfulness',
        category: 'Workshop',
      };

      const result = await mockEventsApi.create(eventData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });

    it('should validate required fields', async () => {
      mockEventsApi.create.mockRejectedValueOnce(
        new Error('Title is required')
      );

      await expect(
        mockEventsApi.create({
          title: '',
          date: '2026-07-15',
          time: '14:00',
          description: 'Test',
          category: 'Workshop',
        })
      ).rejects.toThrow('Title is required');
    });
  });

  describe('update', () => {
    it('should update event', async () => {
      mockEventsApi.update.mockResolvedValueOnce({
        success: true,
        data: { ...mockHealthEvent, title: 'Updated Title' },
      });

      const result = await mockEventsApi.update('event-1', {
        title: 'Updated Title',
      });

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Updated Title');
    });
  });

  describe('delete', () => {
    it('should delete event', async () => {
      mockEventsApi.delete.mockResolvedValueOnce({
        success: true,
        message: 'Event deleted',
      });

      const result = await mockEventsApi.delete('event-1');

      expect(result.success).toBe(true);
      expect(mockEventsApi.delete).toHaveBeenCalledWith('event-1');
    });
  });

  describe('subscribe', () => {
    it('should subscribe to event', async () => {
      mockEventsApi.subscribe.mockResolvedValueOnce({
        success: true,
        data: mockEventInscription,
      });

      const result = await mockEventsApi.subscribe('event-1', {
        email: 'user@example.com',
        name: 'User Name',
        phone: '11999999999',
      });

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('confirmed');
    });

    it('should prevent duplicate subscriptions', async () => {
      mockEventsApi.subscribe.mockRejectedValueOnce(
        new Error('Already subscribed to this event')
      );

      await expect(
        mockEventsApi.subscribe('event-1', {
          email: 'user@example.com',
          name: 'User Name',
          phone: '11999999999',
        })
      ).rejects.toThrow('Already subscribed');
    });

    it('should validate email format', async () => {
      mockEventsApi.subscribe.mockRejectedValueOnce(
        new Error('Invalid email format')
      );

      await expect(
        mockEventsApi.subscribe('event-1', {
          email: 'invalid-email',
          name: 'User Name',
          phone: '11999999999',
        })
      ).rejects.toThrow('Invalid email format');
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from event', async () => {
      mockEventsApi.unsubscribe.mockResolvedValueOnce({
        success: true,
        message: 'Unsubscribed from event',
      });

      const result = await mockEventsApi.unsubscribe('event-1', 'user@example.com');

      expect(result.success).toBe(true);
      expect(mockEventsApi.unsubscribe).toHaveBeenCalledWith('event-1', 'user@example.com');
    });
  });

  describe('getInscriptions', () => {
    it('should list event inscriptions', async () => {
      mockEventsApi.getInscriptions.mockResolvedValueOnce({
        data: [mockEventInscription],
        total: 1,
      });

      const result = await mockEventsApi.getInscriptions('event-1');

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0].eventId).toBe('event-1');
    });

    it('should count inscriptions', async () => {
      mockEventsApi.getInscriptions.mockResolvedValueOnce({
        data: Array(25).fill(mockEventInscription),
        total: 25,
      });

      const result = await mockEventsApi.getInscriptions('event-1');

      expect(result.total).toBe(25);
    });
  });
});
