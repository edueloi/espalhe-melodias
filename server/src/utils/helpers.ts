import { v4 as uuidv4 } from 'uuid';

export const newId = (): string => uuidv4();

export const nowISO = (): string => new Date().toISOString().slice(0, 19).replace('T', ' ');

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
