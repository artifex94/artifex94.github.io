import { writeFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { getAllPublished, categories } from './src/data/blog';
import { galleryManifest } from './src/data/gallery.generated';

const BASE_URL = 'https://artifex.click';

// Límite de la spec de image sitemap: 1000 imágenes por URL.
const MAX_SITEMAP_IMAGES = 1000;

// XML entities en los valores que embebemos (URLs con & de query, etc.).
const escapeXml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&apos;';
    }
  });

interface SitemapUrl {
  loc: string;
  changefreq: string;
  priority: string;
  lastmod?: string;
  /** URLs de imagen (image sitemap) asociadas a esta página. */
  images?: { loc: string; caption: string }[];
}

function buildSitemapXml(): string {
  const published = getAllPublished();
  // Fecha del build para las páginas estáticas (los posts traen su propia fecha).
  const buildDate = new Date().toISOString().split('T')[0];

  // Fotos de la galería como image sitemap bajo /servicios/fotografia:
  // ayuda a que las fotos de Ramiro aparezcan en Google Images.
  const galleryImages = galleryManifest
    .map((photo) => ({ loc: photo.fullSrc, caption: photo.alt }))
    .slice(0, MAX_SITEMAP_IMAGES);

  const staticUrls: SitemapUrl[] = [
    // Barra final: matchea el canonical (https://artifex.click/).
    { loc: `${BASE_URL}/`, changefreq: 'weekly', priority: '1.0', lastmod: buildDate },
    { loc: `${BASE_URL}/blog`, changefreq: 'weekly', priority: '0.9', lastmod: buildDate },
    { loc: `${BASE_URL}/servicios/desarrollo`, changefreq: 'monthly', priority: '0.8', lastmod: buildDate },
    { loc: `${BASE_URL}/servicios/fotografia`, changefreq: 'monthly', priority: '0.8', lastmod: buildDate, images: galleryImages },
    { loc: `${BASE_URL}/servicios/tufting`, changefreq: 'monthly', priority: '0.8', lastmod: buildDate },
    { loc: `${BASE_URL}/portfolio`, changefreq: 'monthly', priority: '0.6', lastmod: buildDate },
  ];

  const categoryUrls = categories.map(cat => ({
    loc: `${BASE_URL}/blog/${cat.slug}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: buildDate,
  }));

  const postUrls = published.map(post => ({
    loc: `${BASE_URL}/blog/${post.category}/${post.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: post.date,
  }));

  const allUrls: SitemapUrl[] = [...staticUrls, ...categoryUrls, ...postUrls];

  const renderImages = (images?: { loc: string; caption: string }[]): string =>
    images && images.length
      ? '\n' + images
          .map(
            (img) =>
              `    <image:image><image:loc>${escapeXml(img.loc)}</image:loc><image:caption>${escapeXml(img.caption)}</image:caption></image:image>`,
          )
          .join('\n')
      : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}${renderImages(u.images)}
  </url>`).join('\n')}
</urlset>`;
}

function buildRssXml(): string {
  const published = getAllPublished();
  const now = new Date().toUTCString();

  const items = published.map(post => {
    const url = `${BASE_URL}/blog/${post.category}/${post.slug}`;
    const pubDate = new Date(post.date).toUTCString();
    return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <description><![CDATA[${post.summary}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${url}</guid>
      <category><![CDATA[${post.category}]]></category>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Artifex Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Apuntes técnicos, exploraciones de software y desarrollo web.</description>
    <language>es-AR</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

// Genera sitemap.xml y rss.xml desde src/data/blog.ts en cada build.
// Las demos (/business/*) y los redirects quedan fuera a propósito:
// son piezas de venta, no contenido indexable.
function staticFilesPlugin(): Plugin {
  return {
    name: 'static-files-generator',
    buildStart() {
      writeFileSync('public/sitemap.xml', buildSitemapXml(), 'utf-8');
      writeFileSync('public/rss.xml', buildRssXml(), 'utf-8');
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    staticFilesPlugin(),
  ],
  // Sitio de usuario de GitHub Pages servido desde la raíz del dominio.
  // Con BrowserRouter el base debe ser absoluto: './' rompe los assets
  // cuando se carga una ruta anidada como /business.
  base: '/',
  build: {
    rollupOptions: {
      output: {
        // Separa las libs pesadas del chunk de entrada: quedan cacheadas por
        // el navegador entre deploys que no las tocan (cambian con poca
        // frecuencia respecto del código propio).
        advancedChunks: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
            },
            {
              name: 'framer-vendor',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            },
          ],
        },
      },
    },
  },
});
