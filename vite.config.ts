import { writeFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { getAllPublished, categories } from './src/data/blog';

const BASE_URL = 'https://artifex.click';

function buildSitemapXml(): string {
  const published = getAllPublished();

  const staticUrls = [
    { loc: BASE_URL, changefreq: 'weekly', priority: '1.0' },
    { loc: `${BASE_URL}/blog`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${BASE_URL}/servicios/desarrollo`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${BASE_URL}/servicios/fotografia`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${BASE_URL}/servicios/tufting`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${BASE_URL}/portfolio`, changefreq: 'monthly', priority: '0.6' },
  ];

  const categoryUrls = categories.map(cat => ({
    loc: `${BASE_URL}/blog/${cat.slug}`,
    changefreq: 'weekly',
    priority: '0.8',
  }));

  const postUrls = published.map(post => ({
    loc: `${BASE_URL}/blog/${post.category}/${post.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: post.date,
  }));

  const allUrls = [...staticUrls, ...categoryUrls, ...postUrls];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${'lastmod' in u ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
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
});
