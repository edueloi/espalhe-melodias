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

// ─── Newsletter & Contact Form Validators ──────────────────────────────────

/**
 * Valida e formata número de telefone (Brasil - formato 11 99999-9999 ou 11 9999-9999)
 */
export function validateAndFormatPhone(phone: string): string | null {
  if (!phone) return null;

  // Remove espaços, hífens, parênteses
  const cleaned = phone.replace(/[\s\-().]/g, '');

  // Deve ter 10 ou 11 dígitos
  if (!/^\d{10,11}$/.test(cleaned)) return null;

  // Formata como (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

/**
 * Valida subject da mensagem de contato
 */
export function validateSubject(subject: string): boolean {
  const cleaned = subject.trim();
  return cleaned.length >= 5 && cleaned.length <= 200;
}

/**
 * Valida mensagem de contato
 */
export function validateMessage(message: string): boolean {
  const cleaned = message.trim();
  return cleaned.length >= 10 && cleaned.length <= 5000;
}

/**
 * Remove scripts e HTML perigoso da mensagem
 */
export function sanitizeMessage(message: string): string {
  let cleaned = message
    // Remove scripts
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();

  return cleaned;
}

/**
 * Verifica se email parece spam
 */
export function isLikelySpam(message: string, subject: string): boolean {
  const urlCount = (message.match(/https?:\/\//gi) || []).length;
  const spamKeywords = ['bitcoin', 'viagra', 'casino', 'lottery', 'inheritance', 'click here', 'buy now'];

  const combinedText = (message + ' ' + subject).toLowerCase();

  // Mais de 3 URLs
  if (urlCount > 3) return true;

  // Contém 2+ keywords de spam
  const keywordMatches = spamKeywords.filter((kw) => combinedText.includes(kw)).length;
  if (keywordMatches >= 2) return true;

  // Excesivamente repetido
  if (/(.)\1{9,}/.test(message)) return true;

  return false;
}

/**
 * Normaliza email
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Normaliza nome
 */
export function normalizeName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
