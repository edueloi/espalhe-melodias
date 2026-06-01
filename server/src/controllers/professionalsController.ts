import { Response } from 'express';
import { query, queryOne, execute } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { newId, nowISO, parseJson } from '../utils/helpers';
import { getPagination, buildMeta } from '../utils/paginate';
import type { AuthRequest } from '../middleware/auth';

function toNumber(value: unknown, fallback = 0): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export async function listProfessionals(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = getPagination(req);
  const { specialty, search } = req.query as Record<string, string | undefined>;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (specialty && specialty !== 'Todos') {
    conditions.push('JSON_CONTAINS(p.specialties, ?)');
    params.push(JSON.stringify(specialty));
  }
  if (search) {
    conditions.push('(u.name LIKE ? OR p.bio LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total
     FROM professional_profiles p
     JOIN users u ON u.id = p.user_id AND u.approval_status = 'approved'
     ${where}`, params,
  );

  const rows = await query<Record<string, unknown>>(
    `SELECT p.*, u.name, u.email, u.avatar, u.role
     FROM professional_profiles p
     JOIN users u ON u.id = p.user_id AND u.approval_status = 'approved'
     ${where}
     ORDER BY p.rating DESC, p.reviews_count DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const data = rows.map(r => ({
    ...r,
    specialties:  parseJson<string[]>(r.specialties, []),
    services:     parseJson<string[]>(r.services, []),
    schedule:     parseJson(r.schedule, []),
    languages:    parseJson<string[]>(r.languages, []),
    extra_links:  parseJson(r.extra_links, []),
    price_per_session: toNumber(r.price_per_session),
    rating:        toNumber(r.rating),
    reviews_count: toNumber(r.reviews_count),
  }));

  res.json({ success: true, data, meta: buildMeta(countRow?.total ?? 0, { page, limit, offset }) });
}

export async function getProfessional(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const row = await queryOne<Record<string, unknown>>(
    `SELECT p.*, u.name, u.email, u.avatar, u.role
     FROM professional_profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = ? OR p.user_id = ?`,
    [id, id],
  );
  if (!row) throw new AppError('Profissional não encontrado.', 404);

  res.json({
    success: true,
    data: {
      ...row,
      specialties:  parseJson<string[]>(row.specialties, []),
      services:     parseJson<string[]>(row.services, []),
      schedule:     parseJson(row.schedule, []),
      languages:    parseJson<string[]>(row.languages, []),
      extra_links:  parseJson(row.extra_links, []),
      price_per_session: toNumber(row.price_per_session),
      rating:        toNumber(row.rating),
      reviews_count: toNumber(row.reviews_count),
    },
  });
}

export async function checkSlug(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);
  const { slug } = req.query as { slug?: string };
  if (!slug) throw new AppError('Parâmetro slug é obrigatório.', 400);

  const clean = slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) {
    res.json({ available: false, reason: 'Slug inválido. Use apenas letras, números e hífens.' });
    return;
  }

  const existing = await queryOne<{ user_id: string }>(
    'SELECT user_id FROM professional_profiles WHERE slug = ?', [clean],
  );

  if (!existing || existing.user_id === req.user.userId) {
    res.json({ available: true, slug: clean });
  } else {
    res.json({ available: false, reason: 'Este endereço já está em uso por outro profissional.' });
  }
}

export async function upsertProfessional(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Não autenticado.', 401);

  const {
    name, crp, specialties, bio, pricePerSession, contactWhatsapp,
    services, schedule, location, accentColor, theme, languages,
    instagram, linkedin, facebook, tiktok, twitter, website, extraLinks, slug,
  } = req.body as {
    name?: string; crp: string; specialties: string[]; bio: string; pricePerSession: number;
    contactWhatsapp?: string; services: string[]; schedule: unknown[];
    location: string; accentColor?: string; theme?: string; languages: string[];
    instagram?: string; linkedin?: string; facebook?: string;
    tiktok?: string; twitter?: string; website?: string;
    extraLinks?: Array<{ label: string; url: string }>; slug?: string;
  };

  // Valida slug se fornecido
  let cleanSlug: string | null = null;
  if (slug) {
    cleanSlug = slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      throw new AppError('Slug inválido. Use apenas letras, números e hífens.', 400);
    }
    const conflict = await queryOne<{ user_id: string }>(
      'SELECT user_id FROM professional_profiles WHERE slug = ? AND user_id != ?',
      [cleanSlug, req.user.userId],
    );
    if (conflict) throw new AppError('Este endereço já está em uso por outro profissional.', 409);
  }

  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM professional_profiles WHERE user_id = ?', [req.user.userId],
  );

  const now = nowISO();

  if (name) {
    await execute(
      'UPDATE users SET name = ?, updated_at = ? WHERE id = ?',
      [name, now, req.user.userId],
    );
  }

  if (existing) {
    await execute(
      `UPDATE professional_profiles SET
         slug              = COALESCE(?, slug),
         crp               = COALESCE(?, crp),
         specialties       = COALESCE(?, specialties),
         bio               = COALESCE(?, bio),
         price_per_session = COALESCE(?, price_per_session),
         contact_whatsapp  = COALESCE(?, contact_whatsapp),
         services          = COALESCE(?, services),
         schedule          = COALESCE(?, schedule),
         location          = COALESCE(?, location),
         accent_color      = COALESCE(?, accent_color),
         theme             = COALESCE(?, theme),
         languages         = COALESCE(?, languages),
         instagram         = COALESCE(?, instagram),
         linkedin          = COALESCE(?, linkedin),
         facebook          = COALESCE(?, facebook),
         tiktok            = COALESCE(?, tiktok),
         twitter           = COALESCE(?, twitter),
         website           = COALESCE(?, website),
         extra_links       = COALESCE(?, extra_links),
         updated_at        = ?
       WHERE user_id = ?`,
      [
        cleanSlug ?? null,
        crp ?? null, specialties ? JSON.stringify(specialties) : null, bio ?? null,
        pricePerSession ?? null, contactWhatsapp ?? null,
        services ? JSON.stringify(services) : null,
        schedule ? JSON.stringify(schedule) : null,
        location ?? null, accentColor ?? null, theme ?? null,
        languages ? JSON.stringify(languages) : null,
        instagram ?? null, linkedin ?? null, facebook ?? null,
        tiktok ?? null, twitter ?? null, website ?? null,
        extraLinks ? JSON.stringify(extraLinks) : null,
        now, req.user.userId,
      ],
    );
    res.json({ success: true, message: 'Perfil atualizado.' });
  } else {
    const id = newId();
    await execute(
      `INSERT INTO professional_profiles
       (id, user_id, slug, crp, specialties, bio, price_per_session, contact_whatsapp,
        services, schedule, location, accent_color, theme, languages,
        instagram, linkedin, facebook, tiktok, twitter, website, extra_links,
        created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, req.user.userId, cleanSlug ?? null,
        crp, JSON.stringify(specialties), bio, pricePerSession,
        contactWhatsapp ?? null, JSON.stringify(services), JSON.stringify(schedule),
        location, accentColor ?? null, theme ?? null, JSON.stringify(languages),
        instagram ?? null, linkedin ?? null, facebook ?? null,
        tiktok ?? null, twitter ?? null, website ?? null,
        extraLinks ? JSON.stringify(extraLinks) : null,
        now, now,
      ],
    );
    res.status(201).json({ success: true, data: { id } });
  }
}
