import path from 'path';
import fs from 'fs';
import { Response } from 'express';
import multer from 'multer';
import { execute, queryOne } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { nowISO } from '../utils/helpers';
import type { AuthRequest } from '../middleware/auth';

// ─── Pasta de uploads ──────────────────────────────────────────────────────────

export const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'avatars');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── Multer config ─────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (_req: AuthRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Somente imagens JPEG, PNG, WEBP ou GIF são permitidas.', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function deleteFileIfLocal(avatarUrl: string | undefined | null): void {
  if (!avatarUrl) return;
  try {
    let pathname: string;

    if (avatarUrl.startsWith('/uploads/')) {
      // Caminho relativo — formato novo
      pathname = avatarUrl;
    } else {
      // URL absoluta — formato antigo (http://localhost:3001/uploads/...)
      const parsed = new URL(avatarUrl);
      pathname = parsed.pathname;
    }

    if (pathname.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), pathname);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  } catch {
    // URL inválida — ignora
  }
}

// ─── POST /upload/avatar ───────────────────────────────────────────────────────

export async function uploadAvatar(req: AuthRequest, res: Response): Promise<void> {
  if (!req.file) throw new AppError('Nenhum arquivo enviado.', 400);

  const userId = req.user!.userId;
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  // Busca avatar anterior para deletar depois de salvar o novo
  const row = await queryOne<{ avatar: string | null }>('SELECT avatar FROM users WHERE id = ?', [userId]);

  await execute('UPDATE users SET avatar = ?, updated_at = ? WHERE id = ?', [avatarUrl, nowISO(), userId]);

  // Deleta arquivo anterior se era local
  deleteFileIfLocal(row?.avatar ?? null);

  res.json({ success: true, data: { avatarUrl } });
}

// ─── DELETE /upload/avatar ─────────────────────────────────────────────────────

export async function deleteAvatar(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;

  const row = await queryOne<{ avatar: string | null }>('SELECT avatar FROM users WHERE id = ?', [userId]);
  if (!row) throw new AppError('Usuário não encontrado.', 404);

  deleteFileIfLocal(row.avatar ?? null);

  await execute('UPDATE users SET avatar = NULL, updated_at = ? WHERE id = ?', [nowISO(), userId]);

  res.json({ success: true, message: 'Foto removida.' });
}
