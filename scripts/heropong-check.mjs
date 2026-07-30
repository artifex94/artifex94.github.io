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
/** Sin sembrar la sesión: el título se tipea y aparece el cursor. */
const FIRST_VISIT = process.argv.includes('--first-visit');
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
  ([cycle, count, firstVisit]) => {
    try {
      // Con firstVisit no se siembra el flag: Typewriter tipea letra por letra y
      // deja el cursor parpadeando un segundo. Medir en ese momento daría
      // posiciones corridas, porque el cursor ocupa ancho y el título está
      // centrado — este escenario existe justamente para cazar eso.
      if (!firstVisit) sessionStorage.setItem('artifex_system_init', 'true');
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
    // La sonda entrega un objeto reutilizado con referencias en crudo (no puede
    // allocar por frame), así que los agregados se calculan acá.
    window.__heroPongDebug = (frame) => {
      let maxDx = 0;
      for (let i = 0; i < frame.lastDx.length; i += 1) {
        const value = Math.abs(frame.lastDx[i]);
        if (value > maxDx) maxDx = value;
      }
      const digits = frame.state.scoreDigits;
      window.__last = {
        ballLocalX: frame.ballLocalX,
        ballLocalY: frame.ballLocalY,
        maxDx,
        score: digits.length ? Number(digits.join('')) : 0,
        digits: [...digits],
        digitRects: frame.hudDigitRects(),
        activeLines: [...frame.activeLines],
        cycle: frame.state.cycle,
        resets: frame.state.resets,
        digitsDestructible: frame.state.digitsDestructible,
      };
    };
  },
  [CYCLE, GLYPH_COUNT, FIRST_VISIT],
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

if (FIRST_VISIT) {
  console.log('\nprimera visita (título tipeándose):');
  // Mientras el cursor parpadea, el título centrado está corrido: la franja no
  // debe existir todavía, o el juego mediría posiciones equivocadas.
  const duringTyping = await page.evaluate(() => ({
    band: !!document.querySelector('[data-hero-pong="band"]'),
    cursor: !!document.querySelector('#root h1 [aria-hidden="true"]'),
  }));
  check('no hay franja mientras el cursor sigue visible', !duringTyping.band || !duringTyping.cursor);
  await page.waitForSelector('[data-hero-pong="band"]', { timeout: 10000 });
  const cursorGone = await page.evaluate(
    () => !document.querySelector('#root h1 [aria-hidden="true"]'),
  );
  check('la franja aparece recién con el título en su lugar final', cursorGone);
}

// --- Reposo ---
console.log('\nreposo:');
const idle = await page.evaluate(() => {
  const band = document.querySelector('[data-hero-pong="band"]');
  const painted = document.querySelector('#root h1 span');
  return {
    band: !!band,
    bandRect: band ? band.getBoundingClientRect().toJSON() : null,
    canvas: !!document.querySelector('canvas'),
    glyphs: document.querySelectorAll('[data-hero-pong="glyphs"] span').length,
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

// El texto tiene que estar quieto ANTES de comparar posiciones. Si el juego
// hubiera medido con el cursor todavía visible, el título se recentra al
// desaparecer y el overlay queda corrido: es exactamente lo que hay que cazar.
// Comparar mientras el cursor sigue puesto no serviría, porque el overlay y el
// original estarían corridos por igual y coincidirían.
await page
  .waitForFunction(() => !document.querySelector('#root h1 [aria-hidden="true"]'), null, {
    timeout: 4000,
    polling: 'raf',
  })
  .catch(() => {});

console.log('\npartida:');
const started = await page.evaluate(() => {
  const painted = document.querySelector('#root h1 span');
  return {
    canvas: !!document.querySelector('canvas'),
    glyphs: document.querySelectorAll('[data-hero-pong="glyphs"] span').length,
    titleColor: painted?.style.color ?? '',
    titleText: document.querySelector('#root h1')?.textContent ?? '',
  };
});
check('aparece el canvas', started.canvas);
check('el texto se duplica en letras jugables', started.glyphs > 100, `${started.glyphs} letras`);
check('el original queda transparente', started.titleColor === 'transparent');
check('el título sigue en el DOM (a11y y SEO)', started.titleText === 'Un taller, tres oficios.');

// La verificación que importa de verdad: el overlay tiene que caer EXACTAMENTE
// sobre el texto que reemplaza. Si se mide en un momento equivocado (por
// ejemplo con el cursor del Typewriter todavía visible, que corre el título
// centrado), acá se ve como un desplazamiento de varios píxeles.
const alignment = await page.evaluate(() => {
  // Se vuelve a medir el texto original grafema por grafema, igual que hace
  // measureHero pero de forma independiente, y se compara con el span que le
  // corresponde. Comparar contra la caja del bloque entero no serviría: el
  // rect de un grafema es su caja de fuente, no la de la línea.
  const segmenter = new Intl.Segmenter('es', { granularity: 'grapheme' });
  const range = document.createRange();
  const expected = [];

  for (const el of [
    document.querySelector('#root section > span'),
    document.querySelector('#root h1'),
    document.querySelector('#root section > p'),
  ]) {
    if (!el) continue;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const value = node.nodeValue ?? '';
      // Igual que measureHero: se saltea lo decorativo (el cursor).
      if (value.trim() && !node.parentElement?.closest('[aria-hidden="true"]')) {
        for (const piece of segmenter.segment(value)) {
          if (!piece.segment.trim()) continue;
          range.setStart(node, piece.index);
          range.setEnd(node, piece.index + piece.segment.length);
          const rects = range.getClientRects();
          if (rects.length && rects[0].width > 0) {
            expected.push({ char: piece.segment, left: rects[0].left, top: rects[0].top });
          }
        }
      }
      node = walker.nextNode();
    }
  }

  const spans = [...document.querySelectorAll('[data-hero-pong="glyphs"] span')];
  let worstDx = 0;
  let worstDy = 0;
  let mismatched = 0;
  const compared = Math.min(spans.length, expected.length);
  for (let i = 0; i < compared; i += 1) {
    if (spans[i].textContent !== expected[i].char) {
      mismatched += 1;
      continue;
    }
    const rect = spans[i].getBoundingClientRect();
    worstDx = Math.max(worstDx, Math.abs(rect.left - expected[i].left));
    worstDy = Math.max(worstDy, Math.abs(rect.top - expected[i].top));
  }

  return { spans: spans.length, expected: expected.length, compared, mismatched, worstDx, worstDy };
});
check(
  'el overlay tiene una letra por grafema del hero',
  alignment.spans === alignment.expected && alignment.mismatched === 0,
  `${alignment.spans} spans vs ${alignment.expected} grafemas, ${alignment.mismatched} desalineados`,
);
check(
  'cada letra cae exactamente sobre la original',
  alignment.worstDx < 0.6 && alignment.worstDy < 0.6,
  `peor desfase ${alignment.worstDx.toFixed(2)}px horizontal, ${alignment.worstDy.toFixed(2)}px vertical`,
);

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

// Con --shot el bucle corta al capturar el frame, así que no alcanzó a juntar
// suficientes muestras para juzgar el movimiento.
if (!shotArg) {
  check('la pelota se mueve', new Set(positions).size > 5, `${new Set(positions).size} posiciones`);
  check('rebota en el borde del header', sawCeiling, `${maxScore} golpes`);
}
check('las letras esquivan la pelota', sawDodge > 4, `${sawDodge.toFixed(1)}px de desplazamiento`);

if (CYCLE) {
  console.log('\nendgame:');
  const final = await page.evaluate(() => {
    const spans = [...document.querySelectorAll('[data-hero-pong="glyphs"] span')];
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
