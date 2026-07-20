import { Router, Request, Response, NextFunction } from 'express';
import { queryOne } from '../config/db';
import { config } from '../config';

const router = Router();

const BOT_RE = /bot|crawl|slurp|spider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram/i;

function esc(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${config.appUrl.replace(/\/$/, '')}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

// ─── GET /blog/:slug — HTML estático para bots, transparente para navegadores ──

router.get('/:slug', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const ua = req.headers['user-agent'] ?? '';
  if (!BOT_RE.test(ua)) { next(); return; }

  const slug = req.params.slug;
  const post = await queryOne<Record<string, unknown>>(
    `SELECT p.*, c.name AS category_name
     FROM blog_posts p
     LEFT JOIN blog_categories c ON c.id = p.category_id
     WHERE (p.slug = ? OR p.id = ?) AND p.status = 'published'`,
    [slug, slug],
  ).catch(() => null);

  if (!post) { next(); return; }

  const title = esc(post.seo_title || post.title);
  const description = esc(post.seo_description || post.excerpt || '');
  const image = post.og_image_url || post.image_url;
  const url = absoluteUrl(`/blog/${post.slug}`);
  const publishedAt = post.published_at ? new Date(String(post.published_at)).toISOString() : undefined;
  const updatedAt = post.updated_at ? new Date(String(post.updated_at)).toISOString() : undefined;

  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: String(post.title ?? ''),
    description: String(post.excerpt ?? ''),
    image: image ? [String(image)] : undefined,
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: { '@type': 'Person', name: String(post.author_name ?? '') },
    publisher: { '@type': 'Organization', name: 'Espalhe Melodias' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title} | Espalhe Melodias</title>
  <meta name="description" content="${description}"/>
  <meta name="robots" content="index,follow"/>
  <link rel="canonical" href="${url}"/>

  <meta property="og:type" content="article"/>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${description}"/>
  ${image ? `<meta property="og:image" content="${esc(image)}"/>` : ''}
  <meta property="og:url" content="${url}"/>
  <meta property="og:site_name" content="Espalhe Melodias"/>
  <meta property="og:locale" content="pt_BR"/>
  ${post.category_name ? `<meta property="article:section" content="${esc(post.category_name)}"/>` : ''}
  ${publishedAt ? `<meta property="article:published_time" content="${publishedAt}"/>` : ''}
  ${updatedAt ? `<meta property="article:modified_time" content="${updatedAt}"/>` : ''}

  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${title}"/>
  <meta name="twitter:description" content="${description}"/>
  ${image ? `<meta name="twitter:image" content="${esc(image)}"/>` : ''}

  <script type="application/ld+json">${structuredData}</script>
</head>
<body>
  <article>
    <h1>${title}</h1>
    ${post.category_name ? `<p>${esc(post.category_name)}</p>` : ''}
    <p>${esc(post.author_name)}</p>
    ${image ? `<img src="${esc(image)}" alt="${title}"/>` : ''}
    <p>${description}</p>
  </article>
</body>
</html>`);
});

export default router;
