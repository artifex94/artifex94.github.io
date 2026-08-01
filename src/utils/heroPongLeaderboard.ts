// Cliente del ranking global del hero-pong.
//
// El sitio es estático y no tiene ninguna clave de Supabase en el bundle: todo
// pasa por la edge function `hero-pong-score`, que es la única que toca la
// tabla. Acá no se manda un score "a guardar": se manda la traza de la partida
// y el servidor decide qué puntaje acepta.
//
// Todo esto puede fallar (función fría, sin red, sin desplegar todavía) y eso
// NO puede romper el juego: cada función devuelve `null` y quien la llama se
// queda con la tabla local, que es lo que había antes de existir el ranking.
import { FUNCTIONS_URL } from '../data/supabaseFunctions';
import { writeGlobalScores } from './heroPongHighScores';
import type { HeroPongSummary } from './heroPongState';
// El espejo del servidor: mismas reglas de un solo lado.
import { qualifiesForTop, MIN_ELAPSED_MS } from '../../supabase/functions/_shared/heroPongRun';

const ENDPOINT = `${FUNCTIONS_URL}/hero-pong-score`;
/** Una partida terminada no puede quedar esperando a un servidor dormido. */
const TIMEOUT_MS = 6000;

export interface GlobalScore {
  initials: string;
  score: number;
}

const isGlobalScore = (value: unknown): value is GlobalScore => {
  if (!value || typeof value !== 'object') return false;
  const raw = value as Partial<GlobalScore>;
  return (
    typeof raw.initials === 'string' &&
    /^[A-Z]{3}$/.test(raw.initials) &&
    typeof raw.score === 'number' &&
    Number.isFinite(raw.score) &&
    raw.score > 0
  );
};

/** El servidor es de confianza, pero la respuesta se valida igual: es I/O. */
const parseTop = (payload: unknown): GlobalScore[] | null => {
  if (!payload || typeof payload !== 'object') return null;
  const top = (payload as { top?: unknown }).top;
  if (!Array.isArray(top)) return null;
  return top.filter(isGlobalScore).map((entry) => ({ initials: entry.initials, score: entry.score }));
};

const request = async (init: RequestInit): Promise<unknown | null> => {
  try {
    const response = await fetch(ENDPOINT, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

/** El top 10 global, o `null` si no se pudo consultar. */
export async function fetchGlobalTop(): Promise<GlobalScore[] | null> {
  return parseTop(await request({ method: 'GET' }));
}

/**
 * El cuerpo que viaja al servidor. Vive exportado y aparte para que el test de
 * paridad valide EL PAYLOAD REAL: armarlo a mano en el test fue lo que dejó
 * pasar el bug que rechazaba todas las partidas.
 *
 * `elapsedMs` se redondea acá: el cronómetro del juego suma los `dtMs` de
 * requestAnimationFrame y llega fraccionado.
 */
export function buildRunPayload(initials: string, summary: HeroPongSummary, runId: string) {
  return {
    initials,
    score: summary.score,
    ceilingHits: summary.ceilingHits,
    lettersDestroyed: summary.lettersDestroyed,
    boardsCleared: summary.boardsCleared,
    elapsedMs: Math.round(summary.elapsedMs),
    runId,
  };
}

/**
 * ¿Esta partida es siquiera enviable? El servidor descarta las de menos de dos
 * segundos por implausibles, así que no tiene sentido pedirle iniciales a quien
 * perdió al instante: escribiría tres letras para que no pase nada.
 */
export const isSubmittable = (summary: HeroPongSummary): boolean =>
  summary.score > 0 && Math.round(summary.elapsedMs) >= MIN_ELAPSED_MS;

/** Id de partida, para que un doble envío no registre dos veces. */
export function newRunId(): string {
  const uuid = globalThis.crypto?.randomUUID;
  // randomUUID no existe fuera de un contexto seguro ni en Safari < 15.4, y si
  // esto tirara la pantalla de iniciales quedaría trabada.
  if (typeof uuid === 'function') return uuid.call(globalThis.crypto);
  const bytes = new Uint8Array(16);
  globalThis.crypto?.getRandomValues?.(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Registra la partida. Devuelve la tabla ya actualizada y el puesto obtenido
 * (`-1` si no clasificó), o `null` si el ranking no está disponible.
 *
 * Se manda la traza completa, no solo el score: el servidor recalcula el techo
 * posible y rechaza cualquier número que no cierre con lo que pasó en la
 * partida.
 */
export async function submitGlobalScore(
  initials: string,
  summary: HeroPongSummary,
  runId: string,
): Promise<{ top: GlobalScore[]; rank: number } | null> {
  const payload = await request({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildRunPayload(initials, summary, runId)),
  });

  const top = parseTop(payload);
  if (!top) return null;
  const rank = (payload as { rank?: unknown }).rank;
  return { top, rank: typeof rank === 'number' && Number.isInteger(rank) ? rank : -1 };
}

/**
 * Consulta el ranking y actualiza el espejo local, que es de donde se dibuja el
 * ticker. Silenciosa a propósito: si no hay ranking, el ticker sigue con lo que
 * tenía y nadie se entera.
 */
export async function refreshGlobalScores(): Promise<void> {
  const top = await fetchGlobalTop();
  // `top` vacío también se guarda: si no, un ranking que quedó en cero se
  // seguiría mostrando lleno para siempre.
  if (top) writeGlobalScores(top);
}

/**
 * ¿Este score entra al top global? La regla vive en el módulo compartido con la
 * edge function: el servidor decide lo mismo con el mismo código.
 */
export const qualifiesGlobal = qualifiesForTop;
