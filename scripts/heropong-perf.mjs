// Perfilado del hero-pong sobre el build de producción (LOCAL ONLY — needs Chromium).
//
// Measures what actually matters for a 60fps game loop on a phone: how long each
// frame takes, whether the loop forces layout or style recalcs (the classic
// thrashing trap), long tasks, and heap growth over time.
//
// It runs three scenarios, because the interesting numbers are the worst cases,
// not the happy path:
//   normal   → every letter dodging (typical play)
//   rigid    → all 186 letters solid (worst case for collision detection)
//   falling  → all 186 letters coming back down (worst case for DOM writes)
//
//   npm run build && npx vite preview --port 4173
//   node scripts/heropong-perf.mjs
//
// Uses the `window.__heroPongDebug` probe from heroPongEngine.ts.

import { chromium } from 'playwright-core';

const URL = process.env.HEROPONG_URL ?? 'http://localhost:4173/';
const SAMPLE_MS = Number(process.env.PERF_MS ?? 6000);
const GLYPH_COUNT = 186;

/** Presupuesto de un frame a 60fps. */
const FRAME_BUDGET = 16.7;

const SCENARIOS = [
  { name: 'normal ', letters: 'dodging', cycle: 'arming', armed: 0 },
  { name: 'rigid  ', letters: 'rigid', cycle: 'arming', armed: GLYPH_COUNT },
  { name: 'falling', letters: 'destroyed', cycle: 'cleared', armed: GLYPH_COUNT },
];

const percentile = (sorted, p) => {
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[index];
};

const results = [];

for (const scenario of SCENARIOS) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  await context.addInitScript(
    ([letters, cycle, armed, count]) => {
      try {
        sessionStorage.setItem('artifex_system_init', 'true');
        sessionStorage.setItem(
          'artifex_hero_pong',
          JSON.stringify({
            letters: Array.from({ length: count }, () => letters),
            playedMs: 0,
            armed,
            resets: 0,
            cycle,
            cycleTimerMs: 0,
            restoreQueue: [],
          }),
        );
      } catch {
        /* ignore */
      }

      // Sonda de frames: se engancha al mismo rAF del engine, así que mide el
      // intervalo real entre frames pintados, no un rAF paralelo.
      window.__frames = [];
      window.__ballX = null;
      window.__heroPongDebug = (frame) => {
        window.__frames.push(performance.now());
        window.__ballX = frame.ballLocalX;
      };

      window.__longTasks = 0;
      window.__worstTask = 0;
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.__longTasks += 1;
            window.__worstTask = Math.max(window.__worstTask, entry.duration);
          }
        }).observe({ entryTypes: ['longtask'] });
      } catch {
        /* longtask no soportado */
      }
    },
    [scenario.letters, scenario.cycle, scenario.armed, GLYPH_COUNT],
  );

  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');

  await page.goto(URL + '?heropong=turbo', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  const band = await page.evaluate(() => {
    const el = document.querySelector('[data-hero-pong="band"]');
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width };
  });
  const originX = await page.evaluate(
    () => document.querySelector('#root section').getBoundingClientRect().x,
  );

  // Arranque: del toque al primer frame pintado. Acá entra el import del chunk,
  // la medición de los 186 grafemas, Pretext y la construcción de la tabla, así
  // que es donde puede aparecer un bloqueo perceptible del hilo.
  await page.evaluate(() => {
    window.__tapAt = performance.now();
    window.__longTasks = 0;
    window.__worstTask = 0;
  });
  await page.touchscreen.tap(band.x + band.w / 2, band.y + 30);
  await page.waitForFunction(() => window.__frames.length > 5, null, { timeout: 20000, polling: 'raf' });
  const startup = await page.evaluate(() => ({
    toFirstFrame: window.__frames[0] - window.__tapAt,
    worstTask: window.__worstTask,
  }));

  const metricsBefore = Object.fromEntries(
    (await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]),
  );
  const heapBefore = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? 0);
  await page.evaluate(() => {
    window.__frames.length = 0;
  });

  // Mantiene la pelota en juego con la menor interferencia posible: un
  // reposicionamiento cada 350ms, no un tap por frame.
  //
  // PERF_NOTOUCH=1 no toca nada: la partida dura menos pero los frames quedan
  // libres del costo de los eventos de input del propio harness, que es lo que
  // hay que mirar para juzgar el loop en sí.
  const deadline = Date.now() + SAMPLE_MS;
  if (process.env.PERF_NOTOUCH === '1') {
    await page.waitForTimeout(SAMPLE_MS);
  } else {
    while (Date.now() < deadline) {
      const x = await page.evaluate(() => window.__ballX ?? null);
      const target = x === null ? band.x + band.w / 2 : originX + x;
      await page.touchscreen.tap(Math.max(band.x + 4, Math.min(target, band.x + band.w - 4)), band.y + 30);
      await page.waitForTimeout(350);
    }
  }

  const frames = await page.evaluate(() => window.__frames.slice());
  const longTasks = await page.evaluate(() => window.__longTasks);
  const heapAfter = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? 0);
  const metricsAfter = Object.fromEntries(
    (await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]),
  );

  const deltas = [];
  for (let i = 1; i < frames.length; i += 1) deltas.push(frames[i] - frames[i - 1]);
  const sorted = [...deltas].sort((a, b) => a - b);
  const seconds = (metricsAfter.Timestamp ?? 0) - (metricsBefore.Timestamp ?? 1);

  results.push({
    scenario: scenario.name,
    frames: frames.length,
    fps: (frames.length / SAMPLE_MS) * 1000,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    max: sorted[sorted.length - 1] ?? 0,
    over: deltas.filter((d) => d > FRAME_BUDGET * 1.5).length,
    layouts: (metricsAfter.LayoutCount ?? 0) - (metricsBefore.LayoutCount ?? 0),
    recalcs: (metricsAfter.RecalcStyleCount ?? 0) - (metricsBefore.RecalcStyleCount ?? 0),
    scriptMs: (((metricsAfter.ScriptDuration ?? 0) - (metricsBefore.ScriptDuration ?? 0)) / Math.max(seconds, 0.001)) * 100,
    layoutMs: (((metricsAfter.LayoutDuration ?? 0) - (metricsBefore.LayoutDuration ?? 0)) / Math.max(seconds, 0.001)) * 100,
    longTasks,
    heapKb: (heapAfter - heapBefore) / 1024,
    toFirstFrame: startup.toFirstFrame,
    worstStartupTask: startup.worstTask,
  });

  await browser.close();
}

