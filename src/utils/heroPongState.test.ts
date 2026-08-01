import { describe, it, expect } from 'vitest';
import {
  createHeroPongState,
  reduceHeroPong,
  scoreOf,
  addScore,
  destroyDigit,
  takeSummary,
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
  digitsUnlockMs: 5000,
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

  it('un tablero heredado vacío no paga el bonus: la partida nueva lo repone', () => {
    // Aunque el estado venga con todo destruido, `start` repone el tablero, así
    // que nadie cobra 10000 por una partida que no jugó.
    const wrecked: HeroPongState = {
      ...createHeroPongState(2),
      letters: ['destroyed', 'destroyed'],
      armed: 2,
    };
    let state = reduceHeroPong(wrecked, { t: 'start' }, TUNING);
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
    expect(state.cycleMs).toBe(0);
  });

  it('no arma nada en el primer intervalo, para que la pelota tome velocidad', () => {
    const state = run(play(5), TUNING.armIntervalMs - 16);
    expect(state.letters.every((l) => l === 'dodging')).toBe(true);
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

  it('la dificultad NO se hereda: dos partidas seguidas arman en el mismo instante', () => {
    // Es lo que hace comparable al ranking global. Antes la segunda partida
    // arrancaba con letras ya armadas desde el primer frame.
    const firstArmsAt = (state: HeroPongState): number => {
      let current = state;
      for (let ms = 0; ms < TUNING.armIntervalMs * 3; ms += 16) {
        if (current.letters.some((l) => l === 'rigid')) return ms;
        current = tick(current, 16);
      }
      throw new Error('nunca armó');
    };

    const first = play(5);
    const firstMs = firstArmsAt(first);

    // Se juega un rato largo, se pierde y se vuelve a empezar.
    let state = run(first, TUNING.armIntervalMs * 2);
    state = reduceHeroPong(state, { t: 'lose' }, TUNING);
    state = reduceHeroPong(state, { t: 'start' }, TUNING);

    expect(state.letters.every((l) => l === 'dodging')).toBe(true);
    expect(state.cycleMs).toBe(0);
    expect(state.resets).toBe(0);
    expect(state.digitsDestructible).toBe(false);
    expect(firstArmsAt(state)).toBe(firstMs);
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
    expect(state.cycleMs).toBe(0);
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

});

describe('dígitos destruibles', () => {
  it('se desbloquean por tiempo de PARTIDA, no por ciclos del tablero', () => {
    // Antes pedían tres ciclos completos del tablero: con una letra cada 30 s
    // eso era más tiempo del que el servidor acepta como partida válida, o sea
    // una mecánica que no se podía ver nunca.
    let state = run(play(3), TUNING.digitsUnlockMs - 100);
    expect(state.digitsDestructible).toBe(false);
    state = run(state, 200);
    expect(state.digitsDestructible).toBe(true);
    // Y no se heredan: la partida siguiente vuelve a arrancar sin el castigo.
    state = reduceHeroPong(state, { t: 'lose' }, TUNING);
    state = reduceHeroPong(state, { t: 'start' }, TUNING);
    expect(state.digitsDestructible).toBe(false);
  });

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

describe('valores de producción', () => {
  it('arma media letra por minuto, sin nada sólido en los primeros 30 s', () => {
    expect(HERO_PONG_TUNING.armIntervalMs).toBe(30_000);
  });

  it('desbloquea los dígitos a los tres minutos de partida', () => {
    expect(HERO_PONG_TUNING.digitsUnlockMs).toBe(180_000);
  });
});
