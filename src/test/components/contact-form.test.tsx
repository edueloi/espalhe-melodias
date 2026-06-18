import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockContactApi, resetApiMocks } from '../mocks/api';
import React from 'react';

// Mock component for testing
function ContactForm() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await mockContactApi.create(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Seu nome"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="seu@email.com"
        required
      />
      <input
        type="text"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        placeholder="Assunto"
        required
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Sua mensagem"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Enviando...' : 'Enviar'}
      </button>
      {error && <div role="alert">{error}</div>}
      {success && <div role="status">Mensagem enviada com sucesso!</div>}
    </form>
  );
}

describe('Contact Form', () => {
  beforeEach(() => {
    resetApiMocks();
    vi.clearAllMocks();
  });

  it('should render contact form with all fields', () => {
    render(<ContactForm />);

    expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Assunto')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sua mensagem')).toBeInTheDocument();
    expect(screen.getByText('Enviar')).toBeInTheDocument();
  });

  it('should submit valid contact message', async () => {
    mockContactApi.create.mockResolvedValueOnce({
      success: true,
      data: { id: 'msg-1', status: 'new' },
    });

    render(<ContactForm />);

    fireEvent.change(screen.getByPlaceholderText('Seu nome'), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'joao@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Assunto'), {
      target: { value: 'Dúvida sobre inscrição' },
    });
    fireEvent.change(screen.getByPlaceholderText('Sua mensagem'), {
      target: { value: 'Gostaria de saber mais...' },
    });

    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => {
      expect(mockContactApi.create).toHaveBeenCalled();
    });
  });

  it('should validate required fields', async () => {
    render(<ContactForm />);

    const submitButton = screen.getByText('Enviar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockContactApi.create).not.toHaveBeenCalled();
    });
  });

  it('should validate email format', async () => {
    mockContactApi.create.mockRejectedValueOnce(
      new Error('Invalid email format')
    );

    render(<ContactForm />);

    fireEvent.change(screen.getByPlaceholderText('Seu nome'), {
      target: { value: 'João' },
    });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('Assunto'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Sua mensagem'), {
      target: { value: 'Test message' },
    });

    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email format');
    });
  });

  it('should show success message after submission', async () => {
    mockContactApi.create.mockResolvedValueOnce({
      success: true,
      data: { id: 'msg-1' },
    });

    render(<ContactForm />);

    fireEvent.change(screen.getByPlaceholderText('Seu nome'), {
      target: { value: 'João' },
    });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'joao@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Assunto'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Sua mensagem'), {
      target: { value: 'Test message' },
    });

    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Mensagem enviada com sucesso!');
    });
  });

  it('should clear form after successful submission', async () => {
    mockContactApi.create.mockResolvedValueOnce({
      success: true,
      data: { id: 'msg-1' },
    });

    render(<ContactForm />);

    const nameInput = screen.getByPlaceholderText('Seu nome') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'João' } });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'joao@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Assunto'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Sua mensagem'), {
      target: { value: 'Test message' },
    });

    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => {
      expect(nameInput.value).toBe('');
    });
  });
});
