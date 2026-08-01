// Verificación del hero-pong en un viewport móvil real (LOCAL ONLY — needs Chromium).
//
// The game only exists on mobile and only after a touch, so it cannot be
// covered by the jsdom suite: this drives a real Chromium, taps the band and
// asserts what actually happens on screen.
//
//   node scripts/heropong-check.mjs                  # partida normal
//   node scripts/heropong-check.mjs --cycle          # endgame: letras que vuelven
//   node scripts/heropong-check.mjs --marquee        # ticker del top-10 en reposo
//   node scripts/heropong-check.mjs --marquee=1      # ticker con UN solo score
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
/**
 * Scores a sembrar para verificar el ticker. Solo bajo el flag: la corrida por
 * defecto asume la tabla vacía (el flujo de game over cuenta las filas).
 * `--marquee=1` es el caso real más común, y donde la cuenta de copias podría
 * fallar: un solo score tiene que repetirse hasta cubrir el ancho de la franja.
 */
const marqueeArg = process.argv.find((a) => a === '--marquee' || a.startsWith('--marquee='));
const MARQUEE_SCORES = marqueeArg ? Number(marqueeArg.split('=')[1] ?? 10) : 0;
/** Cantidad de letras jugables del hero: define el progreso que se puede sembrar. */
const GLYPH_COUNT = 186;
/** El ranking a consultar. Se puede apuntar a una function local para probar. */
const LEADERBOARD_URL =
  process.env.HEROPONG_LEADERBOARD_URL ??
  'https://erjyzhefwndkumadlpzr.supabase.co/functions/v1/hero-pong-score';

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
  ([cycle, count, firstVisit, marqueeScores]) => {
    try {
      if (marqueeScores > 0) {
        localStorage.setItem(
          'artifex_hero_pong_global',
          JSON.stringify(
            Array.from({ length: marqueeScores }, (_, i) => ({
              initials: 'ABC',
              score: (marqueeScores - i) * 100,
            })),
          ),
        );
      }
      // Con firstVisit no se siembra el flag: Typewriter tipea letra por letra y
      // deja el cursor parpadeando un segundo. Medir en ese momento daría
      // posiciones corridas, porque el cursor ocupa ancho y el título está
      // centrado — este escenario existe justamente para cazar eso.
      if (!firstVisit) sessionStorage.setItem('artifex_system_init', 'true');
      // Antes acá se sembraba un tablero destruido en sessionStorage. Esa
      // persistencia se retiró: cada partida arranca con el tablero entero y
      // los relojes en cero, para que el ranking global compare partidas
      // comparables. `--cycle` ahora usa el turbo y juega de verdad.
      void count;
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
        armed: frame.state.armed,
        digitsDestructible: frame.state.digitsDestructible,
        speed: frame.speed,
        ceilingHits: frame.state.ceilingHits,
      };
    };
  },
  [CYCLE, GLYPH_COUNT, FIRST_VISIT, MARQUEE_SCORES],
);

const page = await context.newPage();

// El check NO puede escribir en el ranking de PRODUCCIÓN: cada corrida dejaría
// una marca basura en la tabla que ven los visitantes. Se intercepta solo el
// alta y se responde con lo que el servidor real respondería; la lectura sigue
// yendo de verdad, que es lo que interesa verificar.
const seededTop = Array.from({ length: MARQUEE_SCORES }, (_, i) => ({
  initials: 'ABC',
  score: (MARQUEE_SCORES - i) * 100,
}));

await page.route('**/hero-pong-score', async (route) => {
  const request = route.request();
  if (request.method() !== 'POST') {
    // Con `--marquee` el ranking también se simula: si no, la consulta real
    // devolvería la tabla vacía y pisaría los scores sembrados, que es
    // justamente lo que el ticker tiene que mostrar.
    if (MARQUEE_SCORES > 0) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ top: seededTop }),
      });
    }
    return route.continue();
  }
  let initials = 'AAA';
  let score = 0;
  try {
    const body = JSON.parse(request.postData() ?? '{}');
    initials = body.initials ?? initials;
    score = body.score ?? score;
  } catch {
    /* cuerpo ilegible: se responde igual */
  }
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ top: [{ initials, score }], rank: 0 }),
  });
});
const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push(e.message));
page.on('console', (m) => {
  // Con la URL: "Failed to load resource" a secas no dice QUÉ falló, y hace
  // falta para distinguir el ranking sin desplegar de un error real.
  if (m.type() === 'error') consoleErrors.push(`${m.text()} ${m.location()?.url ?? ''}`.trim());
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
    marquee: !!document.querySelector('[data-hero-pong="marquee"]'),
  };
});
check('la franja existe en móvil', idle.band);
check('sin canvas antes del toque', !idle.canvas);
check('sin letras partidas antes del toque', idle.glyphs === 0, `${idle.glyphs} spans`);
check('el título no está apagado', idle.titleColor === '');
check('la franja mide 64px de alto', idle.bandRect?.height === 64, `${idle.bandRect?.height}px`);
if (MARQUEE_SCORES > 0) {
  check('el ticker aparece con scores guardados', idle.marquee);
} else {
  check('sin ticker en la primera visita', !idle.marquee);
}

