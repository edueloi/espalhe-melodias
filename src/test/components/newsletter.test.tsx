import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNewsletterSubscription } from '@/src/hooks/useNewsletterSubscription';
import { mockNewsletterApi, resetApiMocks } from '../mocks/api';

// Mock component for testing
function NewsletterForm() {
  const { isLoading, error, isSubscribed, subscribe } = useNewsletterSubscription();
  const [email, setEmail] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await subscribe(email);
      setEmail('');
    } catch (err) {
      // error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Inscrevendo...' : 'Se inscrever'}
      </button>
      {error && <div role="alert">{error}</div>}
      {isSubscribed && <div role="status">Inscrito com sucesso!</div>}
    </form>
  );
}

import React from 'react';

describe('Newsletter Form', () => {
  beforeEach(() => {
    resetApiMocks();
    vi.clearAllMocks();
  });

  it('should render newsletter form', () => {
    render(<NewsletterForm />);

    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByText('Se inscrever')).toBeInTheDocument();
  });

  it('should submit valid email', async () => {
    mockNewsletterApi.subscribe.mockResolvedValueOnce({
      success: true,
      data: { subscribed: true },
    });

    render(<NewsletterForm />);

    const input = screen.getByPlaceholderText('seu@email.com');
    const button = screen.getByText('Se inscrever');

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNewsletterApi.subscribe).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should show loading state during submission', async () => {
    mockNewsletterApi.subscribe.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<NewsletterForm />);

    const input = screen.getByPlaceholderText('seu@email.com');
    const button = screen.getByText('Se inscrever');

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    expect(screen.getByText('Inscrevendo...')).toBeInTheDocument();
  });

  it('should display success message', async () => {
    mockNewsletterApi.subscribe.mockResolvedValueOnce({
      success: true,
      data: { subscribed: true },
    });

    render(<NewsletterForm />);

    const input = screen.getByPlaceholderText('seu@email.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Se inscrever'));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Inscrito com sucesso!');
    });
  });

  it('should display error message on failure', async () => {
    mockNewsletterApi.subscribe.mockRejectedValueOnce(
      new Error('Email already subscribed')
    );

    render(<NewsletterForm />);

    const input = screen.getByPlaceholderText('seu@email.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Se inscrever'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email already subscribed');
    });
  });

  it('should disable button during submission', async () => {
    mockNewsletterApi.subscribe.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<NewsletterForm />);

    const button = screen.getByText('Se inscrever');
    const input = screen.getByPlaceholderText('seu@email.com');

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(input).toBeDisabled();
  });
});
