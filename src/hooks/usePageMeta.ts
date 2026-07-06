import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description: string;
  /** Ruta canónica ('/servicios/fotografia'). Por defecto usa la ruta actual. */
  canonicalPath?: string;
  /** Imagen para og:image / twitter:image. Por defecto la og-image del sitio. */
  image?: string;
  /** Si true, emite robots="noindex, follow" (404, demos). */
  noindex?: boolean;
  /** og:type ('website' | 'article' | ...). Por defecto 'website'. */
  ogType?: string;
  /** ISO date del post: emite article:published_time (solo con ogType 'article'). */
  articlePublishedTime?: string;
  /** ISO date de última edición: emite article:modified_time. */
  articleModifiedTime?: string;
  /** Structured data (schema.org). Se inyecta como <script type="application/ld+json">. */
  jsonLd?: object | object[];
}

const CANONICAL_ORIGIN = 'https://artifex.click';
const DEFAULT_OG_IMAGE = `${CANONICAL_ORIGIN}/og-image.png`;
const JSONLD_ATTR = 'data-page-jsonld';
const META_DESCRIPTION_MAX = 160;

// Google truncates snippets around 160 chars. Trim at a word boundary and add
// an ellipsis so long post summaries don't get cut mid-word in results. The
// full text still lives in the visible page and the JSON-LD description.
const truncateForMeta = (text: string): string => {
  // Spread por code points para no partir un par surrogate (emoji) al cortar.
  const chars = [...text];
  if (chars.length <= META_DESCRIPTION_MAX) return text;
  const slice = chars.slice(0, META_DESCRIPTION_MAX - 1).join('');
  const lastSpace = slice.lastIndexOf(' ');
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : slice.length).trimEnd()}…`;
};

// Crea o actualiza una <meta>. El selector distingue Open Graph (property=)
// de las etiquetas name= estándar, así no duplicamos las que index.html declara.
const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

// Como upsertMeta, pero si content es undefined elimina la etiqueta: evita que
// una meta condicional (article:*) quede pegada al navegar a otra página.
const upsertOrRemoveMeta = (attr: 'name' | 'property', key: string, content?: string) => {
  if (content === undefined) {
    document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
    return;
  }
  upsertMeta(attr, key, content);
};

// index.html declara las twitter:* con property=; Google/algunos crawlers usan
// name=. Reusamos la etiqueta exista con el atributo que sea, y solo creamos
// una nueva (con name=) si no hay ninguna: evita el par duplicado property/name.
const upsertTwitter = (key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[property="twitter:${key}"], meta[name="twitter:${key}"]`,
  );
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', `twitter:${key}`);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

// SEO por ruta en una SPA: muta las etiquetas que index.html ya declara.
// Cubre document.title (pestañas/historial) y a Googlebot, que sí ejecuta JS.
// El prerender captura este mismo estado por página en el HTML servido.
export const usePageMeta = ({
  title,
  description,
  canonicalPath,
  image,
  noindex,
  ogType,
  articlePublishedTime,
  articleModifiedTime,
  jsonLd,
}: PageMeta) => {
  // Serializado como dependencia del effect: evita re-runs cuando la página
  // recrea el objeto jsonLd en cada render con el mismo contenido.
  const jsonLdSerialized = jsonLd
    ? JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : null;

  useEffect(() => {
    document.title = title;

    const path = canonicalPath ?? window.location.pathname;
    const url = `${CANONICAL_ORIGIN}${path === '/' ? '/' : path}`;
    const ogImage = image ?? DEFAULT_OG_IMAGE;
    const type = ogType ?? 'website';
    const metaDesc = truncateForMeta(description);

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', metaDesc);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);

    // Open Graph: la mayoría de los crawlers sociales no ejecutan JS, pero el
    // prerender congela estas etiquetas por página para que sí las lean.
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', metaDesc);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:type', type);

    // article:* solo tiene sentido en og:type article (posts del blog). Se
    // upsertean si vienen y se limpian al navegar a una página que no los pasa,
    // así una ruta 'website' no hereda la fecha del post anterior.
    upsertOrRemoveMeta('property', 'article:published_time', articlePublishedTime);
    upsertOrRemoveMeta('property', 'article:modified_time', articleModifiedTime);

    upsertTwitter('title', title);
    upsertTwitter('description', metaDesc);
    upsertTwitter('image', ogImage);

    // Indexable pages keep max-image-preview:large so Google can show the photo
    // work full-size in results (matters for "Ramiro fotografía").
    upsertMeta(
      'name',
      'robots',
      noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    );

    // JSON-LD por página: limpiar los de la página anterior antes de inyectar
    document.head.querySelectorAll(`script[${JSONLD_ATTR}]`).forEach((s) => s.remove());
    if (jsonLdSerialized) {
      for (const item of JSON.parse(jsonLdSerialized) as object[]) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute(JSONLD_ATTR, '');
        script.textContent = JSON.stringify(item);
        document.head.appendChild(script);
      }
    }

    return () => {
      // Una página sin jsonLd no debe heredar el de la anterior
      document.head.querySelectorAll(`script[${JSONLD_ATTR}]`).forEach((s) => s.remove());
    };
  }, [
    title,
    description,
    canonicalPath,
    image,
    noindex,
    ogType,
    articlePublishedTime,
    articleModifiedTime,
    jsonLdSerialized,
  ]);
};
