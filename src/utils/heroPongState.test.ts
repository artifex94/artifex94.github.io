import { describe, it, expect } from 'vitest';
import {
  createHeroPongState,
  reduceHeroPong,
  scoreOf,
  addScore,
  destroyDigit,
  takeProgress,
  takeSummary,
  applyProgress,
  HERO_PONG_TUNING,
  SCORE_LETTER,
  SCORE_CLEAR_BONUS,
  type HeroPongState,
  type HeroPongTuning,
} from './heroPongState';

const TUNING: HeroPongTuning = {
  armIntervalMs: 1000,
  clearedPauseMs: 2000,
  restoreStaggerMs: 100,
  cooldownMs: 500,
  resetsToUnlockDigits: 3,
};

// RNG determinista: siempre elige el primer candidato.
const firstRng = () => 0;

const play = (letters: number): HeroPongState =>
  reduceHeroPong(createHeroPongState(letters), { t: 'start' }, TUNING);

const tick = (state: HeroPongState, dtMs: number, rng = firstRng): HeroPongState =>
  reduceHeroPong(state, { t: 'tick', dtMs, rng }, TUNING);

/** Avanza el reloj en pasos de 16ms, aplicando un callback en cada frame. */
const run = (
  state: HeroPongState,
  totalMs: number,
  onFrame?: (s: HeroPongState) => HeroPongState,
): HeroPongState => {
  let current = state;
  for (let elapsed = 0; elapsed < totalMs; elapsed += 16) {
    current = tick(current, 16);
    if (onFrame) current = onFrame(current);
  }
  return current;
};

/**
 * Avanza hasta que se cumple la condición y para ahí. Necesario para observar
 * una transición: pasado el reset el ciclo arranca de nuevo y arma otra letra,
 * así que correr un tiempo fijo pisaría lo que se quiere medir.
 */
const runUntil = (
  state: HeroPongState,
  done: (s: HeroPongState) => boolean,
  onFrame?: (s: HeroPongState) => HeroPongState,
  limitMs = 60_000,
): HeroPongState => {
  let current = state;
  for (let elapsed = 0; elapsed < limitMs; elapsed += 16) {
    if (done(current)) return current;
    current = tick(current, 16);
    if (onFrame) current = onFrame(current);
  }
  throw new Error('runUntil: la condición no se cumplió dentro del límite');
};

/** Aterriza la letra que esté cayendo, si hay alguna. */
const landFalling = (s: HeroPongState): HeroPongState => {
  const falling = s.letters.indexOf('falling');
  return falling >= 0 ? reduceHeroPong(s, { t: 'letterLanded', index: falling }, TUNING) : s;
};

describe('score por dígitos', () => {
  it('lee el número que forman los dígitos', () => {
    expect(scoreOf([1, 2, 7])).toBe(127);
    expect(scoreOf([])).toBe(0);
    expect(scoreOf([0])).toBe(0);
  });

  it('suma y re-normaliza', () => {
    expect(addScore([1, 7], 1)).toEqual([1, 8]);
    expect(addScore([9], 1)).toEqual([1, 0]);
    expect(addScore([], 1)).toEqual([1]);
    // Sin ceros a la izquierda: 07 + 1 = 8.
    expect(addScore([0, 7], 1)).toEqual([8]);
  });

  it('suma montos grandes, incluso después de perder un dígito', () => {
    expect(addScore([4, 2], 100)).toEqual([1, 4, 2]);
    expect(addScore([0], 10_000)).toEqual([1, 0, 0, 0, 0]);
    // destroyDigit([1,2,7], 1) = 17; 17 + 100 = 117.
    expect(addScore(destroyDigit([1, 2, 7], 1), 100)).toEqual([1, 1, 7]);
  });

  it('al romper un dígito deja el número que forman los que quedan', () => {
    expect(destroyDigit([1, 2, 7], 1)).toEqual([1, 7]);
    expect(scoreOf(destroyDigit([1, 2, 7], 1))).toBe(17);
    expect(destroyDigit([5], 0)).toEqual([]);
    expect(scoreOf(destroyDigit([5], 0))).toBe(0);
  });

  it('sigue contando desde el número nuevo', () => {
    const reduced = destroyDigit([1, 2, 7], 1); // 17
    expect(scoreOf(addScore(reduced, 1))).toBe(18);
  });
});

