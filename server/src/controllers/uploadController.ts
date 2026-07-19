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
export const GALLERY_UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'gallery');
export const MATERIALS_UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'materials');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(GALLERY_UPLOADS_DIR)) {
  fs.mkdirSync(GALLERY_UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(MATERIALS_UPLOADS_DIR)) {
  fs.mkdirSync(MATERIALS_UPLOADS_DIR, { recursive: true });
}

// ─── Multer config ─────────────────────────────────────────────────────────────

const fileFilter = (_req: AuthRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Somente imagens JPEG, PNG, WEBP ou GIF são permitidas.', 400));
  }
};

function makeUniqueFilename(originalname: string): string {
  const ext = path.extname(originalname).toLowerCase();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, makeUniqueFilename(file.originalname)),
});

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const galleryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, GALLERY_UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, makeUniqueFilename(file.originalname)),
});

export const uploadGallery = multer({
  storage: galleryStorage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});

// Materiais de apoio: PDF, áudio, e-books (epub) e imagens (infográficos)
export const MATERIAL_MAX_SIZE_MB = 20;

const materialFileFilter = (_req: AuthRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /^(application\/pdf|application\/epub\+zip|audio\/(mpeg|mp3|wav|ogg|m4a|x-m4a)|image\/(jpeg|png|webp|gif))$/;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Formato não suportado. Envie PDF, e-book (EPUB), áudio (MP3/WAV/OGG) ou imagem.', 400));
  }
};

const materialStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, MATERIALS_UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, makeUniqueFilename(file.originalname)),
});

export const uploadMaterial = multer({
  storage: materialStorage,
  fileFilter: materialFileFilter,
  limits: { fileSize: MATERIAL_MAX_SIZE_MB * 1024 * 1024 },
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

// ─── POST /upload/gallery-photo ────────────────────────────────────────────────

export async function uploadGalleryPhoto(req: AuthRequest, res: Response): Promise<void> {
  if (!req.file) throw new AppError('Nenhum arquivo enviado.', 400);

  const imageUrl = `/uploads/gallery/${req.file.filename}`;
  res.json({ success: true, data: { imageUrl } });
}

export function deleteGalleryFileIfLocal(imageUrl: string | undefined | null): void {
  deleteFileIfLocal(imageUrl);
}

// ─── POST /upload/material ─────────────────────────────────────────────────────

export async function uploadMaterialFile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.file) throw new AppError('Nenhum arquivo enviado.', 400);

  const fileUrl = `/uploads/materials/${req.file.filename}`;
  res.json({
    success: true,
    data: {
      fileUrl,
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
      mimeType: req.file.mimetype,
    },
  });
}

export function deleteMaterialFileIfLocal(fileUrl: string | undefined | null): void {
  deleteFileIfLocal(fileUrl);
}
