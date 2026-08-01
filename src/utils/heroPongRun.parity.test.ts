import { describe, it, expect } from 'vitest';
import {
  createHeroPongState,
  maxScoreFor,
  reduceHeroPong,
  scoreOf,
  takeSummary,
  SCORE_CEILING_HIT,
  SCORE_CLEAR_BONUS,
  SCORE_LETTER,
  HERO_PONG_TUNING,
  type HeroPongState,
} from './heroPongState';
// El validador del servidor no importa nada, así que se puede cargar tal cual.
import * as server from '../../supabase/functions/_shared/heroPongRun';
import { buildRunPayload, newRunId } from './heroPongLeaderboard';

// El ranking global es el único lugar del juego donde el navegador le habla a un
// servidor, y la regla del sitio es que el servidor no le cree al cliente (la
// misma que hace que el checkout de tufting no acepte montos).
//
// Este test cuida las dos formas de romper eso:
//   - que una partida REAL sea rechazada, porque el puntaje del servidor quedó
//     desincronizado del cliente y el jugador pierde su récord;
//   - que una partida IMPOSIBLE sea aceptada.

const TUNING = HERO_PONG_TUNING;

const run = (over: Record<string, unknown> = {}): unknown => ({
  initials: 'RAM',
  score: 450,
  ceilingHits: 50,
  lettersDestroyed: 4,
  boardsCleared: 0,
  elapsedMs: 60_000,
  ...over,
});

/** El mismo resumen, con la forma que produce el juego. */
const runSummary = {
  score: 450,
  ceilingHits: 50,
  lettersDestroyed: 4,
  boardsCleared: 0,
  elapsedMs: 60_000,
};

describe('paridad de puntaje entre el juego y la edge function', () => {
  it('usa las mismas constantes de las dos partes', () => {
    expect(server.SCORE_CEILING_HIT).toBe(SCORE_CEILING_HIT);
    expect(server.SCORE_LETTER).toBe(SCORE_LETTER);
    expect(server.SCORE_CLEAR_BONUS).toBe(SCORE_CLEAR_BONUS);
  });

  it('calcula el mismo techo para cualquier traza', () => {
    for (const ceilingHits of [0, 1, 37, 500]) {
      for (const lettersDestroyed of [0, 1, 12, 186]) {
        for (const boardsCleared of [0, 1, 3]) {
          const trace = { ceilingHits, lettersDestroyed, boardsCleared };
          expect(server.maxScoreForRun(trace), JSON.stringify(trace)).toBe(maxScoreFor(trace));
        }
      }
    }
  });

  it('acepta una partida realmente jugada, con el cronómetro fraccionario', () => {
    // ESTE es el test que faltaba. El cronómetro del juego suma los `dtMs` de
    // requestAnimationFrame, que son decimales, y el validador exigía enteros:
    // rechazaba el 100% de las partidas reales y el ranking quedaba vacío.
    // Antes se armaba el cuerpo a mano en el test y por eso no se veía; ahora
    // pasa por `buildRunPayload`, que es el camino real.
    // Un minuto de juego a 60 fps, con un rebote contra el techo cada 3 s: el
    // ritmo de alguien que de verdad está manteniendo la pelota en el aire.
    let state: HeroPongState = reduceHeroPong(createHeroPongState(5), { t: 'start' }, TUNING);
    for (let frame = 0; frame < 3600; frame += 1) {
      state = reduceHeroPong(state, { t: 'tick', dtMs: 16.667, rng: () => 0 }, TUNING);
      if (frame % 180 === 0) state = reduceHeroPong(state, { t: 'ceilingHit' }, TUNING);
    }
    state = reduceHeroPong(state, { t: 'lose' }, TUNING);

    const summary = takeSummary(state);
    expect(Number.isInteger(summary.elapsedMs)).toBe(false);

    const accepted = server.validateRun(buildRunPayload('RAM', summary, newRunId()));
    expect(accepted).not.toBeNull();
    expect(accepted!.score).toBe(scoreOf(state.scoreDigits));
  });

  it('acepta el payload sin runId: los bundles ya cacheados postean sin él', () => {
    const payload = buildRunPayload('RAM', { ...runSummary, elapsedMs: 60_000.4 }, '');
    const accepted = server.validateRun({ ...payload, runId: undefined });
    expect(accepted).not.toBeNull();
    expect(accepted!.runId).toBeNull();
  });

  it('descarta un runId con forma inválida en vez de mandarlo a la base', () => {
    expect(server.validateRun(run({ runId: 'x' }))?.runId).toBeNull();
    expect(server.validateRun(run({ runId: '../../drop' }))?.runId).toBeNull();
    expect(server.validateRun(run({ runId: 'run-1234-abcd' }))?.runId).toBe('run-1234-abcd');
  });

  it('la regla de quién entra al top es la misma de los dos lados', () => {
    const full = Array.from({ length: 10 }, (_, i) => ({ score: (10 - i) * 100 }));
    expect(server.qualifiesForTop([], 1)).toBe(true);
    expect(server.qualifiesForTop(full, 101)).toBe(true);
    expect(server.qualifiesForTop(full, 100)).toBe(false);
    expect(server.qualifiesForTop([], 0)).toBe(false);
  });

  it('acepta un score MENOR al techo: romper dígitos solo puede bajarlo', () => {
    expect(server.validateRun(run({ score: 1 }))).not.toBeNull();
  });

  it('rechaza un score por encima de lo que la traza permite', () => {
    // 50 golpes + 4 letras = 450 como máximo.
    expect(server.validateRun(run({ score: 451 }))).toBeNull();
    expect(server.validateRun(run({ score: 999_999 }))).toBeNull();
  });

  it('rechaza una traza imposible en el tiempo declarado', () => {
    // 50 golpes en 2 segundos son 25 por segundo: la pelota no llega.
    expect(server.validateRun(run({ elapsedMs: 2000 }))).toBeNull();
    expect(server.validateRun(run({ lettersDestroyed: 5000, score: 1 }))).toBeNull();
  });

  it('rechaza más letras de las que hay sobre el tablero', () => {
    expect(
      server.validateRun(run({ lettersDestroyed: 400, boardsCleared: 0, elapsedMs: 600_000, score: 1 })),
    ).toBeNull();
  });

  it('rechaza tableros vaciados de más', () => {
    expect(server.validateRun(run({ boardsCleared: 99, score: 1 }))).toBeNull();
  });

  it('rechaza partidas demasiado cortas o demasiado largas', () => {
    expect(server.validateRun(run({ elapsedMs: 100, ceilingHits: 0, score: 1 }))).toBeNull();
    expect(server.validateRun(run({ elapsedMs: 5 * 60 * 60 * 1000 }))).toBeNull();
  });

  it('exige tres letras y normaliza a mayúsculas', () => {
    expect(server.validateRun(run({ initials: 'ram' }))?.initials).toBe('RAM');
    expect(server.validateRun(run({ initials: 'RA' }))).toBeNull();
    expect(server.validateRun(run({ initials: 'RAM1' }))).toBeNull();
    expect(server.validateRun(run({ initials: '' }))).toBeNull();
  });

  it('rechaza números que no son cuentas enteras', () => {
    expect(server.validateRun(run({ score: 4.5 }))).toBeNull();
    expect(server.validateRun(run({ ceilingHits: -1 }))).toBeNull();
    expect(server.validateRun(run({ score: Number.POSITIVE_INFINITY }))).toBeNull();
    expect(server.validateRun(run({ score: 0 }))).toBeNull();
    expect(server.validateRun(null)).toBeNull();
    expect(server.validateRun('nope')).toBeNull();
  });
});
