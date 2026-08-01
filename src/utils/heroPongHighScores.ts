// Top-10 de high scores del hero-pong, estilo arcade: iniciales de 3 letras.
//
// Es el único uso de localStorage del sitio, a propósito: el progreso del
// tablero vive en sessionStorage (una sesión), pero un high score tiene que
// sobrevivir a cerrar el navegador o pierde la gracia.

export const HIGH_SCORES_KEY = 'artifex_hero_pong_top10';
export const HIGH_SCORES_LIMIT = 10;

export interface HighScoreEntry {
  /** Tres letras A-Z, como en las recreativas. */
  initials: string;
  score: number;
  /** Epoch ms del registro; 0 si se perdió en una migración. */
  ts: number;
}

const INITIALS_PATTERN = /^[A-Z]{3}$/;

const isEntry = (value: unknown): value is HighScoreEntry => {
  if (!value || typeof value !== 'object') return false;
  const raw = value as Partial<HighScoreEntry>;
  return (
    typeof raw.initials === 'string' &&
    INITIALS_PATTERN.test(raw.initials) &&
    typeof raw.score === 'number' &&
    Number.isFinite(raw.score) &&
    raw.score >= 0
  );
};

/**
 * Valida lo que venga del storage: descarta entradas rotas, re-ordena por score
 * descendente y corta al límite. Mejor una tabla corta que una inconsistente.
 */
export function parseHighScores(raw: unknown): HighScoreEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isEntry)
    .map((entry) => ({
      initials: entry.initials,
      score: entry.score,
      ts: Number.isFinite(entry.ts) ? entry.ts : 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, HIGH_SCORES_LIMIT);
}

/** ¿Este score entra a la tabla? Empatar con el último puesto NO desplaza a nadie. */
export function qualifies(list: readonly HighScoreEntry[], score: number): boolean {
  if (score <= 0) return false;
  if (list.length < HIGH_SCORES_LIMIT) return true;
  return score > list[list.length - 1].score;
}

/**
 * Inserta manteniendo el orden. Los empates quedan DESPUÉS de los existentes:
 * el score viejo retiene su posición, convención arcade. Devuelve el puesto
 * 0-based, o `-1` si no entró.
 */
export function insertScore(
  list: readonly HighScoreEntry[],
  entry: HighScoreEntry,
): { list: HighScoreEntry[]; rank: number } {
  if (!qualifies(list, entry.score)) return { list: [...list], rank: -1 };
  let rank = list.findIndex((existing) => existing.score < entry.score);
  if (rank < 0) rank = list.length;
  const next = [...list.slice(0, rank), entry, ...list.slice(rank)].slice(0, HIGH_SCORES_LIMIT);
  return { list: next, rank };
}

/** Lo crudo del storage, o `null` si no hay nada o el acceso está bloqueado. */
const readRaw = (): string | null => {
  try {
    return localStorage.getItem(HIGH_SCORES_KEY);
  } catch {
    return null;
  }
};

const parseRaw = (raw: string | null): HighScoreEntry[] => {
  if (!raw) return [];
  try {
    return parseHighScores(JSON.parse(raw));
  } catch {
    return [];
  }
};

export function readHighScores(): HighScoreEntry[] {
  return parseRaw(readRaw());
}

/** Evento propio: `storage` solo lo escuchan LAS OTRAS pestañas, no la que escribe. */
const HIGH_SCORES_EVENT = 'artifex:hero-pong-high-scores';

export function writeHighScores(list: readonly HighScoreEntry[]): void {
  try {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(list));
  } catch {
    /* localStorage lleno o bloqueado: la tabla simplemente no persiste */
  }
  // Fuera del try: aunque el guardado falle, quien esté mostrando la tabla tiene
  // que re-leerla.
  window.dispatchEvent(new Event(HIGH_SCORES_EVENT));
}

/** Título del ticker: es el nombre de la tabla, no la cantidad de entradas. */
const MARQUEE_LABEL = `TOP ${HIGH_SCORES_LIMIT}`;
/** U+00B7 existe en toda la pila de --font-mono. */
const MARQUEE_SEPARATOR = ' · ';

/**
 * Una vuelta del ticker: `TOP 10 · 1 RAM 12480 · 2 ART 9100 · `. Termina en
 * separador para que dos copias consecutivas lean corrido.
 *
 * Devuelve '' con la tabla vacía: para quien nunca jugó, el ticker no existe.
 * Respeta el orden recibido, que `parseHighScores` ya dejó ordenado y cortado.
 */
export function formatHighScoresMarquee(list: readonly HighScoreEntry[]): string {
  if (!list.length) return '';
  const rows = list.map((entry, index) => `${index + 1} ${entry.initials} ${entry.score}`);
  return [MARQUEE_LABEL, ...rows].join(MARQUEE_SEPARATOR) + MARQUEE_SEPARATOR;
}

/**
 * Los tres de abajo son el contrato de `useSyncExternalStore`: la tabla es
 * estado externo y mutable, así que el ticker la lee por acá en vez de
 * sincronizarla a mano con un efecto.
 */
let cachedRaw: string | null = null;
let cachedMarquee = '';

export function subscribeHighScores(onChange: () => void): () => void {
  // `storage` solo lo reciben las otras pestañas; el evento propio cubre la que
  // escribe. Ninguno de los dos toca la caché: la invalida el contenido crudo.
  window.addEventListener(HIGH_SCORES_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(HIGH_SCORES_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/**
 * React llama a esto en cada render y exige el MISMO valor mientras nada cambió,
 * así que se cachea contra el string crudo del storage: sin parsear de más, y
 * sin devolver algo viejo si la tabla cambió por una vía que no emitió evento.
 */
export function highScoresMarquee(): string {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedMarquee = formatHighScoresMarquee(parseRaw(raw));
  }
  return cachedMarquee;
}
