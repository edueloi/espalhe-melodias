import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { TokenPayload, UserRole } from '../types/domain';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token de acesso não informado.' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret) as TokenPayload;
    req.user = payload;
    next();
  } catch (err) {
    const expired = err instanceof jwt.TokenExpiredError;
    res.status(401).json({
      success: false,
      message: expired ? 'Token expirado.' : 'Token inválido.',
    });
  }
}

/** Verifica se o usuário tem pelo menos um dos roles informados. */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Não autenticado.' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Acesso negado. Requer: ${roles.join(' ou ')}.`,
      });
      return;
    }
    next();
  };
}

/** Super-admin only. */
export const superAdminOnly = requireRole('super-admin');

/** Professional ou super-admin. */
export const professionalOrAdmin = requireRole('super-admin', 'professional');
