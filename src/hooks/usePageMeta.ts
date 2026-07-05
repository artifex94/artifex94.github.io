import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description: string;
  /** Ruta canónica ('/servicios/fotografia'). Por defecto usa la ruta actual. */
  canonicalPath?: string;
  /** Structured data (schema.org). Se inyecta como <script type="application/ld+json">. */
  jsonLd?: object | object[];
}

const CANONICAL_ORIGIN = 'https://artifex.click';
const JSONLD_ATTR = 'data-page-jsonld';

// SEO por ruta en una SPA: muta las etiquetas que index.html ya declara.
// Cubre document.title (pestañas/historial) y a Googlebot, que sí ejecuta JS.
export const usePageMeta = ({ title, description, canonicalPath, jsonLd }: PageMeta) => {
  // Serializado como dependencia del effect: evita re-runs cuando la página
  // recrea el objeto jsonLd en cada render con el mismo contenido.
  const jsonLdSerialized = jsonLd
    ? JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : null;

  useEffect(() => {
    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', description);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const path = canonicalPath ?? window.location.pathname;
      canonical.setAttribute('href', `${CANONICAL_ORIGIN}${path === '/' ? '/' : path}`);
    }

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
  }, [title, description, canonicalPath, jsonLdSerialized]);
};
