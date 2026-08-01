// Validación de una partida del hero-pong, del lado del servidor.
//
// Este archivo NO importa nada a propósito: así lo puede cargar tal cual la
// suite de vitest (ver src/utils/heroPongRun.parity.test.ts), igual que el
// espejo de precios de tufting.
//
// LA REGLA: el browser no manda un score en el que haya que confiar. Manda la
// traza —golpes al techo, letras destruidas, tableros vaciados, duración— y acá
// se recalcula el techo posible con las constantes del servidor. Un score
// inflado se rechaza igual de bien que una traza inflada.
//
// Esto no vuelve honesta a una partida: un cliente modificado puede simular una
// traza plausible. Lo que garantiza es que mandar "999999" no alcance, que es la
// diferencia entre un ranking y un campo de texto público.

/** Espejo de SCORE_* de src/utils/heroPongState.ts. La paridad está testeada. */
export const SCORE_CEILING_HIT = 1;
export const SCORE_LETTER = 100;
export const SCORE_CLEAR_BONUS = 10000;

/**
 * La pelota tiene que bajar hasta la paleta y volver entre golpe y golpe. Aun a
 * la velocidad máxima del juego eso son ~2 golpes por segundo; 4 deja margen
 * para pantallas raras sin volver creíble un bot.
 */
export const MAX_HITS_PER_SECOND = 4;
export const MAX_LETTERS_PER_SECOND = 4;
/** Letras del hero, con margen. Vaciar el tablero las repone, de ahí el `+1`. */
export const LETTERS_PER_BOARD = 200;
export const MAX_BOARDS_CLEARED = 5;
export const MIN_ELAPSED_MS = 2000;
export const MAX_ELAPSED_MS = 4 * 60 * 60 * 1000;
/** Cuántos puestos tiene la tabla. Lo comparten el cliente y el servidor. */
export const TOP_LIMIT = 10;

export const INITIALS_PATTERN = /^[A-Z]{3}$/;

export interface HeroPongRun {
  initials: string;
  score: number;
  ceilingHits: number;
  lettersDestroyed: number;
  boardsCleared: number;
  elapsedMs: number;
  /** Identificador de la partida, para no registrarla dos veces. Opcional. */
  runId: string | null;
}

/** Contadores del juego: enteros y acotados. El tope corta cualquier disparate. */
const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < 1e7;

/**
 * La duración NO es un contador: el cronómetro del juego suma los `dtMs` que
 * entrega requestAnimationFrame, que son decimales, así que llega fraccionada
 * (42318.399…). Exigirle ser entero rechazaba el 100% de las partidas reales.
 *
 * El redondeo del lado del servidor es TOLERANCIA a los clientes ya cacheados,
 * no el contrato: el cliente manda el valor ya redondeado.
 */
const asDuration = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const ms = Math.floor(value);
  return ms >= MIN_ELAPSED_MS && ms <= MAX_ELAPSED_MS ? ms : null;
};

/** Id de partida: se acepta cualquier token corto, o su ausencia. */
const asRunId = (value: unknown): string | null =>
  typeof value === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(value) ? value : null;

/**
 * Score máximo que una traza permite. Romper dígitos del contador solo puede
 * BAJAR el score, nunca subirlo, así que un score legítimo nunca supera esto.
 */
export const maxScoreForRun = (run: {
  ceilingHits: number;
  lettersDestroyed: number;
  boardsCleared: number;
}): number =>
  run.ceilingHits * SCORE_CEILING_HIT +
  run.lettersDestroyed * SCORE_LETTER +
  run.boardsCleared * SCORE_CLEAR_BONUS;

/** `null` si la partida es imposible; si no, la partida ya normalizada. */
export function validateRun(body: unknown): HeroPongRun | null {
  if (!body || typeof body !== 'object') return null;
  const raw = body as Record<string, unknown>;

  const initials = typeof raw.initials === 'string' ? raw.initials.toUpperCase() : '';
  if (!INITIALS_PATTERN.test(initials)) return null;

  const { score, ceilingHits, lettersDestroyed, boardsCleared } = raw;
  // Uno por uno y no con un `.every`: así TypeScript los estrecha a number.
  if (!isCount(score) || !isCount(ceilingHits) || !isCount(lettersDestroyed)) return null;
  if (!isCount(boardsCleared)) return null;
  if (score <= 0) return null;

  const elapsedMs = asDuration(raw.elapsedMs);
  if (elapsedMs === null) return null;

  const seconds = elapsedMs / 1000;
  if (ceilingHits > seconds * MAX_HITS_PER_SECOND) return null;
  if (lettersDestroyed > seconds * MAX_LETTERS_PER_SECOND) return null;
  if (boardsCleared > MAX_BOARDS_CLEARED) return null;
  // No se pueden romper más letras de las que hay sobre el tablero.
  if (lettersDestroyed > LETTERS_PER_BOARD * (boardsCleared + 1)) return null;

  const run = { ceilingHits, lettersDestroyed, boardsCleared };
  if (score > maxScoreForRun(run)) return null;

  return {
    initials,
    score,
    ceilingHits,
    lettersDestroyed,
    boardsCleared,
    elapsedMs,
    // Ausente se acepta a propósito: los bundles ya cacheados en los teléfonos
    // postean sin id, y exigirlo los dejaría a todos afuera.
    runId: asRunId(raw.runId),
  };
}

/** ¿Este score entra al top? Empatar al último NO desplaza a nadie. */
export function qualifiesForTop(
  top: readonly { score: number }[],
  score: number,
  limit = TOP_LIMIT,
): boolean {
  if (score <= 0) return false;
  if (top.length < limit) return true;
  return score > top[top.length - 1].score;
}