describe('golpes al techo', () => {
  it('suma un punto y un golpe por rebote', () => {
    let state = play(4);
    state = reduceHeroPong(state, { t: 'ceilingHit' }, TUNING);
    state = reduceHeroPong(state, { t: 'ceilingHit' }, TUNING);
    expect(scoreOf(state.scoreDigits)).toBe(2);
    expect(state.ceilingHits).toBe(2);
  });

  it('no cuenta fuera de partida', () => {
    const idle = createHeroPongState(4);
    const hit = reduceHeroPong(idle, { t: 'ceilingHit' }, TUNING);
    expect(scoreOf(hit.scoreDigits)).toBe(0);
    expect(hit.ceilingHits).toBe(0);
  });

  it('los golpes se reinician con cada partida, junto con el score', () => {
    let state = play(4);
    state = reduceHeroPong(state, { t: 'ceilingHit' }, TUNING);
    state = reduceHeroPong(state, { t: 'lose' }, TUNING);
    state = reduceHeroPong(state, { t: 'start' }, TUNING);
    expect(state.ceilingHits).toBe(0);
    expect(scoreOf(state.scoreDigits)).toBe(0);
  });
});

describe('puntaje por letras', () => {
  it('cada letra destruida vale SCORE_LETTER', () => {
    let state = run(play(3), 1000);
    const rigid = state.letters.indexOf('rigid');
    const before = scoreOf(state.scoreDigits);
    state = reduceHeroPong(state, { t: 'letterHit', index: rigid }, TUNING);
    expect(scoreOf(state.scoreDigits)).toBe(before + SCORE_LETTER);
  });

  it('golpear una letra que esquiva no suma', () => {
    let state = run(play(3), 1000);
    const dodging = state.letters.indexOf('dodging');
    const before = scoreOf(state.scoreDigits);
    state = reduceHeroPong(state, { t: 'letterHit', index: dodging }, TUNING);
    expect(scoreOf(state.scoreDigits)).toBe(before);
  });

  it('vaciar el tablero paga el bonus una sola vez', () => {
    let state = play(2);
    state = run(state, 2000); // las dos armadas
    const before = scoreOf(state.scoreDigits);
    state = reduceHeroPong(state, { t: 'letterHit', index: 0 }, TUNING);
    state = reduceHeroPong(state, { t: 'letterHit', index: 1 }, TUNING);
    expect(state.cycle).toBe('cleared');
    expect(scoreOf(state.scoreDigits)).toBe(before + 2 * SCORE_LETTER + SCORE_CLEAR_BONUS);
    // Ticks posteriores en `cleared` no re-otorgan nada.
    state = run(state, 500);
    expect(scoreOf(state.scoreDigits)).toBe(before + 2 * SCORE_LETTER + SCORE_CLEAR_BONUS);
  });

  it('un tablero vacío guardado no paga el bonus: la partida nueva lo repone', () => {
    // El progreso viejo puede traer todo destruido, pero `start` repone el
    // tablero, así que nadie cobra 10000 por una partida que no jugó.
    const restored = applyProgress(
      createHeroPongState(2),
      { letters: ['destroyed', 'destroyed'], playedMs: 0, armed: 2, resets: 0, cycle: 'arming', cycleTimerMs: 0, restoreQueue: [] },
      TUNING,
    );
    let state = reduceHeroPong(restored, { t: 'start' }, TUNING);
    state = tick(state, 16);
    expect(state.cycle).toBe('arming');
    expect(scoreOf(state.scoreDigits)).toBe(0);
    expect(state.boardsCleared).toBe(0);
  });

  it('perder no toca el score y el resumen lo refleja', () => {
    let state = play(3);
    state = reduceHeroPong(state, { t: 'ceilingHit' }, TUNING);
    state = run(state, 1000);
    const rigid = state.letters.indexOf('rigid');
    state = reduceHeroPong(state, { t: 'letterHit', index: rigid }, TUNING);
    const before = scoreOf(state.scoreDigits);
    state = reduceHeroPong(state, { t: 'lose' }, TUNING);
    expect(scoreOf(state.scoreDigits)).toBe(before);
    const summary = takeSummary(state);
    expect(summary.score).toBe(before);
    expect(summary.ceilingHits).toBe(1);
    expect(summary.elapsedMs).toBeGreaterThan(0);
  });
});

