// Verificación del hero-pong en un viewport móvil real (LOCAL ONLY — needs Chromium).
//
// The game only exists on mobile and only after a touch, so it cannot be
// covered by the jsdom suite: this drives a real Chromium, taps the band and
// asserts what actually happens on screen.
//
//   node scripts/heropong-check.mjs                  # partida normal
//   node scripts/heropong-check.mjs --cycle          # endgame: letras que vuelven
//   node scripts/heropong-check.mjs --shot=out.png   # captura el frame del esquive
//
// Reads `window.__heroPongDebug`, the diagnostic probe that heroPongEngine.ts
// calls once per frame when it is defined (see the comment there).

import { chromium } from 'playwright-core';

const URL = process.env.HEROPONG_URL ?? 'http://localhost:5173/';
const CYCLE = process.argv.includes('--cycle');
const shotArg = process.argv.find((a) => a.startsWith('--shot='));
/** Cantidad de letras jugables del hero: define el progreso que se puede sembrar. */
const GLYPH_COUNT = 186;

const failures = [];
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});

await context.addInitScript(
  ([cycle, count]) => {
    try {
      sessionStorage.setItem('artifex_system_init', 'true');
      if (cycle) {
        // Tablero vacío y en pausa: la siguiente fase es la vuelta de las letras.
        sessionStorage.setItem(
          'artifex_hero_pong',
          JSON.stringify({
            letters: Array.from({ length: count }, () => 'destroyed'),
            playedMs: 0,
            armed: count,
            resets: 0,
            cycle: 'cleared',
            cycleTimerMs: 0,
            restoreQueue: [],
          }),
        );
      }
    } catch {
      /* ignore */
    }
    window.__heroPongDebug = (info) => {
      window.__last = info;
    };
  },
  [CYCLE, GLYPH_COUNT],
);

const page = await context.newPage();
const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});

await page.goto(URL + (CYCLE ? '?heropong=turbo' : ''), { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(700);

// --- Reposo ---
console.log('\nreposo:');
const idle = await page.evaluate(() => {
  const band = document.querySelector('#root section [aria-hidden="true"]');
  const painted = document.querySelector('#root h1 span');
  return {
    band: !!band,
    bandRect: band ? band.getBoundingClientRect().toJSON() : null,
    canvas: !!document.querySelector('canvas'),
    glyphs: band ? band.parentElement.querySelectorAll('[aria-hidden="true"] span').length : -1,
    titleColor: painted?.style.color ?? '',
  };
});
check('la franja existe en móvil', idle.band);
check('sin canvas antes del toque', !idle.canvas);
check('sin letras partidas antes del toque', idle.glyphs === 0, `${idle.glyphs} spans`);
check('el título no está apagado', idle.titleColor === '');
check('la franja mide 64px de alto', idle.bandRect?.height === 64, `${idle.bandRect?.height}px`);

if (!idle.band) {
  console.log('\nno hay franja: nada más que verificar');
  await browser.close();
  process.exit(1);
}

// --- Arranque ---
const band = idle.bandRect;
await page.touchscreen.tap(band.x + band.width / 2, band.y + 30);
await page.waitForFunction(() => !!window.__last, null, { timeout: 20000, polling: 'raf' });

console.log('\npartida:');
const started = await page.evaluate(() => {
  const painted = document.querySelector('#root h1 span');
  return {
    canvas: !!document.querySelector('canvas'),
    glyphs: document.querySelectorAll('#root section [aria-hidden="true"] span').length,
    titleColor: painted?.style.color ?? '',
    titleText: document.querySelector('#root h1')?.textContent ?? '',
  };
});
check('aparece el canvas', started.canvas);
check('el texto se duplica en letras jugables', started.glyphs > 100, `${started.glyphs} letras`);
check('el original queda transparente', started.titleColor === 'transparent');
check('el título sigue en el DOM (a11y y SEO)', started.titleText === 'Un taller, tres oficios.');

// --- Movimiento, rebotes y esquive ---
const geo = await page.evaluate(() => {
  const origin = document.querySelector('#root section').getBoundingClientRect();
  return { originX: origin.x };
});

let sawDodge = 0;
let sawCeiling = false;
let minY = 1e9;
let maxScore = 0;
const positions = [];
for (let i = 0; i < (CYCLE ? 300 : 90); i += 1) {
  const info = await page.evaluate(() => window.__last && {
    x: window.__last.ballLocalX,
    y: window.__last.ballLocalY,
    maxDx: window.__last.maxDx,
    score: window.__last.score,
    cycle: window.__last.cycle,
    resets: window.__last.resets,
  });
  if (!info) break;
  positions.push(Math.round(info.y));
  minY = Math.min(minY, info.y);
  sawDodge = Math.max(sawDodge, info.maxDx);
  maxScore = Math.max(maxScore, info.score);
  if (info.score > 0) sawCeiling = true;
  // La paleta persigue la pelota para que la partida dure.
  await page.touchscreen.tap(
    Math.max(band.x + 4, Math.min(geo.originX + info.x, band.x + band.width - 4)),
    band.y + 30,
  );
  if (shotArg && info.maxDx > 8) {
    await page.screenshot({ path: shotArg.slice(7), clip: { x: 0, y: 100, width: 390, height: 480 } });
    console.log(`  · captura del esquive → ${shotArg.slice(7)}`);
    break;
  }
  await page.waitForTimeout(CYCLE ? 100 : 60);
}

check('la pelota se mueve', new Set(positions).size > 5, `${new Set(positions).size} posiciones`);
check('rebota en el borde del header', sawCeiling, `${maxScore} golpes`);
check('las letras esquivan la pelota', sawDodge > 4, `${sawDodge.toFixed(1)}px de desplazamiento`);

if (CYCLE) {
  console.log('\nendgame:');
  const final = await page.evaluate(() => {
    const spans = [...document.querySelectorAll('#root section [aria-hidden="true"] span')];
    return {
      hidden: spans.filter((s) => s.style.visibility === 'hidden').length,
      total: spans.length,
      resets: window.__last?.resets ?? -1,
      cycle: window.__last?.cycle ?? '?',
    };
  });
  check('las letras volvieron a su lugar', final.total > 0 && final.hidden < final.total / 4, `${final.hidden}/${final.total} ocultas`);
  check('el ciclo se reinició', final.resets >= 1, `resets=${final.resets}, cycle=${final.cycle}`);
}

console.log('\nconsola:');
check('sin errores de página', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();

if (failures.length) {
  console.log(`\nheropong-check: ${failures.length} verificación(es) fallida(s)`);
  process.exit(1);
}
console.log('\nheropong-check: todo en orden');
