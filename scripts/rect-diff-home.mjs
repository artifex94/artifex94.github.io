// Guardián del "no se movió nada" (LOCAL ONLY — never runs in CI, no Chromium there).
//
// Captures the exact geometry and typography of every meaningful element of the
// home page across mobile widths, so a change can be proven layout-neutral
// instead of eyeballed. Compares with zero tolerance.
//
//   node scripts/rect-diff-home.mjs capture before.json
//   ...make changes...
//   node scripts/rect-diff-home.mjs capture after.json
//   node scripts/rect-diff-home.mjs compare before.json after.json
//
// Point it at any origin with --url (defaults to the Vite dev server).

import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';

const DEFAULT_URL = 'http://localhost:5173/';
const WIDTHS = [320, 360, 390, 414];

// Stable selectors: structural position, not classes (classes are what changes).
const TARGETS = [
  ['nav', 'nav'],
  ['navBar', 'nav > div'],
  ['page', '#root > div'],
  ['column', '#root > div > div'],
  ['hero', '#root section:nth-of-type(1)'],
  ['eyebrow', '#root section:nth-of-type(1) > span'],
  ['title', '#root h1'],
  ['titleSpan', '#root h1 > span'],
  ['intro', '#root section:nth-of-type(1) > p'],
  ['cardsGrid', '#root section:nth-of-type(2)'],
  ['card1', '#root section:nth-of-type(2) > div:nth-child(1)'],
  ['card2', '#root section:nth-of-type(2) > div:nth-child(2)'],
  ['card3', '#root section:nth-of-type(2) > div:nth-child(3)'],
  ['portfolioSection', '#root section:nth-of-type(3)'],
  ['portfolioLink', '#root section:nth-of-type(3) a'],
  ['ctaSection', '#root section:nth-of-type(4)'],
  ['ctaTitle', '#root section:nth-of-type(4) h2'],
  ['footer', 'footer'],
];

// Typography and paint properties: catch a font/tracking/colour drift that the
// rects alone would not show.
const STYLE_PROPS = [
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
  'letterSpacing', 'wordSpacing', 'textAlign', 'color', 'opacity',
  'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom',
  'display', 'position', 'visibility', 'whiteSpace',
];

const round = (n) => Math.round(n * 100) / 100;

async function capture(url, outPath) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const snapshot = { url, widths: {} };

  for (const width of WIDTHS) {
    for (const reduced of [false, true]) {
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        reducedMotion: reduced ? 'reduce' : 'no-preference',
      });
      // Returning-visitor flag: Typewriter paints the full H1 synchronously, so
      // the measurement never races the typing animation.
      await context.addInitScript(() => {
        try {
          sessionStorage.setItem('artifex_system_init', 'true');
        } catch {
          /* ignore */
        }
      });

      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForFunction(
        () => {
          const h1 = document.querySelector('#root h1');
          return !!h1 && h1.textContent.trim().length > 0;
        },
        { timeout: 10000 },
      );
      await page.evaluate(() => document.fonts.ready);
      // Wait for the reveal animations to actually settle. The service cards
      // animate opacity + y on whileInView with staggered delays, so a fixed
      // timeout is not enough: poll until two consecutive readings of every
      // rect and opacity are byte-identical.
      await page.waitForFunction(
        ({ targets }) => {
          const sample = () =>
            targets
              .map(([, selector]) => {
                const el = document.querySelector(selector);
                if (!el) return 'x';
                const r = el.getBoundingClientRect();
                return `${r.x},${r.y},${r.width},${r.height},${getComputedStyle(el).opacity}`;
              })
              .join('|');
          const w = window;
          const current = sample();
          const stable = w.__rectPrev === current ? (w.__rectStable || 0) + 1 : 0;
          w.__rectPrev = current;
          w.__rectStable = stable;
          return stable >= 3;
        },
        { targets: TARGETS },
        { timeout: 20000, polling: 250 },
      );

      const data = await page.evaluate(
        ({ targets, styleProps }) => {
          const out = {
            document: {
              scrollHeight: document.documentElement.scrollHeight,
              scrollWidth: document.documentElement.scrollWidth,
            },
            elements: {},
          };
          for (const [name, selector] of targets) {
            const el = document.querySelector(selector);
            if (!el) {
              out.elements[name] = null;
              continue;
            }
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            const styles = {};
            for (const prop of styleProps) styles[prop] = cs[prop];
            out.elements[name] = {
              rect: { x: r.x, y: r.y, w: r.width, h: r.height },
              styles,
              text: (el.textContent || '').trim().slice(0, 120),
            };
          }
          return out;
        },
        { targets: TARGETS, styleProps: STYLE_PROPS },
      );

      for (const entry of Object.values(data.elements)) {
        if (!entry) continue;
        entry.rect = {
          x: round(entry.rect.x), y: round(entry.rect.y),
          w: round(entry.rect.w), h: round(entry.rect.h),
        };
      }

      snapshot.widths[`${width}${reduced ? '-reduced' : ''}`] = data;
      await context.close();
      console.log(`  ✓ ${width}px${reduced ? ' (reduced-motion)' : ''}`);
    }
  }

  await browser.close();
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`\nrect-diff: snapshot written to ${outPath}`);
}

