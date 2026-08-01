// Máquina de estados "lenta" del hero-pong: todo lo que cambia como máximo una
// vez por segundo (fases, armado de letras, ciclo, dígitos del score).
//
// Vive separada de la física a propósito: la física es mutable y corre 60 veces
// por segundo; esto es inmutable y se puede razonar y testear entero. El engine
// solo traduce eventos y lee el resultado.

export type GamePhase = 'idle' | 'playing' | 'gameover';

/**
 * Vida de una letra:
 *   dodging   se aparta cuando pasa la pelota (estado normal)
 *   rigid     se armó, ya no esquiva; el jugador no tiene forma de saberlo
 *   destroyed la pelota la chocó y desapareció
 *   falling   está volviendo desde el navbar a su lugar
 */
export type LetterPhase = 'dodging' | 'rigid' | 'destroyed' | 'falling';

/**
 * Ciclo del tablero:
 *   arming    se arma una letra cada tanto tiempo de partida
 *   cleared   no queda ninguna letra: pausa larga antes de devolverlas
 *   restoring van cayendo de a una desde el navbar
 *   cooldown  volvieron todas: pausa y arranca un ciclo nuevo
 */
export type CyclePhase = 'arming' | 'cleared' | 'restoring' | 'cooldown';

export interface HeroPongTuning {
  /** Cada cuánto tiempo del ciclo en curso se vuelve rígida una letra al azar. */
  armIntervalMs: number;
  /** Pausa larga con el tablero vacío antes de que las letras vuelvan. */
  clearedPauseMs: number;
  /** Espera entre una letra que empieza a caer y la siguiente. */
  restoreStaggerMs: number;
  /** Pausa con todas las letras de vuelta antes de reiniciar el ciclo. */
  cooldownMs: number;
  /** Tiempo de partida tras el cual los dígitos del contador se pueden romper. */
  digitsUnlockMs: number;
}

export const HERO_PONG_TUNING: HeroPongTuning = {
  // Media letra por minuto: nada sólido en los primeros 30 s, así la pelota
  // toma velocidad antes de que aparezca el primer blanco.
  armIntervalMs: 30_000,
  clearedPauseMs: 20_000,
  restoreStaggerMs: 260,
  cooldownMs: 10_000,
  digitsUnlockMs: 180_000,
};

/** Versión comprimida para poder verificar el ciclo completo sin jugar horas. */
export const HERO_PONG_TURBO: HeroPongTuning = {
  armIntervalMs: 900,
  clearedPauseMs: 2_500,
  restoreStaggerMs: 90,
  cooldownMs: 1_500,
  digitsUnlockMs: 3_000,
};

/** Puntos por golpe al borde del header. */
export const SCORE_CEILING_HIT = 1;
/** Puntos por letra destruida. */
export const SCORE_LETTER = 100;
/** Bonus por vaciar el tablero entero. */
export const SCORE_CLEAR_BONUS = 10_000;

export interface HeroPongState {
  phase: GamePhase;
  cycle: CyclePhase;
  letters: LetterPhase[];
  /** Tiempo desde que arrancó el ciclo de armado en curso: dispara las letras. */
  cycleMs: number;
  /** Letras armadas en el ciclo actual. */
  armed: number;
  /** Ciclos completados (vaciar el tablero y recuperarlo cuenta uno). */
  resets: number;
  digitsDestructible: boolean;
  /** El score se guarda dígito por dígito porque los dígitos se pueden romper. */
  scoreDigits: number[];
  /** Golpes al techo de la partida actual: alimentan la velocidad, no el score. */
  ceilingHits: number;
  /** Letras destruidas en la partida. Con los golpes y los tableros, es la
   *  traza cruda que el servidor usa para recalcular el score sin creerle al
   *  browser (misma regla que el checkout de tufting). */
  lettersDestroyed: number;
  /** Tableros vaciados en la partida. */
  boardsCleared: number;
  /** Cronómetro de la partida actual. */
  elapsedMs: number;
  /** Acumulador de la pausa/ola en curso. */
  cycleTimerMs: number;
  /** Índices que todavía tienen que caer, en el orden en que van a hacerlo. */
  restoreQueue: number[];
}

export type HeroPongEvent =
  | { t: 'start' }
  | { t: 'tick'; dtMs: number; rng: () => number }
  | { t: 'ceilingHit' }
  | { t: 'letterHit'; index: number }
  | { t: 'letterLanded'; index: number }
  | { t: 'digitHit'; index: number }
  | { t: 'lose' };

export const scoreOf = (digits: readonly number[]): number =>
  digits.length ? Number(digits.join('')) : 0;

/** Suma sobre el número que forman los dígitos y re-normaliza (sin ceros a la izquierda). */
export const addScore = (digits: readonly number[], amount: number): number[] =>
  String(scoreOf(digits) + amount)
    .split('')
    .map(Number);

