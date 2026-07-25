import { srgbToLab, labToSrgb, type Lab, type Rgb } from './color';

// Extracción de la paleta del PROPIO diseño.
//
// El preview no parte de una paleta fija de "lanas en stock": toma los colores
// que realmente tiene el diseño y después cada uno se lleva a un tono de lana
// plausible (ver `toWoolTone` en ../data/wools). Acá vive solo el primer paso:
// reducir los miles de colores del diseño a un puñado de colores dominantes.
//
// POR QUÉ MEDIAN-CUT Y NO K-MEANS PURO:
// Median-cut es determinista (no usa RNG) y por lo tanto testeable y estable
// entre corridas — la misma imagen produce siempre la misma paleta. Corre dentro
// del worker igual que el resto del pipeline. Un par de iteraciones de Lloyd
// (k-means) sobre el resultado del corte afinan los centroides sin sacrificar el
// determinismo, porque parten de una semilla fija.

/** Un color dominante del diseño, en sRGB y CIELAB. */
export interface DominantColor {
  rgb: Rgb;
  lab: Lab;
}

/**
 * Cuántos píxeles como mucho se muestrean para extraer la paleta.
 *
 * Sobre la silueta entera serían millones; con 20k alcanza de sobra para que la
 * distribución de colores quede representada, y mantiene el corte y las
 * iteraciones de Lloyd baratos.
 */
export const MAX_SAMPLES = 20_000;

/** Iteraciones de refinamiento tipo k-means sobre el resultado del corte. */
const LLOYD_ITERATIONS = 3;

/** Distancia euclidiana al cuadrado en CIELAB. Alcanza para agrupar (no se
 *  muestra al usuario); CIEDE2000 sería carísimo por punto e innecesario acá. */
const labDistanceSquared = (
  labs: Float64Array,
  i: number,
  cl: number,
  ca: number,
  cb: number,
): number => {
  const dl = labs[i * 3] - cl;
  const da = labs[i * 3 + 1] - ca;
  const db = labs[i * 3 + 2] - cb;
  return dl * dl + da * da + db * db;
};

/** Muestrea los píxeles de la silueta y los pasa a CIELAB, en un buffer plano. */
const sampleLab = (
  rgba: Uint8ClampedArray | Uint8Array,
  mask: Uint8Array,
): Float64Array => {
  let masked = 0;
  for (let i = 0; i < mask.length; i += 1) if (mask[i]) masked += 1;
  if (masked === 0) return new Float64Array(0);

  const stride = masked > MAX_SAMPLES ? Math.ceil(masked / MAX_SAMPLES) : 1;
  const out: number[] = [];
  let seen = 0;

  for (let i = 0; i < mask.length; i += 1) {
    if (!mask[i]) continue;
    if (seen % stride === 0) {
      const [l, a, b] = srgbToLab([rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]]);
      out.push(l, a, b);
    }
    seen += 1;
  }

  return Float64Array.from(out);
};

/** Media CIELAB de un conjunto de puntos (índices dentro de `labs`). */
const meanLab = (labs: Float64Array, indices: readonly number[]): [number, number, number] => {
  let l = 0;
  let a = 0;
  let b = 0;
  for (const i of indices) {
    l += labs[i * 3];
    a += labs[i * 3 + 1];
    b += labs[i * 3 + 2];
  }
  const n = indices.length || 1;
  return [l / n, a / n, b / n];
};

/**
 * Median-cut en CIELAB: parte la caja de mayor rango por su eje más ancho, en la
 * mediana, hasta llegar a `k` cajas o no poder cortar más.
 */
const medianCut = (labs: Float64Array, k: number): number[][] => {
  const n = labs.length / 3;
  const all: number[] = [];
  for (let i = 0; i < n; i += 1) all.push(i);
  let boxes: number[][] = [all];

  while (boxes.length < k) {
    // Elegir la caja con mayor rango en algún eje; recordar cuál eje.
    let target = -1;
    let targetAxis = 0;
    let targetRange = -1;

    for (let bi = 0; bi < boxes.length; bi += 1) {
      const box = boxes[bi];
      if (box.length < 2) continue;
      for (let axis = 0; axis < 3; axis += 1) {
        let min = Infinity;
        let max = -Infinity;
        for (const i of box) {
          const v = labs[i * 3 + axis];
          if (v < min) min = v;
          if (v > max) max = v;
        }
        const range = max - min;
        if (range > targetRange) {
          targetRange = range;
          target = bi;
          targetAxis = axis;
        }
      }
    }

    // No queda ninguna caja divisible (todos los puntos coinciden o son de a uno).
    if (target === -1 || targetRange <= 0) break;

    const box = boxes[target];
    box.sort((i, j) => labs[i * 3 + targetAxis] - labs[j * 3 + targetAxis]);
    const mid = box.length >> 1;
    const left = box.slice(0, mid);
    const right = box.slice(mid);
    boxes = boxes.filter((_, bi) => bi !== target).concat([left, right]);
  }

  return boxes;
};

/**
 * Extrae hasta `k` colores dominantes del diseño.
 *
 * `mask` marca los píxeles de la silueta (1 = dentro), en el mismo sistema de
 * coordenadas que `rgba` (sin margen). Devuelve los centroides ordenados por
 * superficie que ocupan, de mayor a menor.
 */
export const extractDominantColors = (
  rgba: Uint8ClampedArray | Uint8Array,
  mask: Uint8Array,
  k: number,
): DominantColor[] => {
  const labs = sampleLab(rgba, mask);
  const n = labs.length / 3;
  if (n === 0 || k < 1) return [];

  // Semilla determinista: median-cut.
  let clusters = medianCut(labs, k).filter((box) => box.length > 0);
  let centroids = clusters.map((box) => meanLab(labs, box));

  // Refinamiento de Lloyd: reasignar cada punto a su centroide más cercano y
  // recomputar. Parte de la semilla del corte, así que sigue siendo determinista.
  for (let iter = 0; iter < LLOYD_ITERATIONS; iter += 1) {
    const buckets: number[][] = centroids.map(() => []);
    for (let i = 0; i < n; i += 1) {
      let best = 0;
      let bestDist = Infinity;
      for (let c = 0; c < centroids.length; c += 1) {
        const [cl, ca, cb] = centroids[c];
        const dist = labDistanceSquared(labs, i, cl, ca, cb);
        if (dist < bestDist) {
          bestDist = dist;
          best = c;
        }
      }
      buckets[best].push(i);
    }
    clusters = buckets.filter((bucket) => bucket.length > 0);
    centroids = clusters.map((box) => meanLab(labs, box));
  }

  // Ordenar por superficie (tamaño del cluster) de mayor a menor.
  const bySize = centroids
    .map((lab, c) => ({ lab, size: clusters[c].length }))
    .sort((a, b) => b.size - a.size);

  return bySize.map(({ lab }) => ({ lab, rgb: labToSrgb(lab) }));
};
