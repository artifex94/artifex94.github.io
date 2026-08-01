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
): Promise<{ top: GlobalScore[]; rank: number } | null> {
  const payload = await request({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      initials,
      score: summary.score,
      ceilingHits: summary.ceilingHits,
      lettersDestroyed: summary.lettersDestroyed,
      boardsCleared: summary.boardsCleared,
      elapsedMs: summary.elapsedMs,
    }),
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
  if (top?.length) writeGlobalScores(top);
}

/** ¿Este score entra al top global? Empatar al último NO desplaza a nadie. */
export function qualifiesGlobal(top: readonly GlobalScore[], score: number): boolean {
  if (score <= 0) return false;
  if (top.length < 10) return true;
  return score > top[top.length - 1].score;
}
