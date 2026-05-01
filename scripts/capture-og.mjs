#!/usr/bin/env node
/**
 * capture-og.mjs — Screenshots the homepage at 1200×630 for the OG image.
 *
 * Requires dist/ to exist (run `npm run build` first).
 * Saves result to public/og-image.png — commit it, then redeploy.
 *
 * Usage:
 *   npm run capture-og
 *   npx playwright install chromium  ← first time only
 */

import { chromium } from 'playwright';
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = join(__dirname, '..');
const distDir   = join(root, 'dist');
const outFile   = join(root, 'public', 'og-image.png');

if (!existsSync(distDir)) {
  console.error('❌  dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const PORT     = 4174;
const BASE_URL = `http://localhost:${PORT}`;

function startServer() {
  const srv = spawn(
    'npm',
    ['run', 'preview', '--', '--port', String(PORT), '--strictPort'],
    { cwd: root, shell: true, stdio: ['ignore', 'pipe', 'pipe'] }
  );
  srv.stderr.on('data', d => process.stderr.write(d));
  return srv;
}

async function waitForServer(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 1500);
      await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      return;
    } catch {
      await new Promise(r => setTimeout(r, 600));
    }
  }
  throw new Error(`Server at ${url} did not respond within ${timeoutMs}ms`);
}

async function main() {
  console.log('🚀  Starting preview server…');
  const srv = startServer();

  try {
    await waitForServer(BASE_URL);
    console.log('✅  Server ready at', BASE_URL);

    const browser = await chromium.launch({ headless: true });
    const page    = await browser.newPage();

    // Force prefers-reduced-motion so animations are skipped — cleaner screenshot.
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener:    () => {},
          removeListener: () => {},
          addEventListener:    () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }),
      });
    });

    await page.setViewportSize({ width: 1200, height: 630 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30_000 });

    // Extra settle time for CSS transitions / fonts.
    await page.waitForTimeout(2500);

    await page.screenshot({ path: outFile, type: 'png', fullPage: false });
    await browser.close();

    console.log(`📸  OG image saved → ${outFile}`);
    console.log('    Commit public/og-image.png and push to redeploy.');
  } finally {
    srv.kill('SIGTERM');
  }
}

main().catch(err => {
  console.error('❌ ', err.message);
  process.exit(1);
});