if (!idle.band) {
  console.log('\nno hay franja: nada más que verificar');
  await browser.close();
  process.exit(1);
}

const band = idle.bandRect;

// --- Ticker del top-10 ---
if (MARQUEE_SCORES > 0) {
  console.log('\nticker:');
  const ticker = await page.evaluate(() => {
    const node = document.querySelector('[data-hero-pong="marquee"]');
    const track = node?.firstElementChild;
    return {
      text: node?.textContent ?? '',
      pointerEvents: node ? getComputedStyle(node).pointerEvents : '',
      trackWidth: track ? track.getBoundingClientRect().width : 0,
      x: track ? track.getBoundingClientRect().x : 0,
    };
  });
  check('desfila el top-10 con su título', ticker.text.includes('TOP 10') && ticker.text.includes('1 ABC'));
  check('no participa del hit-test de la franja', ticker.pointerEvents === 'none');
  // Media vuelta tiene que tapar la franja o se ve un hueco en cada ciclo. Con
  // un solo score es donde la cuenta de copias puede quedar corta.
  check(
    'media vuelta cubre el ancho de la franja',
    ticker.trackWidth / 2 >= band.width,
    `${(ticker.trackWidth / 2).toFixed(0)}px vs ${band.width.toFixed(0)}px de franja`,
  );

  await page.waitForTimeout(800);
  const moved = await page.evaluate(
    () => document.querySelector('[data-hero-pong="marquee"]')?.firstElementChild?.getBoundingClientRect().x ?? 0,
  );
  const delta = ticker.x - moved;
  // A MARQUEE_SPEED (32 px/s) son ~26px en 800ms, hacia la izquierda.
  check('se mueve a la velocidad esperada', delta > 15 && delta < 45, `${delta.toFixed(1)}px en 800ms`);

  // El requisito duro: el ticker no puede haber corrido nada de lugar.
  const sectionTop = () =>
    page.evaluate(() => document.querySelectorAll('#root section')[1].getBoundingClientRect().top);
  const withScores = await sectionTop();

  // Al arrancar la partida el ticker se va: la franja es del juego.
  await page.touchscreen.tap(band.x + band.width / 2, band.y + 30);
  await page.waitForSelector('canvas', { timeout: 20000 }).catch(() => {});
  const playing = await page.evaluate(() => ({
    canvas: !!document.querySelector('canvas'),
    marquee: !!document.querySelector('[data-hero-pong="marquee"]'),
  }));
  check('el toque arranca la partida y el ticker desaparece', playing.canvas && !playing.marquee);

  await page.evaluate(() => localStorage.removeItem('artifex_hero_pong_global'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const withoutScores = await sectionTop();
  check(
    'el layout queda idéntico con y sin ticker',
    Math.abs(withScores - withoutScores) < 0.01,
    `${withScores.toFixed(1)}px vs ${withoutScores.toFixed(1)}px`,
  );

  console.log('\nheropong-check: ticker verificado');
  await browser.close();
  process.exit(failures.length ? 1 : 0);
}

// --- Arranque ---
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
  const spans = [...document.querySelectorAll('[data-hero-pong="glyphs"] span')];
  return {
    canvas: !!document.querySelector('canvas'),
    glyphs: spans.length,
    // Letras rotas al ARRANCAR: tiene que ser cero siempre, incluso si la
    // sesión anterior dejó el tablero hecho pedazos.
    hiddenAtStart: spans.filter((s) => s.style.visibility === 'hidden').length,
    // Letras ARMADAS al arrancar: también tiene que ser cero. Una letra sólida
    // en el primer frame no se ve distinta, pero mata la partida antes de que
    // la pelota tome velocidad.
    armedAtStart: window.__last?.armed ?? -1,
    titleColor: painted?.style.color ?? '',
    titleText: document.querySelector('#root h1')?.textContent ?? '',
  };
});
const startedArmed = started.armedAtStart;
check(
  'el tablero arranca entero y sin nada armado',
  started.hiddenAtStart === 0 && startedArmed === 0,
  `${started.hiddenAtStart} rotas, ${startedArmed} armadas al empezar`,
);
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
const speedSamples = [];
for (let i = 0; i < (CYCLE ? 300 : 90); i += 1) {
  const info = await page.evaluate(() => window.__last && {
    x: window.__last.ballLocalX,
    y: window.__last.ballLocalY,
    maxDx: window.__last.maxDx,
    score: window.__last.score,
    cycle: window.__last.cycle,
    resets: window.__last.resets,
    speed: window.__last.speed,
    ceilingHits: window.__last.ceilingHits,
  });
  if (!info) break;
  positions.push(Math.round(info.y));
  minY = Math.min(minY, info.y);
  sawDodge = Math.max(sawDodge, info.maxDx);
  maxScore = Math.max(maxScore, info.score);
  speedSamples.push({ hits: info.ceilingHits, speed: info.speed });
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
  check('rebota en el borde del header', sawCeiling, `${maxScore} puntos`);

  // La PROPIEDAD que define la progresión: la velocidad solo puede cambiar en un
  // golpe que sea número Fibonacci, y entre uno y otro tiene que quedar quieta.
  // Se verifica sin reconstruir la curva: los valores de START_SPEED/SPEED_STEP
  // viven en heroPongConfig.ts y son cosa de los tests unitarios, no de este
  // script, que solo confirma el cableado contra un navegador real.
  const isFibonacci = (n) => {
    let a = 1;
    let b = 2;
    while (a < n) [a, b] = [b, a + b];
    return a === n;
  };
  const changes = [];
  let restarts = 0;
  for (let i = 1; i < speedSamples.length; i += 1) {
    const previous = speedSamples[i - 1];
    const current = speedSamples[i];
    // Los golpes vuelven a cero: es otra partida, y ahí la velocidad DEBE bajar
    // a la inicial. No es una subida fuera de ritmo.
    if (current.hits < previous.hits) {
      restarts += 1;
      continue;
    }
    if (Math.abs(current.speed - previous.speed) < 0.5) continue;
    // Un cambio legítimo sube y cae justo en un golpe Fibonacci.
    changes.push({
      hits: current.hits,
      ok: current.speed > previous.speed && isFibonacci(current.hits),
    });
  }
  const topHits = speedSamples.at(-1)?.hits ?? 0;
  const offBeat = changes.filter((c) => !c.ok);
  check(
    'la velocidad solo sube en golpes Fibonacci',
    speedSamples.length > 0 && offBeat.length === 0,
    offBeat.length
      ? `cambió en ${offBeat.map((c) => c.hits).join(', ')} golpes`
      : `${changes.length} subidas en ${topHits} golpes, ${restarts} partida(s) nueva(s)`,
  );
}
check('las letras esquivan la pelota', sawDodge > 4, `${sawDodge.toFixed(1)}px de desplazamiento`);