const pad = (v, n) => String(v).padStart(n);
console.log(`\nhero-pong — ${SAMPLE_MS}ms por escenario, viewport 390×844, DPR 3\n`);
console.log('escenario   fps   p50    p95    max    >25ms  layouts recalcs  script%  layout%  longtasks  heap');
console.log('─'.repeat(100));
for (const r of results) {
  console.log(
    `${r.scenario}  ${pad(r.fps.toFixed(0), 3)}  ${pad(r.p50.toFixed(1), 5)}  ${pad(r.p95.toFixed(1), 5)}  ` +
      `${pad(r.max.toFixed(1), 5)}  ${pad(r.over, 5)}  ${pad(r.layouts, 6)}  ${pad(r.recalcs, 6)}  ` +
      `${pad(r.scriptMs.toFixed(1), 6)}%  ${pad(r.layoutMs.toFixed(1), 6)}%  ${pad(r.longTasks, 8)}  ${pad(r.heapKb.toFixed(0), 5)}kb`,
  );
}

console.log('\narranque (toque → primer frame):');
for (const r of results) {
  console.log(`  ${r.scenario}  ${r.toFirstFrame.toFixed(0)}ms   tarea más larga: ${r.worstStartupTask.toFixed(0)}ms`);
}

console.log('\nlectura:');
console.log('  p95 ≤ 17ms  → el loop entra en presupuesto de 60fps');
console.log('  layouts ~0  → el loop no fuerza reflow (solo escribe transforms)');
console.log('  heap plano  → no aloca por frame de forma acumulativa');
