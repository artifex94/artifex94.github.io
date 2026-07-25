// Color perceptual: sRGB <-> CIELAB, distancia CIEDE2000 y asignación a paleta.
//
// POR QUÉ NO ALCANZA CON RGB:
// sRGB está codificado en gamma y es perceptualmente NO uniforme: la misma
// distancia euclidiana significa diferencias visuales muy distintas según dónde
// caiga. Además ignora que el ojo pesa el verde mucho más que el azul (~3:6:1).
// Mapear una foto a una paleta de lanas usando distancia RGB no produce errores
// sutiles: produce caras verdes y grises que caen en la lana equivocada.
//
// Por eso todo el matching pasa a CIELAB y se compara con CIEDE2000, que es la
// métrica que acierta justo donde RGB falla (pieles y saturados).
//
// Todas las funciones de este módulo son puras y no tocan canvas ni DOM: se
// pueden testear en jsdom y correr igual en el hilo principal, en un worker o
// del lado del servidor.

export type Rgb = readonly [number, number, number];
export type Lab = readonly [number, number, number];

// Punto blanco D65, el que asume sRGB.
const WHITE_X = 0.95047;
const WHITE_Y = 1.0;
const WHITE_Z = 1.08883;

// Constantes del tramo lineal de CIELAB: delta = 6/29.
const DELTA = 6 / 29;
const DELTA_CUBED = DELTA * DELTA * DELTA;
const DELTA_SQUARED_X3 = 3 * DELTA * DELTA;

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/** Quita la gamma de sRGB: canal 0-255 a intensidad lineal 0-1. */
const srgbChannelToLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

/** Reaplica la gamma de sRGB: intensidad lineal 0-1 a canal 0-255. */
const linearToSrgbChannel = (linear: number): number => {
  const c = linear <= 0.0031308 ? linear * 12.92 : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, Math.round(c * 255)));
};

/** Función auxiliar f() de la definición de CIELAB. */
const labF = (t: number): number =>
  t > DELTA_CUBED ? Math.cbrt(t) : t / DELTA_SQUARED_X3 + 4 / 29;

/** Inversa de labF. */
const labFInverse = (t: number): number =>
  t > DELTA ? t * t * t : DELTA_SQUARED_X3 * (t - 4 / 29);

/** Convierte un color sRGB (0-255 por canal) a CIELAB. */
export const srgbToLab = ([r, g, b]: Rgb): Lab => {
  const lr = srgbChannelToLinear(r);
  const lg = srgbChannelToLinear(g);
  const lb = srgbChannelToLinear(b);

  // Matriz sRGB -> XYZ con punto blanco D65.
  const x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / WHITE_X;
  const y = (0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb) / WHITE_Y;
  const z = (0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb) / WHITE_Z;

  const fx = labF(x);
  const fy = labF(y);
  const fz = labF(z);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};

