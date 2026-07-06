// Post-build static prerender (LOCAL ONLY — never runs in CI).
//
// Vite ships an empty `<div id="root">`, so crawlers without JS (every social
// scraper, and search bots on a tight render budget) see only the generic Home
// meta on every URL. This script boots the built SPA in headless Chromium,
// visits each route in the sitemap, and writes the fully rendered HTML to
// dist/<route>/index.html — real H1, per-page meta/OG, and JSON-LD baked in.
//
// It is deliberately kept out of `npm run build` (CI has no Chromium). Run it
// via `npm run build:static` locally; the resulting dist/ is what goes to
// Hostinger (the canonical host).

import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const BASE_URL = 'https://artifex.click';
const PORT = 4180;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

// Static file server with SPA fallback: unknown routes serve index.html so the
// router can render them (exactly how GitHub Pages / Hostinger behave).
function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = join(DIST, urlPath);
      if (urlPath.endsWith('/')) filePath = join(filePath, 'index.html');

      const serve = (p) => {
        readFile(p, (err, data) => {
          if (err) {
            readFile(join(DIST, 'index.html'), (e2, fallback) => {
              res.writeHead(e2 ? 404 : 200, { 'Content-Type': MIME['.html'] });
              res.end(e2 ? 'not found' : fallback);
            });
            return;
          }
          res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
          res.end(data);
        });
      };

      if (extname(filePath)) serve(filePath);
      else serve(join(DIST, 'index.html')); // extension-less → SPA route
    });
    server.listen(PORT, () => resolve(server));
  });
}

// Routes come straight from the generated sitemap — one source of truth, always
// in sync with what we tell search engines exists.
function routesFromSitemap() {
  const xml = readFileSync(join(DIST, 'sitemap.xml'), 'utf-8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const routes = locs.map((u) => u.replace(BASE_URL, '') || '/').map((p) => (p === '' ? '/' : p));
  return [...new Set(routes)];
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('prerender: dist/index.html missing — run `vite build` first.');
    process.exit(1);
  }

  const routes = routesFromSitemap();
  const server = await startServer();
  const origin = `http://localhost:${PORT}`;

  // --no-sandbox: required for headless Chromium on GitHub Actions runners.
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  // reducedMotion trims framer transitions; we still assert opacity below.
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  // Seed the "returning visitor" flag BEFORE the bundle runs, so Typewriter
  // paints its full H1 synchronously (no timers, no cursor) — the H1 text is
  // in the DOM from the first paint.
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem('artifex_system_init', 'true');
    } catch {
      /* sessionStorage unavailable — ignore */
    }
  });

  let ok = 0;
  const warnings = [];

  for (const route of routes) {
    const page = await context.newPage();
    try {
      await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 30000 });

      // Real H1 present (covers Typewriter even though the seed resolves it).
      // If it never appears, skip this route: writing a headless-partial page
      // and counting it as a success would mask a real failure.
      const h1Ok = await page
        .waitForFunction(
          () => {
            const h1 = document.querySelector('#root h1');
            return !!h1 && h1.textContent.trim().length > 0;
          },
          { timeout: 8000 }
        )
        .then(() => true)
        .catch(() => false);
      if (!h1Ok) {
        warnings.push(`${route}: no h1 — skipped`);
        console.log(`  ✗ ${route} — no H1, skipped`);
        await page.close();
        continue;
      }

      // framer opacity settled → content visible in the snapshot.
      await page
        .waitForFunction(
          () => {
            const els = document.querySelectorAll('#root [style*="opacity"]');
            return els.length === 0 || [...els].every((e) => parseFloat(getComputedStyle(e).opacity) >= 0.99);
          },
          { timeout: 5000 }
        )
        .catch(() => {});
      await page.waitForTimeout(300);

      const html = '<!doctype html>\n' + (await page.evaluate(() => document.documentElement.outerHTML));

      const outDir = route === '/' ? DIST : join(DIST, route);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'index.html'), html, 'utf-8');
      ok += 1;
      console.log(`  ✓ ${route}`);
    } catch (err) {
      warnings.push(`${route}: ${err.message}`);
      console.log(`  ✗ ${route} — ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  console.log(`\nprerender: ${ok}/${routes.length} routes written to dist/`);
  if (warnings.length) {
    console.log('warnings:');
    warnings.forEach((w) => console.log(`  - ${w}`));
  }
  if (ok === 0) process.exit(1);
}

main();
