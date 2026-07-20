import { useEffect } from 'react';

export interface DocumentMetaInput {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  author?: string;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Atualiza document.title, meta tags (description/OG/Twitter) e JSON-LD via DOM.
 * Cobre navegação client-side e crawlers que executam JS; bots simples são
 * atendidos pelo HTML estático servido em server/src/routes/blogSeo.ts.
 */
export function useDocumentMeta(input: DocumentMetaInput | null): void {
  useEffect(() => {
    if (!input) return;

    const previousTitle = document.title;
    document.title = `${input.title} | Espalhe Melodias`;

    if (input.description) {
      upsertMeta('name', 'description', input.description);
      upsertMeta('property', 'og:description', input.description);
      upsertMeta('name', 'twitter:description', input.description);
    }
    upsertMeta('property', 'og:title', input.title);
    upsertMeta('name', 'twitter:title', input.title);
    upsertMeta('property', 'og:type', input.type ?? 'website');
    if (input.image) {
      upsertMeta('property', 'og:image', input.image);
      upsertMeta('name', 'twitter:image', input.image);
      upsertMeta('name', 'twitter:card', 'summary_large_image');
    }
    if (input.url) upsertMeta('property', 'og:url', input.url);

    let ldScript = document.querySelector<HTMLScriptElement>('script[data-doc-meta-ld]');
    if (input.type === 'article') {
      if (!ldScript) {
        ldScript = document.createElement('script');
        ldScript.type = 'application/ld+json';
        ldScript.setAttribute('data-doc-meta-ld', 'true');
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: input.title,
        description: input.description,
        image: input.image ? [input.image] : undefined,
        datePublished: input.publishedAt,
        author: input.author ? { '@type': 'Person', name: input.author } : undefined,
        publisher: { '@type': 'Organization', name: 'Espalhe Melodias' },
      });
    } else if (ldScript) {
      ldScript.remove();
    }

    return () => {
      document.title = previousTitle;
    };
  }, [input]);
}
