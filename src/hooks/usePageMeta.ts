import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description: string;
  /** Ruta canónica ('/servicios/fotografia'). Por defecto usa la ruta actual. */
  canonicalPath?: string;
}

const CANONICAL_ORIGIN = 'https://artifex.click';

// SEO por ruta en una SPA: muta las etiquetas que index.html ya declara.
// Cubre document.title (pestañas/historial) y a Googlebot, que sí ejecuta JS.
export const usePageMeta = ({ title, description, canonicalPath }: PageMeta) => {
  useEffect(() => {
    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', description);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const path = canonicalPath ?? window.location.pathname;
      canonical.setAttribute('href', `${CANONICAL_ORIGIN}${path === '/' ? '/' : path}`);
    }
  }, [title, description, canonicalPath]);
};