// --- Game over: top-10 e iniciales estilo arcade ---
if (!shotArg && !CYCLE) {
  console.log('\ngame over:');
  // Se deja de perseguir la pelota: la partida tiene que perderse sola.
  await page
    .waitForSelector('[data-hero-pong="gameover"]', { timeout: 60000 })
    .catch(() => {});
  const overlay = await page.evaluate(() => {
    const root = document.querySelector('[data-hero-pong="gameover"]');
    return {
      present: !!root,
      canvasGone: !document.querySelector('canvas'),
      slots: root ? root.querySelectorAll('button[aria-label^="Letra"]').length : 0,
      score: root?.querySelector('.text-primary')?.textContent ?? '',
    };
  });
  check('al perder aparece el top-10 sin partida activa', overlay.present && overlay.canvasGone);
  check('el score entra al top-10 y ofrece iniciales', overlay.slots === 6, `${overlay.slots} flechas`);
  check('muestra el score final', Number(overlay.score) > 0 && Number(overlay.score) >= maxScore, overlay.score);

  if (overlay.present && overlay.slots === 6) {
    // B-A-A: un toque en la flecha de arriba del primer slot, y OK.
    await page.locator('[aria-label="Letra 1 siguiente"]').tap();
    await page.locator('[data-hero-pong="gameover"] button', { hasText: 'OK' }).tap();
    // El registro ahora pasa por el ranking global: la tabla aparece cuando el
    // servidor contesta (o cuando se confirma que no está disponible).
    await page
      .waitForFunction(
        () => document.querySelectorAll('[data-hero-pong="gameover"] .justify-between').length > 0,
        null,
        { timeout: 15000 },
      )
      .catch(() => {});
    const stored = await page.evaluate(() => ({
      best: Number(localStorage.getItem('artifex_hero_pong_best') ?? 0),
      initials: localStorage.getItem('artifex_hero_pong_initials') ?? '',
      rows: document.querySelectorAll('[data-hero-pong="gameover"] .justify-between').length,
      bestRow: document.querySelector('[data-hero-pong="local-best"]')?.textContent ?? '',
    }));
    check(
      'la marca personal queda guardada',
      stored.best > 0,
      `mejor ${stored.best}`,
    );
    check(
      'recuerda las iniciales para el próximo intento',
      stored.initials === 'BAA',
      stored.initials,
    );
    check('la pantalla muestra alguna fila', stored.rows >= 1, `${stored.rows} filas`);
    check('destaca tu mejor marca aparte del ranking', stored.bestRow.includes('TU MEJOR'), stored.bestRow);

    // Cualquier toque cierra la tabla y la franja vuelve al reposo.
    await page.touchscreen.tap(195, 100);
    await page.waitForTimeout(300);
    const closed = await page.evaluate(() => ({
      overlay: !!document.querySelector('[data-hero-pong="gameover"]'),
      band: !!document.querySelector('[data-hero-pong="band"]'),
      marquee: document.querySelector('[data-hero-pong="marquee"]')?.textContent ?? '',
    }));
    check('el overlay se cierra y la franja queda lista para otra partida', !closed.overlay && closed.band);
    // El ticker muestra el ranking global y, aparte, TU MEJOR. La partida de un
    // bot dura menos de dos segundos, así que no llega al global (el servidor la
    // descarta por implausible): lo que tiene que aparecer es la marca propia.
    check(
      'el ticker arranca con tu mejor marca',
      closed.marquee.includes('TU MEJOR'),
      closed.marquee.slice(0, 48),
    );
  }
}

