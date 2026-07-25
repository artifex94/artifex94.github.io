import {
  hexToRgb,
  labToSrgb,
  nearestPaletteIndex,
  srgbToLab,
  type Lab,
  type Rgb,
} from '../utils/color';

// Realismo de la lana: cómo se ven en tufting los colores de un diseño.
//
// La calculadora NO parte de un inventario de conos: toma los colores del PROPIO
// diseño (ver ../utils/paletteExtract) y lleva cada uno al tono que la lana
// realmente puede dar. La lana es un material mate y de gama acotada — no hay
// fluor ni degradés — así que un color muy saturado de pantalla se teje siempre
// más apagado. `toWoolTone` modela justamente eso.
//
// Los "tonos de referencia" de más abajo NO son la paleta contra la que se
// cuantiza el diseño: sirven solo para ponerle un NOMBRE humano a cada color
// detectado ("se parece a Terracota") en la interfaz y en el mensaje de WhatsApp,
// y como opciones para el color del borde.

export interface Wool {
  /** Identificador estable del tono de referencia. */
  id: string;
  /** Nombre que ve el cliente. */
  name: string;
  /** Color en hexadecimal. */
  hex: string;
  /** Derivado de hex. */
  rgb: Rgb;
  /** Derivado de hex. Es contra esto que se busca el nombre más cercano. */
  lab: Lab;
}

interface WoolSeed {
  id: string;
  name: string;
  hex: string;
}

// Tonos de referencia para nombrar colores y elegir el borde. Cubren la rueda
// cromática más blanco/negro/grises, todos en registros plausibles de lana.
const WOOL_SEEDS: readonly WoolSeed[] = [
  { id: 'blanco-crudo', name: 'Blanco crudo', hex: '#f4f1ea' },
  { id: 'crema', name: 'Crema', hex: '#e8dcc4' },
  { id: 'arena', name: 'Arena', hex: '#c9b18c' },
  { id: 'caramelo', name: 'Caramelo', hex: '#a9713f' },
  { id: 'chocolate', name: 'Chocolate', hex: '#5b3a2a' },
  { id: 'negro', name: 'Negro', hex: '#1a1a1a' },
  { id: 'gris-perla', name: 'Gris perla', hex: '#b8b5b0' },
  { id: 'gris-topo', name: 'Gris topo', hex: '#6e6a66' },
  { id: 'terracota', name: 'Terracota', hex: '#c25e4c' },
  { id: 'rojo', name: 'Rojo', hex: '#b3272d' },
  { id: 'rosa-viejo', name: 'Rosa viejo', hex: '#d99a9a' },
  { id: 'mostaza', name: 'Mostaza', hex: '#e0a72c' },
  { id: 'naranja', name: 'Naranja', hex: '#e2703a' },
  { id: 'verde-oliva', name: 'Verde oliva', hex: '#6b7a45' },
  { id: 'verde-bosque', name: 'Verde bosque', hex: '#2f5d45' },
  { id: 'verde-agua', name: 'Verde agua', hex: '#8fbfae' },
  { id: 'celeste', name: 'Celeste', hex: '#8fb4d9' },
  { id: 'azul-noche', name: 'Azul noche', hex: '#2b3f6b' },
  { id: 'violeta', name: 'Violeta', hex: '#7a4a86' },
  { id: 'lila', name: 'Lila', hex: '#b9a0cc' },
];

/** Completa cada tono con su representación en RGB y CIELAB. */
const hydrate = (seed: WoolSeed): Wool => {
  const rgb = hexToRgb(seed.hex);
  return { ...seed, rgb, lab: srgbToLab(rgb) };
};

export const wools: readonly Wool[] = WOOL_SEEDS.map(hydrate);

/** Busca un tono de referencia por id. Devuelve undefined si no existe. */
export const woolById = (id: string): Wool | undefined => wools.find((wool) => wool.id === id);

/**
 * Techo de croma que la lana puede alcanzar (en unidades CIELAB).
 *
 * La lana es un material mate: no llega a los saturados de una pantalla. Todo lo
 * que en el diseño supere este croma se recorta hasta acá antes de teñirse.
 */
export const CHROMA_CEILING = 55;

/**
 * Factor de "apagado" mate que se aplica al croma ya recortado.
 *
 * Aun por debajo del techo, un color en lana se lee un poco más apagado que en
 * pantalla. 0.88 baja la saturación lo justo para que se sienta hilo y no píxel.
 */
export const MATTE_SCALE = 0.88;

/**
 * Croma por debajo del cual un color se considera acromático.
 *
 * Un gris "puro" en sRGB no da exactamente a=b=0 al pasar a CIELAB: quedan
 * residuos de coma flotante. Por debajo de este umbral la diferencia es
 * imperceptible, así que el color se deja intacto en vez de apagarlo.
 */
const ACHROMATIC_CHROMA = 0.5;

/**
 * Lleva un color CIELAB al tono que la lana realmente puede dar.
 *
 * Trabaja sobre el croma sin tocar el tono ni la luminancia: recorta el croma al
 * techo y lo apaga. Los acromáticos (blanco, negro, gris) quedan intactos — la
 * lana sí los tiene puros.
 */
export const woolToneLab = ([l, a, b]: Lab): Lab => {
  const chroma = Math.hypot(a, b);
  if (chroma < ACHROMATIC_CHROMA) return [l, a, b];
  const target = Math.min(chroma, CHROMA_CEILING) * MATTE_SCALE;
  const scale = target / chroma;
  return [l, a * scale, b * scale];
};

/** El mismo tono de lana, partiendo y devolviendo sRGB. */
export const toWoolTone = (rgb: Rgb): { rgb: Rgb; lab: Lab } => {
  const lab = woolToneLab(srgbToLab(rgb));
  return { lab, rgb: labToSrgb(lab) };
};

/** Nombre humano del tono de referencia más cercano a un color CIELAB. */
export const nameForTone = (lab: Lab): string =>
  wools[nearestPaletteIndex(lab, wools.map((wool) => wool.lab))].name;

/**
 * Color del borde por defecto.
 *
 * El borde perimetral suele hacerse en un color liso que contraste con el
 * diseño; el cliente puede cambiarlo, pero conviene arrancar con algo neutro.
 */
export const DEFAULT_BORDER_WOOL_ID = 'negro';

/**
 * Máximo de colores distintos por pieza.
 *
 * Límite de nitidez, no técnico: cada color extra es un pasaje más de la pistola
 * y la lana no resuelve detalle fino. Por encima de este número la pieza se
 * empasta en vez de leerse; el diseño se reduce a esta cantidad de regiones.
 */
export const MAX_WOOLS_PER_PIECE = 6;
