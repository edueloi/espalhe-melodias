import { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth';
import { ROLE_PERMISSIONS, type Permission } from '../types/domain';

/**
 * Verifica se o usuário logado tem uma permission específica.
 * Uso: router.get('/...', authenticate, can('materials:write'), controller)
 */
export function can(permission: Permission) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Não autenticado.' });
      return;
    }

    const perms = ROLE_PERMISSIONS[req.user.role] ?? [];
    if (!perms.includes(permission)) {
      res.status(403).json({
        success: false,
        message: `Permissão insuficiente: ${permission}`,
      });
      return;
    }

    next();
  };
}

/** Retorna as permissions do role atual (usado no /me endpoint). */
export function getPermissionsForRole(role: keyof typeof ROLE_PERMISSIONS): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
