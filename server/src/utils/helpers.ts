import { v4 as uuidv4 } from 'uuid';

export const newId = (): string => uuidv4();

export const nowISO = (): string => new Date().toISOString().slice(0, 19).replace('T', ' ');

/**
 * Compara uma data "ingênua" (coluna DATE, ex: "YYYY-MM-DD") com o dia atual,
 * sem passar por `new Date(string)` — que interpretaria a string como UTC e
 * poderia deslocar o dia ao comparar com o horário local do servidor.
 */
export function isDateBeforeToday(dateOnly: string): boolean {
  const [y, m, d] = dateOnly.split('-').map(Number);
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return new Date(y, m - 1, d) < todayOnly;
}

/** Remove campos sensíveis de um user row antes de enviar ao cliente. */
export function sanitizeUser<T extends {
  password_hash?: string; passwordHash?: string;
  reset_token?: string | null; reset_token_expires?: string | null;
}>(
  user: T,
): Omit<T, 'password_hash' | 'passwordHash' | 'reset_token' | 'reset_token_expires'> {
  const { password_hash, passwordHash, reset_token, reset_token_expires, ...safe } = user;
  void password_hash; void passwordHash; void reset_token; void reset_token_expires;
  return safe;
}

/** Parseia colunas JSON vindas do MySQL (que chegam como string ou objeto). */
export function parseJson<T = unknown>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value as T;
  try { return JSON.parse(value as string) as T; }
  catch { return fallback; }
}