if (CYCLE) {
  // Con el turbo (?heropong=turbo) el ciclo corre en segundos, así que este
  // escenario juega de verdad en vez de sembrar estado. Verifica lo que el
  // ranking global necesita: que toda partida arranque igual.
  console.log('\ntablero entre partidas:');
  const final = await page.evaluate(() => {
    const spans = [...document.querySelectorAll('[data-hero-pong="glyphs"] span')];
    return {
      hidden: spans.filter((s) => s.style.visibility === 'hidden').length,
      total: spans.length,
      armed: window.__last?.armed ?? -1,
      cycle: window.__last?.cycle ?? '?',
    };
  });
  check(
    'la sesión anterior no arrastra letras rotas',
    started.hiddenAtStart === 0,
    `${started.hiddenAtStart} rotas al empezar`,
  );
  check(
    'la mayoría sigue en pie después de jugar',
    final.total > 0 && final.hidden < final.total / 4,
    `${final.hidden}/${final.total} ocultas`,
  );
  // El armado tiene que haber ocurrido DURANTE la partida, no venir puesto de
  // antes: con turbo, unos segundos de juego alcanzan para que arme varias.
  check(
    'la dificultad se construye dentro de la partida',
    final.armed >= 1 && startedArmed === 0,
    `${startedArmed} al empezar → ${final.armed} tras jugar, cycle=${final.cycle}`,
  );
}

// --- Ranking global ---
// El juego anda con o sin ranking (cae a la tabla local), así que el estado de
// la edge function se REPORTA en vez de romper la corrida: mientras no esté
// desplegada, sus 404 son el comportamiento esperado y no ruido a esconder.
console.log('\nranking global:');
const leaderboard = await page.evaluate(async (endpoint) => {
  try {
    const response = await fetch(endpoint);
    return { status: response.status, body: await response.text() };
  } catch (error) {
    return { status: 0, body: String(error) };
  }
}, LEADERBOARD_URL);
if (leaderboard.status === 200) {
  check('la edge function responde el top 10', leaderboard.body.includes('top'), leaderboard.body.slice(0, 80));
  // El alta contra el servidor real no se ejercita acá a propósito: se
  // intercepta para no ensuciar el ranking que ven los visitantes. La validación
  // del servidor está cubierta por src/utils/heroPongRun.parity.test.ts.
  console.log('  · el alta se intercepta: este check no escribe en el ranking real');
} else {
  console.log(`  · sin desplegar todavía (HTTP ${leaderboard.status}) — el juego cae a la tabla local`);
}

console.log('\nconsola:');
const noise = consoleErrors.filter((message) => !message.includes('hero-pong-score'));
check('sin errores de página', noise.length === 0, noise.slice(0, 3).join(' | '));

await browser.close();

if (failures.length) {
  console.log(`\nheropong-check: ${failures.length} verificación(es) fallida(s)`);
  process.exit(1);
}
console.log('\nheropong-check: todo en orden');
