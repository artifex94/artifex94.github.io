// "Todas las posiciones posibles, precargadas": la tabla de esquive del hero.
//
// Pretext nos da qué grafema cae en qué línea y cuánto aire le sobra a cada
// línea (el slack). Con eso se precomputa, por glifo y por posición discreta
// del obstáculo, cuánto se corre ese glifo para dejar pasar la pelota. En el
// loop no se calcula nada: se interpola la tabla y se escribe un transform.
//
// El desplazamiento es SOLO horizontal a propósito: mover en Y cambiaría el
// interlineado percibido y el bloque dejaría de verse como el original.

export interface GlyphMetric {
  char: string;
  /** Índice de línea dentro del bloque de texto. */
  line: number;
  /** Caja del grafema, relativa al content box de su bloque. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DodgeConfig {
  /**
   * Ancho objetivo del hueco que se le abre a la pelota. El hueco real queda un
   * poco por debajo: el perfil es suave a propósito (ver `buildDodgeLut`).
   */
  corridor: number;
  /** Posiciones discretas precomputadas por glifo. */
  columns: number;
  /** Recorrido horizontal del obstáculo, en coords del bloque: [x0, x1]. */
  track: readonly [number, number];
  /** Límite duro para los glifos desplazados, en coords del bloque. */
  bounds: readonly [number, number];
  /** Distancia a la que el empuje ya es exactamente cero. */
  falloff: number;
  /** Distancia a la que el empuje es máximo (ancho del "lomo" del perfil). */
  spread: number;
  /** Tope de desplazamiento por glifo. */
  maxShift: number;
}

export const DEFAULT_DODGE_CONFIG: Omit<DodgeConfig, 'track' | 'bounds'> = {
  corridor: 26,
  columns: 32,
  falloff: 84,
  spread: 13,
  maxShift: 22,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Smoothstep: entra y sale sin esquinas, que es lo que hace que se lea como "esquivar". */
const smooth = (t: number): number => {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
};

/** Máximo de `u·e^(−u²/2)`, en u = 1: se usa para normalizar el perfil a 1. */
const PROFILE_PEAK = Math.exp(-0.5);

/**
 * Perfil de empuje, impar y continuo: `u·e^(−u²/2)` normalizado.
 *
 * Impar y continuo importa más que abrir el hueco nominal. Un perfil que
 * decidiera el lado por el signo de la distancia daría un salto de decenas de
 * px justo cuando la pelota cruza el centro de una letra (la letra se
 * teleportaría de lado, y se ve como un glitch). Así el empuje crece desde 0 en
 * el centro, llega al máximo a `spread` y vuelve a 0: las letras se separan
 * alrededor de la pelota sin encimarse ni saltar.
 */
const pushProfile = (distance: number, spread: number): number => {
  const u = distance / Math.max(spread, 0.001);
  return (u * Math.exp(-(u * u) / 2)) / PROFILE_PEAK;
};

interface LineExtent {
  left: number;
  right: number;
}

const lineExtents = (glyphs: readonly GlyphMetric[]): Map<number, LineExtent> => {
  const extents = new Map<number, LineExtent>();
  for (const glyph of glyphs) {
    const current = extents.get(glyph.line);
    if (!current) {
      extents.set(glyph.line, { left: glyph.x, right: glyph.x + glyph.w });
      continue;
    }
    current.left = Math.min(current.left, glyph.x);
    current.right = Math.max(current.right, glyph.x + glyph.w);
  }
  return extents;
};

/**
 * Tabla densa `dx[glyphIndex * columns + column]`.
 *
 * `lineSlack[i]` es el aire que Pretext dice que le sobra a la línea `i`; como
 * el hero está centrado, la mitad de ese aire está disponible a cada lado, y es
 * lo que acota cuánto puede crecer la línea sin desbordar su bloque.
 */
export function buildDodgeLut(
  glyphs: readonly GlyphMetric[],
  lineSlack: readonly number[],
  config: DodgeConfig,
): Float32Array {
  const { corridor, columns, track, bounds, falloff, spread, maxShift } = config;
  const lut = new Float32Array(glyphs.length * columns);
  if (!glyphs.length || columns < 2) return lut;

  const extents = lineExtents(glyphs);
  const [trackStart, trackEnd] = track;
  const maxMagnitude = Math.min(corridor / 2, maxShift);

  for (let g = 0; g < glyphs.length; g += 1) {
    const glyph = glyphs[g];
    const center = glyph.x + glyph.w / 2;
    const extent = extents.get(glyph.line);
    const slack = Math.max(lineSlack[glyph.line] ?? 0, 0);

    // Margen real de la línea: su caja más la mitad del aire que le sobra,
    // sin salirse nunca del límite duro del bloque.
    const lineMin = extent ? Math.max(bounds[0], extent.left - slack / 2) : bounds[0];
    const lineMax = extent ? Math.min(bounds[1], extent.right + slack / 2) : bounds[1];
    const lowerShift = lineMin - glyph.x;
    const upperShift = lineMax - (glyph.x + glyph.w);

    for (let k = 0; k < columns; k += 1) {
      const obstacleX = trackStart + ((trackEnd - trackStart) * k) / (columns - 1);
      const distance = center - obstacleX;
      const away = Math.abs(distance);

      // La ventana lleva el empuje exactamente a 0 en `falloff` (la gaussiana
      // sola nunca llega a cero) y mantiene la continuidad.
      const dx =
        away < falloff
          ? maxMagnitude * pushProfile(distance, spread) * smooth(1 - away / falloff)
          : 0;

      lut[g * columns + k] = clamp(dx, Math.min(lowerShift, 0), Math.max(upperShift, 0));
    }
  }

  return lut;
}

/** Desplazamiento del glifo con el obstáculo en `t` ∈ [0,1] del recorrido, interpolado. */
export function dodgeOffsetAt(
  lut: Float32Array,
  columns: number,
  glyphIndex: number,
  t: number,
): number {
  if (columns < 2) return 0;
  const position = clamp(t, 0, 1) * (columns - 1);
  const low = Math.floor(position);
  const high = Math.min(low + 1, columns - 1);
  const fraction = position - low;
  const base = glyphIndex * columns;
  return lut[base + low] * (1 - fraction) + lut[base + high] * fraction;
}

/**
 * Envolvente vertical 0..1: una línea solo esquiva cuando la pelota está a su
 * altura, y entra/sale con easing en vez de saltar.
 */
export function verticalGate(
  ballY: number,
  lineTop: number,
  lineBottom: number,
  radius: number,
  pad: number,
): number {
  const top = lineTop - pad - radius;
  const bottom = lineBottom + pad + radius;
  if (bottom <= top || ballY <= top || ballY >= bottom) return 0;
  const center = (top + bottom) / 2;
  const halfSpan = (bottom - top) / 2;
  return smooth(1 - Math.abs(ballY - center) / halfSpan);
}
