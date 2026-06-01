import { Router, Request, Response } from 'express';
import { queryOne } from '../config/db';
import { parseJson } from '../utils/helpers';

const router = Router();

// ─── API JSON pública (sem autenticação) ─────────────────────────────────────
// GET /profissional/api/:slug  →  JSON com dados do profissional

router.get('/api/:slug', async (req: Request, res: Response): Promise<void> => {
  const slug = req.params.slug;

  const row = await queryOne<Record<string, unknown>>(
    `SELECT p.*, u.name, u.email, u.avatar
     FROM professional_profiles p
     JOIN users u ON u.id = p.user_id AND u.approval_status = 'approved'
     WHERE p.slug = ? OR p.id = ? OR p.user_id = ?`,
    [slug, slug, slug],
  ).catch(() => null);

  if (!row) {
    res.status(404).json({ success: false, message: 'Profissional não encontrado.' });
    return;
  }

  res.json({
    success: true,
    data: {
      ...row,
      specialties:  parseJson<string[]>(row.specialties, []),
      services:     parseJson<string[]>(row.services, []),
      schedule:     parseJson(row.schedule, []),
      languages:    parseJson<string[]>(row.languages, []),
      extra_links:  parseJson(row.extra_links, []),
      price_per_session: Number(row.price_per_session) || 0,
      rating:        Number(row.rating) || 0,
      reviews_count: Number(row.reviews_count) || 0,
    },
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// Paletas dos 4 temas — espelham as definidas no frontend
const THEMES: Record<string, { bannerFrom: string; bannerMid: string; bannerTo: string; accent: string; pageBg: string }> = {
  forest: { bannerFrom: '#1a2412', bannerMid: '#2d3a1e', bannerTo: '#5a6242', accent: '#5a6242', pageBg: '#f5ece1' },
  ocean:  { bannerFrom: '#0a1628', bannerMid: '#0e3460', bannerTo: '#0891b2', accent: '#0891b2', pageBg: '#e0f2fe' },
  rose:   { bannerFrom: '#3b0a18', bannerMid: '#7c1d3a', bannerTo: '#be4a6d', accent: '#be4a6d', pageBg: '#ffe4ec' },
  gold:   { bannerFrom: '#1c1000', bannerMid: '#5a3800', bannerTo: '#c8860a', accent: '#c8860a', pageBg: '#fff3d0' },
};

function getThemeColors(theme: string | undefined, accentColor: string | undefined) {
  if (theme && THEMES[theme]) return THEMES[theme];
  const accent = accentColor ?? '#5a6242';
  return { ...THEMES.forest, accent, bannerTo: accent };
}

// ─── Rota pública do profissional com SEO ────────────────────────────────────

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  // Busca sem authenticate (perfil público) — aceita UUID (id ou user_id) ou slug
  const row = await queryOne<Record<string, unknown>>(
    `SELECT p.*, u.name, u.email, u.avatar
     FROM professional_profiles p
     JOIN users u ON u.id = p.user_id AND u.approval_status = 'approved'
     WHERE p.slug = ? OR p.id = ? OR p.user_id = ?`,
    [id, id, id],
  ).catch(() => null);

  // Se não encontrar, serve a SPA e ela mostra o estado de erro
  if (!row) {
    serveAppShell(res, 'Profissional não encontrado', '', '#5a6242', '#f5ece1', id);
    return;
  }

  const name        = esc(row.name);
  const crp         = esc(row.crp);
  const bio         = esc(row.bio ?? '');
  const location    = esc(row.location ?? '');
  const avatar      = esc(row.avatar ?? '');
  const specialties = parseJson<string[]>(row.specialties, []).join(', ');
  const price       = toNum(row.price_per_session);
  const rating      = toNum(row.rating);
  const theme       = String(row.theme ?? '');
  const accentColor = String(row.accent_color ?? '');
  const colors      = getThemeColors(theme, accentColor);

  const title       = `${name}${crp ? ` — ${crp}` : ''} | Espalhe Melodias`;
  const description = bio
    ? bio.slice(0, 155)
    : `${name}${specialties ? ` — ${specialties}` : ''}${location ? ` em ${location}` : ''}. Profissional verificado na rede Espalhe Melodias.`;

  const fmtPrice = price > 0
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(price)
    : '';

  const starRating = rating > 0 ? `⭐ ${rating.toFixed(1)} ` : '';

  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: String(row.name ?? ''),
    description: String(row.bio ?? ''),
    image: String(row.avatar ?? ''),
    jobTitle: specialties || 'Psicólogo(a)',
    address: location ? { '@type': 'PostalAddress', addressLocality: String(row.location ?? '') } : undefined,
    memberOf: { '@type': 'Organization', name: 'Rede Espalhe Melodias' },
  });

  // Detecta User-Agent de crawler — crawlers recebem HTML rico mas sem JS necessário
  const ua = req.headers['user-agent'] ?? '';
  const isCrawler = /bot|crawl|slurp|spider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram/i.test(ua);

  // Para crawlers, serve HTML completo estático sem JS.
  // Para browsers, serve a SPA com as meta tags SEO injetadas.
  if (isCrawler) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(buildStaticHtml({ name, crp, bio, location, avatar, specialties, price: fmtPrice, starRating, colors, title, description, structuredData }));
  } else {
    serveAppShell(res, title, description, colors.accent, colors.pageBg, id);
  }
});

