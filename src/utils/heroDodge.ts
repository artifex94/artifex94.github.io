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
  /**
   * Cuánto puede invadir una letra el aire lateral del bloque además del slack
   * de su línea. Sin esto una línea que ocupa todo el ancho (slack ≈ 0) no
   * podría esquivar nada, ni siquiera un par de píxeles.
   */
  overflow: number;
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
  overflow: 12,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Smoothstep: entra y sale sin esquinas, que es lo que hace que se lea como "esquivar". */
const smooth = (t: number): number => {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
};

/**
 * Perfil de empuje: impar, continuo, y con la bajada REPARTIDA.
 *
 * Tres propiedades, y las tres son necesarias:
 *
 * · Impar y continuo. Un perfil que eligiera el lado por el signo de la
 *   distancia daría un salto de decenas de px justo cuando la pelota cruza el
 *   centro de una letra: la letra se teleportaría de lado y se ve como un
 *   glitch.
 * · Sube de 0 (en el centro) a 1 en `spread`. Ahí las letras se separan, que es
 *   lo que abre el hueco.
 * · Baja de 1 a 0 repartido en todo `[spread, falloff]`. Esta es la parte sutil:
 *   en la bajada las letras se COMPRIMEN entre sí (la de adelante se corre más
 *   que la de atrás), así que la pendiente tiene que ser suave. Con una caída
 *   tipo gaussiana la compresión llegaba al 57% y las letras del párrafo se
 *   encimaban; repartida en 70px queda en ~25%, que no se nota.
 */
const pushProfile = (distance: number, spread: number, falloff: number): number => {
  const away = Math.abs(distance);
  const safeSpread = Math.max(spread, 0.001);
  const rise = smooth(away / safeSpread);
  const fall = smooth((falloff - away) / Math.max(falloff - safeSpread, 0.001));
  const magnitude = Math.min(rise, fall);
  return distance < 0 ? -magnitude : magnitude;
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
  const { corridor, columns, track, bounds, falloff, spread, maxShift, overflow } = config;
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

    // Margen real de la línea: su caja, más la mitad del aire que le sobra (el
    // texto está centrado), más el desborde permitido; y nunca más allá del
    // límite duro del bloque.
    const lineMin = extent ? Math.max(bounds[0], extent.left - slack / 2 - overflow) : bounds[0];
    const lineMax = extent ? Math.min(bounds[1], extent.right + slack / 2 + overflow) : bounds[1];
    const lowerShift = lineMin - glyph.x;
    const upperShift = lineMax - (glyph.x + glyph.w);

    for (let k = 0; k < columns; k += 1) {
      const obstacleX = trackStart + ((trackEnd - trackStart) * k) / (columns - 1);
      const distance = center - obstacleX;
      const away = Math.abs(distance);

      const dx = away < falloff ? maxMagnitude * pushProfile(distance, spread, falloff) : 0;

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