describe('armado de letras', () => {
  it('vuelve rígida una letra por intervalo de tiempo jugado', () => {
    let state = play(5);
    state = run(state, 1000);
    expect(state.letters.filter((l) => l === 'rigid')).toHaveLength(1);
    state = run(state, 1000);
    expect(state.letters.filter((l) => l === 'rigid')).toHaveLength(2);
  });

  it('no arma nada antes del primer intervalo', () => {
    const state = run(play(5), 900);
    expect(state.letters.every((l) => l === 'dodging')).toBe(true);
  });

  it('no arma con el juego parado', () => {
    const idle = createHeroPongState(5);
    const state = tick(idle, 5000);
    expect(state.letters.every((l) => l === 'dodging')).toBe(true);
    expect(state.playedMs).toBe(0);
  });

  it('acumula tiempo entre partidas de la misma sesión', () => {
    let state = run(play(5), 600);
    state = reduceHeroPong(state, { t: 'lose' }, TUNING);
    state = reduceHeroPong(state, { t: 'start' }, TUNING);
    expect(state.playedMs).toBeGreaterThan(0);
    // Los 600ms de la partida anterior cuentan: alcanza el intervalo antes.
    state = run(state, 500);
    expect(state.letters.filter((l) => l === 'rigid')).toHaveLength(1);
  });

  it('cada partida arranca con el tablero entero', () => {
    // Se arma una letra y se destruye: el tablero queda tocado.
    let state = run(play(5), 1000);
    const rigid = state.letters.indexOf('rigid');
    state = reduceHeroPong(state, { t: 'letterHit', index: rigid }, TUNING);
    expect(state.letters).toContain('destroyed');

    state = reduceHeroPong(state, { t: 'lose' }, TUNING);
    state = reduceHeroPong(state, { t: 'start' }, TUNING);

    expect(state.letters.every((l) => l === 'dodging')).toBe(true);
    expect(state.armed).toBe(0);
    expect(state.cycle).toBe('arming');
    expect(state.restoreQueue).toEqual([]);
    expect(state.elapsedMs).toBe(0);
    expect(scoreOf(state.scoreDigits)).toBe(0);
    expect(state.ceilingHits).toBe(0);
    expect(state.lettersDestroyed).toBe(0);
  });

  it('el tablero vuelve entero pero la dificultad acumulada no se pierde', () => {
    // Un minuto jugado deja el reloj de armado en 1.
    let state = run(play(5), 1000);
    state = reduceHeroPong(state, { t: 'lose' }, TUNING);
    state = reduceHeroPong(state, { t: 'start' }, TUNING);
    // Recién empezada no hay ninguna armada...
    expect(state.letters.every((l) => l === 'dodging')).toBe(true);
    // ...pero el reloj sobrevivió, así que vuelve a armar enseguida. Sin esto
    // haría falta jugar 186 minutos seguidos para vaciar el tablero.
    state = tick(state, 16);
    expect(state.letters.filter((l) => l === 'rigid')).toHaveLength(1);
  });

  it('no arma más letras si no queda ninguna esquivando', () => {
    let state = play(2);
    state = run(state, 1000);
    state = run(state, 1000);
    expect(state.letters.every((l) => l === 'rigid')).toBe(true);
    const armedBefore = state.armed;
    state = run(state, 3000);
    expect(state.armed).toBe(armedBefore);
  });
});

