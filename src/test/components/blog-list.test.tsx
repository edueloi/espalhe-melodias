import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useBlogList } from '@/src/hooks/usePublicSiteData';
import { mockBlogsApi, resetApiMocks } from '../mocks/api';
import { mockBlogPost } from '../mocks/data';
import React from 'react';

// Mock component for testing
function BlogList() {
  const [blogs, setBlogs] = React.useState<typeof mockBlogPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadBlogs = async () => {
      try {
        setIsLoading(true);
        const result = await mockBlogsApi.list({ published: true });
        const blogsList = Array.isArray(result) ? result : result.data;
        setBlogs(blogsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar blogs');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogs();
  }, []);

  if (isLoading) return <div role="status">Carregando blogs...</div>;
  if (error) return <div role="alert">{error}</div>;
  if (blogs.length === 0) return <div>Nenhum blog encontrado</div>;

  return (
    <div>
      {blogs.map((blog) => (
        <article key={blog.id} data-testid={`blog-${blog.id}`}>
          <h2>{blog.title}</h2>
          <p>{blog.excerpt}</p>
          <span>{blog.readTime}</span>
          <small>{blog.authorName}</small>
        </article>
      ))}
    </div>
  );
}

describe('Blog List', () => {
  beforeEach(() => {
    resetApiMocks();
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockBlogsApi.list.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: [mockBlogPost] }), 100))
    );

    render(<BlogList />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando blogs...');
  });

  it('should render blog list', async () => {
    mockBlogsApi.list.mockResolvedValueOnce({
      data: [mockBlogPost],
      total: 1,
    });

    render(<BlogList />);

    await waitFor(() => {
      expect(screen.getByText(mockBlogPost.title)).toBeInTheDocument();
      expect(screen.getByText(mockBlogPost.excerpt)).toBeInTheDocument();
    });
  });

  it('should display blog metadata', async () => {
    mockBlogsApi.list.mockResolvedValueOnce({
      data: [mockBlogPost],
      total: 1,
    });

    render(<BlogList />);

    await waitFor(() => {
      expect(screen.getByText(mockBlogPost.readTime)).toBeInTheDocument();
      expect(screen.getByText(mockBlogPost.authorName)).toBeInTheDocument();
    });
  });

  it('should handle empty blog list', async () => {
    mockBlogsApi.list.mockResolvedValueOnce({
      data: [],
      total: 0,
    });

    render(<BlogList />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum blog encontrado')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    mockBlogsApi.list.mockRejectedValueOnce(
      new Error('Erro ao carregar blogs')
    );

    render(<BlogList />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Erro ao carregar blogs');
    });
  });

  it('should filter published blogs only', async () => {
    mockBlogsApi.list.mockResolvedValueOnce({
      data: [{ ...mockBlogPost, published: true }],
      total: 1,
    });

    render(<BlogList />);

    await waitFor(() => {
      expect(mockBlogsApi.list).toHaveBeenCalledWith({ published: true });
    });
  });

  it('should render multiple blogs', async () => {
    const blogs = [
      mockBlogPost,
      { ...mockBlogPost, id: 'blog-2', title: 'Second Blog' },
      { ...mockBlogPost, id: 'blog-3', title: 'Third Blog' },
    ];

    mockBlogsApi.list.mockResolvedValueOnce({
      data: blogs,
      total: 3,
    });

    render(<BlogList />);

    await waitFor(() => {
      expect(screen.getByText('Second Blog')).toBeInTheDocument();
      expect(screen.getByText('Third Blog')).toBeInTheDocument();
    });
  });
});
