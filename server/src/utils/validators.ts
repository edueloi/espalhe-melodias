/**
 * Funções de validação de dados
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export function validatePhone(phone: string): boolean {
  // Remove caracteres especiais
  const cleaned = phone.replace(/\D/g, '');
  // Aceita 10-11 dígitos (brasileiro)
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: 'Mínimo 8 caracteres' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Precisa de letra maiúscula' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Precisa de letra minúscula' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Precisa de número' };
  return { valid: true };
}
