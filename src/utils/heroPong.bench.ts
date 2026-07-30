import { bench, describe } from 'vitest';
import {
  buildDodgeLut,
  dodgeOffsetAt,
  verticalGate,
  DEFAULT_DODGE_CONFIG,
  type DodgeConfig,
  type GlyphMetric,
} from './heroDodge';
import { circleRectHit, reflect, subStepCount, type Ball, type Rect } from './heroPongPhysics';
import { createHeroPongState, reduceHeroPong, HERO_PONG_TUNING } from './heroPongState';

// Benchmarks de la lógica del hero-pong. No corren con `vitest run` (solo con
// `vitest bench`), así que no alargan la suite.
//
// Sirven para dos cosas concretas:
//   · Dejar por escrito el costo del trabajo que el loop hace por frame, para
//     que una regresión sea un número y no una sensación.
//   · Verificar el presupuesto: con 186 letras a 60fps, el frame tiene 16,7ms
//     para todo, y esta parte tiene que quedar en el orden de microsegundos.

/** El hero real: 186 letras jugables repartidas en 9 líneas. */
const GLYPH_COUNT = 186;
const LINE_COUNT = 9;
const ADVANCE = 10.8;

const glyphs: GlyphMetric[] = Array.from({ length: GLYPH_COUNT }, (_, i) => {
  const line = Math.floor(i / (GLYPH_COUNT / LINE_COUNT));
  const column = i % Math.ceil(GLYPH_COUNT / LINE_COUNT);
  return {
    char: 'x',
    line,
    x: column * ADVANCE,
    y: line * 29.25,
    w: ADVANCE,
    h: 21,
  };
});
const slack = Array.from({ length: LINE_COUNT }, (_, i) => 40 + i * 10);

const config: DodgeConfig = {
  ...DEFAULT_DODGE_CONFIG,
  track: [0, 358],
  bounds: [-12, 370],
};
const lut = buildDodgeLut(glyphs, slack, config);

describe('tabla de esquive', () => {
  // Se paga una sola vez al arrancar la partida, no por frame.
  bench('buildDodgeLut (186 letras × 32 columnas)', () => {
    buildDodgeLut(glyphs, slack, config);
  });

  // Esto sí es por frame: una consulta por letra de las líneas que cruza la
  // pelota. El peor caso realista son dos líneas, ~46 letras.
  bench('dodgeOffsetAt × 46 (dos líneas activas)', () => {
    for (let i = 0; i < 46; i += 1) dodgeOffsetAt(lut, config.columns, i, 0.42);
  });

  bench('verticalGate × 9 líneas', () => {
    for (let i = 0; i < LINE_COUNT; i += 1) {
      verticalGate(120, i * 29.25, i * 29.25 + 21, 4, 8);
    }
  });
});

describe('física', () => {
  const ball: Ball = { x: 180, y: 120, vx: 210, vy: -260, r: 4 };
  const rect: Rect = { x: 176, y: 112, w: 10.8, h: 21 };
  const missing: Rect = { x: 300, y: 400, w: 10.8, h: 21 };

  bench('circleRectHit sin contacto', () => {
    circleRectHit(ball, missing);
  });

  bench('circleRectHit con contacto + reflect', () => {
    const hit = circleRectHit(ball, rect);
    if (hit) reflect(ball, hit);
  });

  // Peor caso del tablero: todas las letras armadas y a la altura de la pelota.
  bench('circleRectHit × 186 (todas sólidas)', () => {
    for (let i = 0; i < GLYPH_COUNT; i += 1) {
      circleRectHit(ball, { x: glyphs[i].x, y: glyphs[i].y, w: glyphs[i].w, h: glyphs[i].h });
    }
  });

  bench('subStepCount', () => {
    subStepCount(1300, 16.7, 8);
  });
});

describe('máquina de estados', () => {
  const idle = createHeroPongState(GLYPH_COUNT);
  const playing = reduceHeroPong(idle, { t: 'start' }, HERO_PONG_TUNING);
  const rng = () => 0.42;

  // Un tick por frame: es el único costo fijo del reducer en el loop.
  bench('reduceHeroPong tick', () => {
    reduceHeroPong(playing, { t: 'tick', dtMs: 16.7, rng }, HERO_PONG_TUNING);
  });

  bench('reduceHeroPong ceilingHit', () => {
    reduceHeroPong(playing, { t: 'ceilingHit' }, HERO_PONG_TUNING);
  });
});
