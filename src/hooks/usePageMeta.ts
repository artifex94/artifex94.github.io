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
  /** Structured data (schema.org). Se inyecta como <script type="application/ld+json">. */
  jsonLd?: object | object[];
}

const CANONICAL_ORIGIN = 'https://artifex.click';
const DEFAULT_OG_IMAGE = `${CANONICAL_ORIGIN}/og-image.png`;
const JSONLD_ATTR = 'data-page-jsonld';

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

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', description);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);

    // Open Graph: la mayoría de los crawlers sociales no ejecutan JS, pero el
    // prerender congela estas etiquetas por página para que sí las lean.
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:type', type);

    upsertTwitter('title', title);
    upsertTwitter('description', description);
    upsertTwitter('image', ogImage);

    upsertMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

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
  }, [title, description, canonicalPath, image, noindex, ogType, jsonLdSerialized]);
};