/** Convierte CIELAB de vuelta a sRGB (0-255 por canal, recortado al gamut). */
export const labToSrgb = ([l, a, b]: Lab): Rgb => {
  const fy = (l + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;

  const x = labFInverse(fx) * WHITE_X;
  const y = labFInverse(fy) * WHITE_Y;
  const z = labFInverse(fz) * WHITE_Z;

  // Matriz XYZ -> sRGB (inversa de la de arriba).
  const lr = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const lg = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
  const lb = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

  return [linearToSrgbChannel(lr), linearToSrgbChannel(lg), linearToSrgbChannel(lb)];
};

/** Parsea "#rrggbb" (o "#rgb") a sRGB. Tira si el formato no es válido. */
export const hexToRgb = (hex: string): Rgb => {
  const clean = hex.trim().replace(/^#/, '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Color hexadecimal inválido: "${hex}"`);
  }

  const value = parseInt(full, 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
};

/** Serializa sRGB a "#rrggbb". */
export const rgbToHex = ([r, g, b]: Rgb): string =>
  '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');

const POW_25_7 = Math.pow(25, 7);

/**
 * Diferencia de color CIEDE2000 entre dos colores CIELAB.
 *
 * Implementa la formulación de Sharma, Wu & Dalal (2005). El término de rotación
 * de tono (RT) es el que corrige los azules saturados y es fácil de equivocar de
 * forma silenciosa, por eso el test lo verifica contra el set de referencia
 * publicado por esos autores.
 */
export const deltaE2000 = (lab1: Lab, lab2: Lab): number => {
  const [l1, a1, b1] = lab1;
  const [l2, a2, b2] = lab2;

  const c1 = Math.hypot(a1, b1);
  const c2 = Math.hypot(a2, b2);
  const cBar = (c1 + c2) / 2;

  const cBar7 = Math.pow(cBar, 7);
  const g = 0.5 * (1 - Math.sqrt(cBar7 / (cBar7 + POW_25_7)));

  const a1p = (1 + g) * a1;
  const a2p = (1 + g) * a2;

  const c1p = Math.hypot(a1p, b1);
  const c2p = Math.hypot(a2p, b2);

  // Tono en grados [0, 360). Indefinido (0 por convención) si el color es acromático.
  const h1p = c1p === 0 ? 0 : (Math.atan2(b1, a1p) * RAD_TO_DEG + 360) % 360;
  const h2p = c2p === 0 ? 0 : (Math.atan2(b2, a2p) * RAD_TO_DEG + 360) % 360;

  const deltaLp = l2 - l1;
  const deltaCp = c2p - c1p;

  const cProduct = c1p * c2p;
  let deltahp = 0;
  if (cProduct !== 0) {
    const diff = h2p - h1p;
    if (diff > 180) deltahp = diff - 360;
    else if (diff < -180) deltahp = diff + 360;
    else deltahp = diff;
  }

  const deltaHp = 2 * Math.sqrt(cProduct) * Math.sin((deltahp / 2) * DEG_TO_RAD);

  const lBarP = (l1 + l2) / 2;
  const cBarP = (c1p + c2p) / 2;

  let hBarP: number;
  if (cProduct === 0) {
    hBarP = h1p + h2p;
  } else {
    const sum = h1p + h2p;
    const diff = Math.abs(h1p - h2p);
    if (diff <= 180) hBarP = sum / 2;
    else if (sum < 360) hBarP = (sum + 360) / 2;
    else hBarP = (sum - 360) / 2;
  }

  const t =
    1 -
    0.17 * Math.cos((hBarP - 30) * DEG_TO_RAD) +
    0.24 * Math.cos(2 * hBarP * DEG_TO_RAD) +
    0.32 * Math.cos((3 * hBarP + 6) * DEG_TO_RAD) -
    0.2 * Math.cos((4 * hBarP - 63) * DEG_TO_RAD);

  const deltaTheta = 30 * Math.exp(-Math.pow((hBarP - 275) / 25, 2));
  const cBarP7 = Math.pow(cBarP, 7);
  const rc = 2 * Math.sqrt(cBarP7 / (cBarP7 + POW_25_7));
  const rt = -Math.sin(2 * deltaTheta * DEG_TO_RAD) * rc;

  const lBarP50 = Math.pow(lBarP - 50, 2);
  const sl = 1 + (0.015 * lBarP50) / Math.sqrt(20 + lBarP50);
  const sc = 1 + 0.045 * cBarP;
  const sh = 1 + 0.015 * cBarP * t;

  const termL = deltaLp / sl;
  const termC = deltaCp / sc;
  const termH = deltaHp / sh;

  return Math.sqrt(termL * termL + termC * termC + termH * termH + rt * termC * termH);
};

/** Índice de la lana más cercana dentro de `palette`, comparando con CIEDE2000. */
export const nearestPaletteIndex = (lab: Lab, palette: readonly Lab[]): number => {
  let bestIndex = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < palette.length; i += 1) {
    const distance = deltaE2000(lab, palette[i]);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  return bestIndex;
};

/** Bits por canal de la tabla de búsqueda. 5 bits = 32 niveles = 32.768 celdas. */
export const LUT_BITS = 5;
const LUT_LEVELS = 1 << LUT_BITS; // 32
const LUT_SIZE = LUT_LEVELS ** 3; // 32.768
const LUT_SHIFT = 8 - LUT_BITS; // 3

/**
 * Precomputa una tabla RGB -> índice de lana.
 *
 * CIEDE2000 cuesta unos 40 flops: correrlo por píxel sobre un millón de píxeles
 * es inviable. Como la paleta es fija, se paga una sola vez el costo de
 * evaluarlo sobre 32.768 celdas (~50 ms) y después cada píxel se resuelve con
 * tres shifts y una lectura de array.
 *
 * El error de cuantizar a 5 bits es de 8 unidades sRGB por celda, mucho más fino
 * que las regiones de Voronoi de una paleta de 20-30 lanas: solo cambia la
 * asignación de píxeles que ya estaban a mitad de camino entre dos lanas.
 */
export const buildPaletteLut = (palette: readonly Lab[]): Uint8Array => {
  if (palette.length === 0) {
    throw new Error('No se puede construir la tabla de color con una paleta vacía.');
  }
  if (palette.length > 256) {
    throw new Error('La tabla de color soporta hasta 256 lanas.');
  }

  const lut = new Uint8Array(LUT_SIZE);
  const maxLevel = LUT_LEVELS - 1;

  // Representante de cada celda: se expande el nivel de 5 bits al rango completo
  // 0-255, que ancla los extremos en negro y blanco puros. Se probó usar el
  // centro geométrico de la celda ((nivel << 3) + 3.5) y da una penalización
  // media levemente PEOR (0.0255 vs 0.0242 ΔE), porque desancla los extremos,
  // que es donde caen los colores puros más frecuentes.
  for (let r = 0; r < LUT_LEVELS; r += 1) {
    const r8 = (r * 255) / maxLevel;
    for (let g = 0; g < LUT_LEVELS; g += 1) {
      const g8 = (g * 255) / maxLevel;
      for (let b = 0; b < LUT_LEVELS; b += 1) {
        const b8 = (b * 255) / maxLevel;
        const index = (r << (LUT_BITS * 2)) | (g << LUT_BITS) | b;
        lut[index] = nearestPaletteIndex(srgbToLab([r8, g8, b8]), palette);
      }
    }
  }

  return lut;
};

/** Busca en la tabla el índice de lana para un color sRGB de 8 bits por canal. */
export const lookupPaletteIndex = (lut: Uint8Array, r: number, g: number, b: number): number =>
  lut[
    ((r >> LUT_SHIFT) << (LUT_BITS * 2)) | ((g >> LUT_SHIFT) << LUT_BITS) | (b >> LUT_SHIFT)
  ];
