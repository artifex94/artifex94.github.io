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
 *   arming    se arma una letra por minuto jugado
 *   cleared   no queda ninguna letra: pausa larga antes de devolverlas
 *   restoring van cayendo de a una desde el navbar
 *   cooldown  volvieron todas: pausa y arranca un ciclo nuevo
 */
export type CyclePhase = 'arming' | 'cleared' | 'restoring' | 'cooldown';

export interface HeroPongTuning {
  /** Cada cuánto tiempo JUGADO se vuelve rígida una letra al azar. */
  armIntervalMs: number;
  /** Pausa larga con el tablero vacío antes de que las letras vuelvan. */
  clearedPauseMs: number;
  /** Espera entre una letra que empieza a caer y la siguiente. */
  restoreStaggerMs: number;
  /** Pausa con todas las letras de vuelta antes de reiniciar el ciclo. */
  cooldownMs: number;
  /** Resets necesarios para que los dígitos del contador se puedan romper. */
  resetsToUnlockDigits: number;
}

export const HERO_PONG_TUNING: HeroPongTuning = {
  armIntervalMs: 60_000,
  clearedPauseMs: 20_000,
  restoreStaggerMs: 260,
  cooldownMs: 10_000,
  resetsToUnlockDigits: 3,
};

/** Versión comprimida para poder verificar el ciclo completo sin jugar horas. */
export const HERO_PONG_TURBO: HeroPongTuning = {
  armIntervalMs: 900,
  clearedPauseMs: 2_500,
  restoreStaggerMs: 90,
  cooldownMs: 1_500,
  resetsToUnlockDigits: 3,
};

export interface HeroPongState {
  phase: GamePhase;
  cycle: CyclePhase;
  letters: LetterPhase[];
  /** Tiempo jugado acumulado en la sesión: es lo que dispara el armado. */
  playedMs: number;
  /** Letras armadas en el ciclo actual. */
  armed: number;
  /** Ciclos completados (vaciar el tablero y recuperarlo cuenta uno). */
  resets: number;
  digitsDestructible: boolean;
  /** El score se guarda dígito por dígito porque los dígitos se pueden romper. */
  scoreDigits: number[];
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

/** Suma uno y re-normaliza (así `[0,7]` + 1 queda `[8]`, sin ceros a la izquierda). */
export const incrementScore = (digits: readonly number[]): number[] =>
  String(scoreOf(digits) + 1)
    .split('')
    .map(Number);

/** Saca un dígito: el score pasa a ser el número que forman los que quedan. */
export const destroyDigit = (digits: readonly number[], index: number): number[] =>
  digits.filter((_, i) => i !== index);

export const createHeroPongState = (letterCount: number): HeroPongState => ({
  phase: 'idle',
  cycle: 'arming',
  letters: Array.from({ length: letterCount }, () => 'dodging' as LetterPhase),
  playedMs: 0,
  armed: 0,
  resets: 0,
  digitsDestructible: false,
  scoreDigits: [0],
  elapsedMs: 0,
  cycleTimerMs: 0,
  restoreQueue: [],
});

const allDestroyed = (letters: readonly LetterPhase[]): boolean =>
  letters.length > 0 && letters.every((l) => l === 'destroyed');

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
      // El armado se mide contra el tiempo jugado acumulado, no contra la
      // partida: si no, con partidas de menos de un minuto nunca pasaría nada.
      const target = Math.floor(next.playedMs / tuning.armIntervalMs);
      while (next.armed < target) {
        const index = pickDodging(next.letters, rng);
        if (index < 0) break;
        const letters = [...next.letters];
        letters[index] = 'rigid';
        next = { ...next, letters, armed: next.armed + 1 };
      }
      if (allDestroyed(next.letters)) {
        next = { ...next, cycle: 'cleared', cycleTimerMs: 0 };
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
      const resets = next.resets + 1;
      return {
        ...next,
        cycle: 'arming',
        cycleTimerMs: 0,
        resets,
        digitsDestructible: resets >= tuning.resetsToUnlockDigits,
        letters: next.letters.map(() => 'dodging' as LetterPhase),
        armed: 0,
        // El conteo del minuto arranca de nuevo con el ciclo.
        playedMs: 0,
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
      return { ...state, phase: 'playing', elapsedMs: 0, scoreDigits: [0] };

    case 'tick': {
      if (state.phase !== 'playing') return state;
      const withTime = {
        ...state,
        elapsedMs: state.elapsedMs + event.dtMs,
        playedMs: state.playedMs + event.dtMs,
      };
      return advanceCycle(withTime, event.dtMs, event.rng, tuning);
    }

    case 'ceilingHit':
      if (state.phase !== 'playing') return state;
      return { ...state, scoreDigits: incrementScore(state.scoreDigits) };

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
      const next = { ...state, letters, restoreQueue };
      if (next.cycle === 'arming' && allDestroyed(letters)) {
        return { ...next, cycle: 'cleared', cycleTimerMs: 0 };
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

/** Lo que sobrevive entre partidas de la misma sesión (el progreso del tablero). */
export interface HeroPongProgress {
  letters: LetterPhase[];
  playedMs: number;
  armed: number;
  resets: number;
  cycle: CyclePhase;
  cycleTimerMs: number;
  restoreQueue: number[];
}

export const takeProgress = (state: HeroPongState): HeroPongProgress => ({
  letters: state.letters,
  playedMs: state.playedMs,
  armed: state.armed,
  resets: state.resets,
  cycle: state.cycle,
  cycleTimerMs: state.cycleTimerMs,
  restoreQueue: state.restoreQueue,
});

const LETTER_PHASES: readonly LetterPhase[] = ['dodging', 'rigid', 'destroyed', 'falling'];
const CYCLE_PHASES: readonly CyclePhase[] = ['arming', 'cleared', 'restoring', 'cooldown'];

/**
 * Reconstruye el estado desde lo guardado. Descarta el progreso si el texto
 * cambió (otra cantidad de letras) o si algo no valida: es mejor arrancar de
 * cero que arrastrar un tablero inconsistente.
 */
export function applyProgress(
  base: HeroPongState,
  progress: unknown,
  tuning: HeroPongTuning = HERO_PONG_TUNING,
): HeroPongState {
  if (!progress || typeof progress !== 'object') return base;
  const raw = progress as Partial<HeroPongProgress>;
  if (!Array.isArray(raw.letters) || raw.letters.length !== base.letters.length) return base;
  if (!raw.letters.every((l) => LETTER_PHASES.includes(l))) return base;
  if (raw.cycle && !CYCLE_PHASES.includes(raw.cycle)) return base;

  const playedMs = Number.isFinite(raw.playedMs) ? Math.max(raw.playedMs as number, 0) : 0;
  const resets = Number.isFinite(raw.resets) ? Math.max(raw.resets as number, 0) : 0;
  const queue = Array.isArray(raw.restoreQueue)
    ? raw.restoreQueue.filter((i) => Number.isInteger(i) && i >= 0 && i < base.letters.length)
    : [];

  return {
    ...base,
    letters: [...raw.letters],
    playedMs,
    armed: Number.isFinite(raw.armed) ? Math.max(raw.armed as number, 0) : 0,
    resets,
    digitsDestructible: resets >= tuning.resetsToUnlockDigits,
    cycle: raw.cycle ?? 'arming',
    cycleTimerMs: Number.isFinite(raw.cycleTimerMs) ? Math.max(raw.cycleTimerMs as number, 0) : 0,
    restoreQueue: queue,
  };
}