/** Saca un dígito: el score pasa a ser el número que forman los que quedan. */
export const destroyDigit = (digits: readonly number[], index: number): number[] =>
  digits.filter((_, i) => i !== index);

export const createHeroPongState = (letterCount: number): HeroPongState => ({
  phase: 'idle',
  cycle: 'arming',
  letters: Array.from({ length: letterCount }, () => 'dodging' as LetterPhase),
  cycleMs: 0,
  armed: 0,
  resets: 0,
  digitsDestructible: false,
  scoreDigits: [0],
  ceilingHits: 0,
  lettersDestroyed: 0,
  boardsCleared: 0,
  elapsedMs: 0,
  cycleTimerMs: 0,
  restoreQueue: [],
});

const allDestroyed = (letters: readonly LetterPhase[]): boolean =>
  letters.length > 0 && letters.every((l) => l === 'destroyed');

/** Única puerta a `cleared`: el bonus se otorga en la transición, nunca dos veces. */
const enterCleared = (state: HeroPongState): HeroPongState => ({
  ...state,
  cycle: 'cleared',
  cycleTimerMs: 0,
  boardsCleared: state.boardsCleared + 1,
  scoreDigits: addScore(state.scoreDigits, SCORE_CLEAR_BONUS),
});

const shuffled = (values: number[], rng: () => number): number[] => {
  const out = [...values];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/** Arma una letra al azar entre las que todavía esquivan. `-1` si no queda ninguna. */
const pickDodging = (letters: readonly LetterPhase[], rng: () => number): number => {
  const candidates: number[] = [];
  for (let i = 0; i < letters.length; i += 1) {
    if (letters[i] === 'dodging') candidates.push(i);
  }
  if (!candidates.length) return -1;
  return candidates[Math.floor(rng() * candidates.length) % candidates.length];
};

const advanceCycle = (state: HeroPongState, dtMs: number, rng: () => number, tuning: HeroPongTuning): HeroPongState => {
  let next = state;

  switch (next.cycle) {
    case 'arming': {
      // Contra el reloj del ciclo, que arranca en cero con cada partida: media
      // letra por minuto, y nada sólido hasta pasado el primer intervalo.
      const target = Math.floor(next.cycleMs / tuning.armIntervalMs);
      while (next.armed < target) {
        const index = pickDodging(next.letters, rng);
        if (index < 0) break;
        const letters = [...next.letters];
        letters[index] = 'rigid';
        next = { ...next, letters, armed: next.armed + 1 };
      }
      if (allDestroyed(next.letters)) {
        next = enterCleared(next);
      }
      return next;
    }

    case 'cleared': {
      const timer = next.cycleTimerMs + dtMs;
      if (timer < tuning.clearedPauseMs) return { ...next, cycleTimerMs: timer };
      const queue = shuffled(
        next.letters.map((_, i) => i),
        rng,
      );
      return { ...next, cycle: 'restoring', cycleTimerMs: tuning.restoreStaggerMs, restoreQueue: queue };
    }

    case 'restoring': {
      const timer = next.cycleTimerMs + dtMs;
      if (next.restoreQueue.length) {
        if (timer < tuning.restoreStaggerMs) return { ...next, cycleTimerMs: timer };
        const [index, ...rest] = next.restoreQueue;
        const letters = [...next.letters];
        letters[index] = 'falling';
        return { ...next, letters, restoreQueue: rest, cycleTimerMs: 0 };
      }
      // Cola vacía: falta esperar a que aterricen las que están en el aire.
      if (next.letters.some((l) => l === 'falling')) return { ...next, cycleTimerMs: timer };
      return { ...next, cycle: 'cooldown', cycleTimerMs: 0 };
    }

    case 'cooldown': {
      const timer = next.cycleTimerMs + dtMs;
      if (timer < tuning.cooldownMs) return { ...next, cycleTimerMs: timer };
      return {
        ...next,
        cycle: 'arming',
        cycleTimerMs: 0,
        resets: next.resets + 1,
        letters: next.letters.map(() => 'dodging' as LetterPhase),
        armed: 0,
        // El reloj del armado arranca de nuevo con el ciclo.
        cycleMs: 0,
      };
    }
  }
};

export function reduceHeroPong(
  state: HeroPongState,
  event: HeroPongEvent,
  tuning: HeroPongTuning = HERO_PONG_TUNING,
): HeroPongState {
  switch (event.t) {
    case 'start':
      if (state.phase === 'playing') return state;
      // Toda partida arranca IGUAL, para todos: tablero entero, nada armado,
      // relojes en cero. Es lo que hace comparable al ranking global — si la
      // dificultad se arrastrara de partidas anteriores, dos jugadores no
      // estarían jugando al mismo juego.
      return {
        ...state,
        phase: 'playing',
        elapsedMs: 0,
        scoreDigits: [0],
        ceilingHits: 0,
        lettersDestroyed: 0,
        boardsCleared: 0,
        letters: state.letters.map(() => 'dodging' as LetterPhase),
        cycle: 'arming',
        cycleTimerMs: 0,
        restoreQueue: [],
        armed: 0,
        cycleMs: 0,
        resets: 0,
        // Los dígitos rotos son un castigo (romperlos solo baja el score):
        // arrastrarlos haría que el que vuelve a jugar juegue peor.
        digitsDestructible: false,
      };

    case 'tick': {
      if (state.phase !== 'playing') return state;
      const elapsedMs = state.elapsedMs + event.dtMs;
      const withTime = {
        ...state,
        elapsedMs,
        cycleMs: state.cycleMs + event.dtMs,
        // Los dígitos se vuelven rompibles por tiempo de PARTIDA. Antes pedían
        // tres ciclos completos del tablero, que con una letra cada 30 s son
        // más horas de las que el servidor acepta como partida válida: era una
        // mecánica que no se podía ver nunca.
        digitsDestructible: elapsedMs >= tuning.digitsUnlockMs,
      };
      return advanceCycle(withTime, event.dtMs, event.rng, tuning);
    }

    case 'ceilingHit':
      if (state.phase !== 'playing') return state;
      return {
        ...state,
        ceilingHits: state.ceilingHits + 1,
        scoreDigits: addScore(state.scoreDigits, SCORE_CEILING_HIT),
      };

    case 'letterHit': {
      const current = state.letters[event.index];
      if (current !== 'rigid' && current !== 'falling') return state;
      const letters = [...state.letters];
      letters[event.index] = 'destroyed';
      // Una letra golpeada mientras caía vuelve al final de la cola: la ola
      // tiene que poder terminar, si no el ciclo nunca cerraría.
      const restoreQueue =
        current === 'falling' && state.cycle === 'restoring'
          ? [...state.restoreQueue, event.index]
          : state.restoreQueue;
      const next = {
        ...state,
        letters,
        restoreQueue,
        lettersDestroyed: state.lettersDestroyed + 1,
        scoreDigits: addScore(state.scoreDigits, SCORE_LETTER),
      };
      if (next.cycle === 'arming' && allDestroyed(letters)) {
        return enterCleared(next);
      }
      return next;
    }

    case 'letterLanded': {
      if (state.letters[event.index] !== 'falling') return state;
      const letters = [...state.letters];
      letters[event.index] = 'dodging';
      return { ...state, letters };
    }

    case 'digitHit': {
      if (!state.digitsDestructible || state.phase !== 'playing') return state;
      if (event.index < 0 || event.index >= state.scoreDigits.length) return state;
      return { ...state, scoreDigits: destroyDigit(state.scoreDigits, event.index) };
    }

    case 'lose':
      if (state.phase !== 'playing') return state;
      return { ...state, phase: 'gameover' };
  }
}

/**
 * Resumen de la partida que terminó. Además del score lleva la traza cruda de
 * lo que pasó: el ranking global no le cree al número, lo recalcula con estos
 * contadores y rechaza cualquier score que no cierre con ellos.
 */
export interface HeroPongSummary {
  score: number;
  ceilingHits: number;
  lettersDestroyed: number;
  boardsCleared: number;
  elapsedMs: number;
}

export const takeSummary = (state: HeroPongState): HeroPongSummary => ({
  score: scoreOf(state.scoreDigits),
  ceilingHits: state.ceilingHits,
  lettersDestroyed: state.lettersDestroyed,
  boardsCleared: state.boardsCleared,
  elapsedMs: state.elapsedMs,
});

/**
 * Techo del score que una traza permite: cada golpe suma 1, cada letra 100 y
 * cada tablero 10000. Romper dígitos del contador solo puede BAJAR el score,
 * nunca subirlo, así que un score legítimo nunca supera este techo — y eso es
 * lo único que el servidor necesita para descartar un número inventado.
 */
export const maxScoreFor = (run: {
  ceilingHits: number;
  lettersDestroyed: number;
  boardsCleared: number;
}): number =>
  run.ceilingHits * SCORE_CEILING_HIT +
  run.lettersDestroyed * SCORE_LETTER +
  run.boardsCleared * SCORE_CLEAR_BONUS;

// La persistencia de progreso entre partidas se retiró: desde que `start`
// repone el tablero y pone todos los relojes en cero, no quedaba nada que
// transportar. Que no exista estado previo posible es lo que hace DEMOSTRABLE
// que dos jugadores del ranking jugaron al mismo juego, y no solo probable.