describe('destrucción de letras', () => {
  it('destruye una letra rígida y no una que esquiva', () => {
    let state = run(play(3), 1000);
    const rigidIndex = state.letters.indexOf('rigid');
    const dodgingIndex = state.letters.indexOf('dodging');

    state = reduceHeroPong(state, { t: 'letterHit', index: dodgingIndex }, TUNING);
    expect(state.letters[dodgingIndex]).toBe('dodging');

    state = reduceHeroPong(state, { t: 'letterHit', index: rigidIndex }, TUNING);
    expect(state.letters[rigidIndex]).toBe('destroyed');
  });

  it('pasa a la pausa larga cuando no queda ninguna letra', () => {
    let state = play(2);
    state = run(state, 2000); // las dos armadas
    state.letters.forEach((_, i) => {
      state = reduceHeroPong(state, { t: 'letterHit', index: i }, TUNING);
    });
    expect(state.cycle).toBe('cleared');
  });
});

describe('ciclo completo', () => {
  const clearBoard = (letters: number): HeroPongState => {
    let state = play(letters);
    // Arma y destruye todas.
    for (let i = 0; i < letters; i += 1) {
      state = run(state, TUNING.armIntervalMs);
      const rigid = state.letters.indexOf('rigid');
      if (rigid >= 0) state = reduceHeroPong(state, { t: 'letterHit', index: rigid }, TUNING);
    }
    return state;
  };

  it('mantiene el tablero vacío durante la pausa larga', () => {
    let state = clearBoard(3);
    expect(state.cycle).toBe('cleared');
    state = run(state, TUNING.clearedPauseMs - 100);
    expect(state.letters.every((l) => l === 'destroyed')).toBe(true);
  });

  it('devuelve las letras a su lugar y recuperan el esquive', () => {
    const state = runUntil(clearBoard(3), (s) => s.cycle === 'cooldown', landFalling);
    expect(state.letters.every((l) => l === 'dodging')).toBe(true);
  });

  it('reinicia el ciclo y lo cuenta', () => {
    const state = runUntil(clearBoard(2), (s) => s.resets === 1, landFalling);
    expect(state.cycle).toBe('arming');
    expect(state.armed).toBe(0);
    expect(state.playedMs).toBe(0);
    expect(state.letters.every((l) => l === 'dodging')).toBe(true);
  });

  it('la ola termina aunque la pelota intercepte letras cayendo', () => {
    let intercepted = 0;
    const state = runUntil(
      clearBoard(3),
      (s) => s.resets === 1,
      (s) => {
        const falling = s.letters.indexOf('falling');
        if (falling < 0) return s;
        // Las primeras tres que caen se destruyen en el aire; deben reintentar.
        if (intercepted < 3) {
          intercepted += 1;
          return reduceHeroPong(s, { t: 'letterHit', index: falling }, TUNING);
        }
        return reduceHeroPong(s, { t: 'letterLanded', index: falling }, TUNING);
      },
    );
    expect(intercepted).toBe(3);
    expect(state.letters.every((l) => l === 'dodging')).toBe(true);
  });

  it('habilita los dígitos destruibles recién en el tercer reset', () => {
    // Con una sola letra el ciclo es: armar, destruir, pausa, devolver, reset.
    const restoreUntil = (s: HeroPongState, target: number): HeroPongState =>
      runUntil(s, (x) => x.resets === target, landFalling);
    const emptyBoard = (s: HeroPongState): HeroPongState => {
      const armed = runUntil(s, (x) => x.letters[0] === 'rigid');
      return reduceHeroPong(armed, { t: 'letterHit', index: 0 }, TUNING);
    };

    let state = restoreUntil(clearBoard(1), 1);
    expect(state.digitsDestructible).toBe(false);
    state = restoreUntil(emptyBoard(state), 2);
    expect(state.digitsDestructible).toBe(false);
    state = restoreUntil(emptyBoard(state), 3);
    expect(state.resets).toBe(3);
    expect(state.digitsDestructible).toBe(true);
  });
});

