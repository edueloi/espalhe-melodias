import { vi } from 'vitest';

export const mockNewsletterApi = {
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  getStats: vi.fn(),
};

export const mockContactApi = {
  create: vi.fn(),
  get: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
  respond: vi.fn(),
  export: vi.fn(),
};

export const mockEventsApi = {
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  getInscriptions: vi.fn(),
};

export const mockBlogsApi = {
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  like: vi.fn(),
};

export const mockInstagramApi = {
  feed: vi.fn(),
  getPost: vi.fn(),
};

export const mockStoriesApi = {
  list: vi.fn(),
  get: vi.fn(),
};

export const resetApiMocks = () => {
  mockNewsletterApi.subscribe.mockClear();
  mockNewsletterApi.unsubscribe.mockClear();
  mockNewsletterApi.getStats.mockClear();
  mockContactApi.create.mockClear();
  mockContactApi.get.mockClear();
  mockContactApi.list.mockClear();
  mockContactApi.update.mockClear();
  mockContactApi.respond.mockClear();
  mockContactApi.export.mockClear();
  mockEventsApi.list.mockClear();
  mockEventsApi.get.mockClear();
  mockEventsApi.create.mockClear();
  mockEventsApi.update.mockClear();
  mockEventsApi.delete.mockClear();
  mockEventsApi.subscribe.mockClear();
  mockEventsApi.unsubscribe.mockClear();
  mockEventsApi.getInscriptions.mockClear();
  mockBlogsApi.list.mockClear();
  mockBlogsApi.get.mockClear();
  mockBlogsApi.create.mockClear();
  mockBlogsApi.update.mockClear();
  mockBlogsApi.delete.mockClear();
  mockBlogsApi.like.mockClear();
  mockInstagramApi.feed.mockClear();
  mockInstagramApi.getPost.mockClear();
  mockStoriesApi.list.mockClear();
  mockStoriesApi.get.mockClear();
};
