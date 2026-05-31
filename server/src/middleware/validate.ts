import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/** Extrai erros do express-validator e retorna 422 se houver falhas. */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Dados inválidos.',
      errors: errors.array().map(e => ({
        field: e.type === 'field' ? (e as { path: string }).path : 'unknown',
        message: e.msg as string,
      })),
    });
    return;
  }
  next();
}