function compare(beforePath, afterPath) {
  const before = JSON.parse(readFileSync(beforePath, 'utf-8'));
  const after = JSON.parse(readFileSync(afterPath, 'utf-8'));
  const diffs = [];

  for (const key of Object.keys(before.widths)) {
    const b = before.widths[key];
    const a = after.widths[key];
    if (!a) {
      diffs.push(`${key}: missing in after`);
      continue;
    }

    for (const prop of ['scrollHeight', 'scrollWidth']) {
      if (b.document[prop] !== a.document[prop]) {
        diffs.push(`${key} document.${prop}: ${b.document[prop]} → ${a.document[prop]}`);
      }
    }

    for (const name of Object.keys(b.elements)) {
      const eb = b.elements[name];
      const ea = a.elements[name];
      if (!eb && !ea) continue;
      if (!eb || !ea) {
        diffs.push(`${key} ${name}: ${eb ? 'disappeared' : 'appeared'}`);
        continue;
      }
      for (const axis of ['x', 'y', 'w', 'h']) {
        if (eb.rect[axis] !== ea.rect[axis]) {
          diffs.push(`${key} ${name}.rect.${axis}: ${eb.rect[axis]} → ${ea.rect[axis]}`);
        }
      }
      for (const prop of Object.keys(eb.styles)) {
        if (eb.styles[prop] !== ea.styles[prop]) {
          diffs.push(`${key} ${name}.${prop}: "${eb.styles[prop]}" → "${ea.styles[prop]}"`);
        }
      }
      if (eb.text !== ea.text) {
        diffs.push(`${key} ${name}.text: "${eb.text}" → "${ea.text}"`);
      }
    }
  }

  if (!diffs.length) {
    console.log('rect-diff: IDENTICAL — nothing moved, nothing changed.');
    return;
  }
  console.log(`rect-diff: ${diffs.length} difference(s):\n`);
  diffs.forEach((d) => console.log(`  - ${d}`));
  process.exitCode = 1;
}

const [mode, ...rest] = process.argv.slice(2);

if (mode === 'capture') {
  const urlArg = rest.find((a) => a.startsWith('--url='));
  const out = rest.find((a) => !a.startsWith('--')) || 'rect-home.json';
  await capture(urlArg ? urlArg.slice(6) : DEFAULT_URL, out);
} else if (mode === 'compare') {
  const [b, a] = rest.filter((x) => !x.startsWith('--'));
  if (!b || !a) {
    console.error('usage: rect-diff-home.mjs compare <before.json> <after.json>');
    process.exit(1);
  }
  compare(b, a);
} else {
  console.error('usage: rect-diff-home.mjs capture <out.json> [--url=…] | compare <before.json> <after.json>');
  process.exit(1);
}
