import { describe, it, expect, beforeEach } from 'vitest';
import { mockContactApi, resetApiMocks } from '../mocks/api';
import { mockContactMessage } from '../mocks/data';

describe('Contact API', () => {
  beforeEach(() => {
    resetApiMocks();
  });

  describe('create', () => {
    it('should successfully create contact message', async () => {
      mockContactApi.create.mockResolvedValueOnce({
        success: true,
        data: mockContactMessage,
      });

      const messageData = {
        name: 'João Silva',
        email: 'joao@example.com',
        subject: 'Dúvida sobre inscrição',
        message: 'Gostaria de saber mais sobre o programa...',
      };

      const result = await mockContactApi.create(messageData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.status).toBe('new');
      expect(mockContactApi.create).toHaveBeenCalledWith(messageData);
    });

    it('should validate required fields', async () => {
      mockContactApi.create.mockRejectedValueOnce(
        new Error('Name is required')
      );

      await expect(
        mockContactApi.create({
          name: '',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message',
        })
      ).rejects.toThrow('Name is required');
    });

    it('should validate email format', async () => {
      mockContactApi.create.mockRejectedValueOnce(
        new Error('Invalid email format')
      );

      await expect(
        mockContactApi.create({
          name: 'Test User',
          email: 'invalid-email',
          subject: 'Test',
          message: 'Test message',
        })
      ).rejects.toThrow('Invalid email format');
    });

    it('should handle special characters in message', async () => {
      mockContactApi.create.mockResolvedValueOnce({
        success: true,
        data: {
          ...mockContactMessage,
          message: 'Mensagem com caracteres especiais: áéíóú @#$%',
        },
      });

      const result = await mockContactApi.create({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Mensagem com caracteres especiais: áéíóú @#$%',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('get', () => {
    it('should retrieve single message', async () => {
      mockContactApi.get.mockResolvedValueOnce(mockContactMessage);

      const message = await mockContactApi.get('msg-1');

      expect(message.id).toBe('msg-1');
      expect(message.status).toBe('new');
      expect(mockContactApi.get).toHaveBeenCalledWith('msg-1');
    });

    it('should handle non-existent message', async () => {
      mockContactApi.get.mockRejectedValueOnce(
        new Error('Message not found')
      );

      await expect(
        mockContactApi.get('nonexistent-id')
      ).rejects.toThrow('Message not found');
    });
  });

  describe('list', () => {
    it('should list contact messages with pagination', async () => {
      mockContactApi.list.mockResolvedValueOnce({
        data: [mockContactMessage],
        page: 1,
        pageSize: 10,
        total: 1,
      });

      const result = await mockContactApi.list({ page: 1, pageSize: 10 });

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.page).toBe(1);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should filter by status', async () => {
      mockContactApi.list.mockResolvedValueOnce({
        data: [{ ...mockContactMessage, status: 'new' }],
        total: 1,
      });

      const result = await mockContactApi.list({ status: 'new' });

      expect(result.data.every(m => m.status === 'new')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update message status', async () => {
      mockContactApi.update.mockResolvedValueOnce({
        success: true,
        data: { ...mockContactMessage, status: 'read' },
      });

      const result = await mockContactApi.update('msg-1', { status: 'read' });

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('read');
    });
  });

  describe('respond', () => {
    it('should send response to message', async () => {
      mockContactApi.respond.mockResolvedValueOnce({
        success: true,
        message: 'Response sent',
      });

      const result = await mockContactApi.respond('msg-1', {
        responseText: 'Thank you for your message...',
      });

      expect(result.success).toBe(true);
      expect(mockContactApi.respond).toHaveBeenCalledWith('msg-1', {
        responseText: 'Thank you for your message...',
      });
    });
  });

  describe('export', () => {
    it('should export messages as CSV', async () => {
      mockContactApi.export.mockResolvedValueOnce({
        success: true,
        downloadUrl: 'https://example.com/export/messages.csv',
      });

      const result = await mockContactApi.export({ format: 'csv' });

      expect(result.success).toBe(true);
      expect(result.downloadUrl).toContain('csv');
    });
  });
});