describe('dígitos destruibles', () => {
  it('ignora los golpes a dígitos antes del desbloqueo', () => {
    let state = play(3);
    state = reduceHeroPong(state, { t: 'ceilingHit' }, TUNING);
    state = reduceHeroPong(state, { t: 'digitHit', index: 0 }, TUNING);
    expect(scoreOf(state.scoreDigits)).toBe(1);
  });

  it('rompe el dígito y sigue contando desde el número que queda', () => {
    let state: HeroPongState = { ...play(3), digitsDestructible: true, scoreDigits: [1, 2, 7] };
    state = reduceHeroPong(state, { t: 'digitHit', index: 1 }, TUNING);
    expect(scoreOf(state.scoreDigits)).toBe(17);
    state = reduceHeroPong(state, { t: 'ceilingHit' }, TUNING);
    expect(scoreOf(state.scoreDigits)).toBe(18);
  });

  it('ignora índices fuera de rango', () => {
    const state: HeroPongState = { ...play(3), digitsDestructible: true, scoreDigits: [4] };
    expect(reduceHeroPong(state, { t: 'digitHit', index: 3 }, TUNING).scoreDigits).toEqual([4]);
    expect(reduceHeroPong(state, { t: 'digitHit', index: -1 }, TUNING).scoreDigits).toEqual([4]);
  });
});

describe('progreso entre partidas', () => {
  it('sobrevive un ida y vuelta por serialización', () => {
    const state = run(play(4), 2000);
    const restored = applyProgress(
      createHeroPongState(4),
      JSON.parse(JSON.stringify(takeProgress(state))),
      TUNING,
    );
    expect(restored.letters).toEqual(state.letters);
    expect(restored.playedMs).toBe(state.playedMs);
    expect(restored.armed).toBe(state.armed);
    expect(restored.phase).toBe('idle');
  });

  it('descarta el progreso si cambió la cantidad de letras', () => {
    const progress = takeProgress(run(play(4), 2000));
    const base = createHeroPongState(6);
    expect(applyProgress(base, progress, TUNING)).toBe(base);
  });

  it('descarta basura sin explotar', () => {
    const base = createHeroPongState(3);
    expect(applyProgress(base, null, TUNING)).toBe(base);
    expect(applyProgress(base, 'nope', TUNING)).toBe(base);
    expect(applyProgress(base, { letters: ['wat', 'wat', 'wat'] }, TUNING)).toBe(base);
    expect(applyProgress(base, { letters: ['dodging', 'rigid', 'destroyed'], cycle: 'x' }, TUNING)).toBe(base);
  });

  it('reconstruye el desbloqueo de dígitos desde los resets guardados', () => {
    const restored = applyProgress(
      createHeroPongState(2),
      { letters: ['dodging', 'dodging'], playedMs: 0, armed: 0, resets: 3, cycle: 'arming', cycleTimerMs: 0, restoreQueue: [] },
      TUNING,
    );
    expect(restored.digitsDestructible).toBe(true);
  });

  it('filtra índices inválidos de la cola de restauración', () => {
    const restored = applyProgress(
      createHeroPongState(2),
      { letters: ['destroyed', 'destroyed'], playedMs: 0, armed: 0, resets: 0, cycle: 'restoring', cycleTimerMs: 0, restoreQueue: [0, 9, -1, 1] },
      TUNING,
    );
    expect(restored.restoreQueue).toEqual([0, 1]);
  });
});

describe('valores de producción', () => {
  it('arma una letra por minuto', () => {
    expect(HERO_PONG_TUNING.armIntervalMs).toBe(60_000);
  });

  it('pide tres resets para los dígitos', () => {
    expect(HERO_PONG_TUNING.resetsToUnlockDigits).toBe(3);
  });
});