export default router;

// ─── HTML estático para crawlers ─────────────────────────────────────────────

interface StaticHtmlParams {
  name: string; crp: string; bio: string; location: string; avatar: string;
  specialties: string; price: string; starRating: string;
  colors: { bannerFrom: string; bannerMid: string; bannerTo: string; accent: string; pageBg: string };
  title: string; description: string; structuredData: string;
}

function buildStaticHtml(p: StaticHtmlParams): string {
  const { name, crp, bio, location, avatar, specialties, price, starRating, colors, title, description, structuredData } = p;
  const { bannerFrom, bannerMid, bannerTo, accent, pageBg } = colors;

  const avatarHtml = avatar
    ? `<img src="${avatar}" alt="${name}" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:4px solid #fff;box-shadow:0 8px 24px ${accent}40"/>`
    : `<div style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,${accent}40,${accent}80);color:${accent};font-size:2rem;font-weight:900;display:flex;align-items:center;justify-content:center;border:4px solid #fff;">${name.split(' ').slice(0,2).map((w: string)=>w[0]).join('').toUpperCase()}</div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
  <meta name="description" content="${description}"/>
  <meta name="robots" content="index,follow"/>

  <!-- Open Graph -->
  <meta property="og:type" content="profile"/>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${description}"/>
  ${avatar ? `<meta property="og:image" content="${avatar}"/>` : ''}
  <meta property="og:site_name" content="Espalhe Melodias"/>
  <meta property="og:locale" content="pt_BR"/>

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${title}"/>
  <meta name="twitter:description" content="${description}"/>
  ${avatar ? `<meta name="twitter:image" content="${avatar}"/>` : ''}

  <!-- Schema.org -->
  <script type="application/ld+json">${structuredData}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:${pageBg};font-family:'Plus Jakarta Sans',sans-serif;color:#1a1a1a;">

  <!-- Navbar -->
  <nav style="position:sticky;top:0;z-index:10;background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);border-bottom:1px solid ${accent}20;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,${bannerFrom},${accent});display:flex;align-items:center;justify-content:center;">
        <span style="color:#fff;font-size:12px;font-style:italic;font-weight:900;">♩</span>
      </div>
      <div>
        <div style="font-family:'Playfair Display',serif;font-size:13px;font-weight:900;color:${bannerFrom};line-height:1;">Espalhe</div>
        <div style="font-size:15px;color:${accent};line-height:1;margin-top:-2px;">Melodias</div>
      </div>
    </div>
    <a href="/diretorio" style="font-size:12px;font-weight:700;padding:8px 16px;border-radius:999px;background:${accent}18;color:${accent};text-decoration:none;border:1px solid ${accent}30;">Ver a rede →</a>
  </nav>

  <!-- Banner -->
  <div style="background:linear-gradient(135deg,${bannerFrom} 0%,${bannerMid} 40%,${bannerTo} 100%);height:200px;position:relative;overflow:hidden;">
    <span style="position:absolute;top:8%;left:6%;font-size:3rem;color:rgba(255,255,255,.09);font-family:serif;">♩</span>
    <span style="position:absolute;top:14%;right:9%;font-size:2.5rem;color:rgba(255,255,255,.09);font-family:serif;">♫</span>
    <span style="position:absolute;bottom:20%;left:45%;font-size:2rem;color:rgba(255,255,255,.07);font-family:serif;">♬</span>
  </div>

  <!-- Avatar -->
  <div style="display:flex;flex-direction:column;align-items:center;margin-top:-48px;position:relative;">
    ${avatarHtml}
  </div>

  <!-- Conteúdo -->
  <div style="max-width:540px;margin:0 auto;padding:16px 16px 48px;">

    <div style="text-align:center;margin-bottom:20px;">
      <h1 style="font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:900;color:${bannerFrom};margin:12px 0 4px;">${name}</h1>
      ${crp ? `<p style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${accent}cc;margin:0 0 8px;">${crp}</p>` : ''}
      ${starRating ? `<p style="font-size:14px;color:${accent};font-weight:700;margin:0;">${starRating}</p>` : ''}
    </div>

    ${specialties ? `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:20px;">${specialties.split(', ').map((s: string)=>`<span style="font-size:11px;font-weight:700;padding:6px 14px;border-radius:999px;background:${accent}14;color:${accent};border:1.5px solid ${accent}35;">${esc(s)}</span>`).join('')}</div>` : ''}

    ${bio ? `
    <div style="background:rgba(255,255,255,0.8);border-radius:16px;padding:20px;margin-bottom:12px;border:1px solid rgba(255,255,255,.9);">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <div style="width:4px;height:18px;border-radius:2px;background:${accent};"></div>
        <span style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:${accent};">Sobre</span>
      </div>
      <p style="font-size:14px;line-height:1.65;margin:0;color:#3d3d3d;">${bio}</p>
    </div>` : ''}

    ${(location || price) ? `
    <div style="background:rgba(255,255,255,0.8);border-radius:16px;overflow:hidden;margin-bottom:12px;border:1px solid rgba(255,255,255,.9);">
      ${location ? `<div style="display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid ${accent}12;">
        <span style="font-size:16px;">📍</span>
        <span style="font-size:14px;font-weight:600;color:#2d2d2d;">${location}</span>
      </div>` : ''}
      ${price ? `<div style="display:flex;align-items:center;gap:12px;padding:14px 20px;">
        <span style="font-size:16px;">💰</span>
        <span style="font-size:14px;font-weight:700;color:${accent};">${price}<span style="font-weight:400;font-size:12px;color:#888;"> / sessão</span></span>
      </div>` : ''}
    </div>` : ''}

    <!-- Badge Melodias -->
    <div style="border-radius:16px;overflow:hidden;margin-bottom:16px;">
      <div style="background:linear-gradient(135deg,${bannerFrom},${bannerMid},${bannerTo});padding:16px 20px;display:flex;align-items:center;gap:16px;">
        <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid rgba(255,255,255,.25);">
          <span style="font-size:22px;color:#fff;font-style:italic;">♩</span>
        </div>
        <div>
          <div style="color:#fff;font-weight:900;font-size:14px;margin-bottom:2px;">Rede Espalhe Melodias ✅</div>
          <div style="color:rgba(255,255,255,.55);font-size:11px;">Profissional verificado · Membro ativo</div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,.1);padding:12px 20px;">
        <p style="font-size:11px;color:rgba(255,255,255,.5);margin:0;line-height:1.6;">
          Este profissional é membro verificado da comunidade <strong style="color:rgba(255,255,255,.7);">Espalhe Melodias</strong> — uma rede comprometida com saúde mental e conexões humanas.
        </p>
      </div>
    </div>

  </div>
</body>
</html>`;
}

// ─── SPA shell para browsers normais ─────────────────────────────────────────

function serveAppShell(res: Response, title: string, description: string, _accent: string, pageBg: string, _id: string): void {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  // Injeta meta tags SEO no shell da SPA para que apareçam no source
  // O frontend React hidrata por cima normalmente
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
  <meta name="description" content="${description}"/>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:type" content="profile"/>
  <meta property="og:site_name" content="Espalhe Melodias"/>
  <meta name="twitter:card" content="summary"/>
  <meta name="twitter:title" content="${title}"/>
  <meta name="twitter:description" content="${description}"/>
  <style>body{margin:0;background:${pageBg};}</style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`);
}
