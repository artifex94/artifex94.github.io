// Morfología de la silueta: transformada de distancia y dilatación del borde.
//
// POR QUÉ TRANSFORMADA DE DISTANCIA Y NO UN KERNEL DE DISCO:
// El borde de una alfombra de 80 cm a resolución de trabajo son unos 37 píxeles
// de radio. Dilatar con un kernel de disco cuesta O(n·r²): sobre un millón de
// píxeles son más de 4 mil millones de operaciones, y habría que rehacerlas
// enteras cada vez que el cliente mueve el ancho del borde.
//
// La transformada de distancia se calcula UNA vez, en O(n), y después cambiar el
// ancho del borde es solo comparar contra otro umbral. Además es euclídea
// exacta: una aproximación separable dejaría el borde con forma cuadrada y
// sobreestimaría el área un 27% (4r² contra πr²). Como el borde se cobra, esa
// diferencia es plata mal cobrada.
//
// Referencia: Felzenszwalb & Huttenlocher, "Distance Transforms of Sampled
// Functions" (2012).

/** Sustituto finito de infinito: evita NaN al restar dos infinitos en la parábola. */
const FAR = 1e20;

export interface PaddedMask {
  mask: Uint8Array;
  width: number;
  height: number;
  /** Padding agregado en cada lado, para poder mapear de vuelta al original. */
  pad: number;
}

/**
 * Agrega un margen vacío alrededor de la máscara.
 *
 * Es obligatorio antes de dilatar: si el diseño toca el borde de la imagen, sin
 * margen el borde de la alfombra queda recortado justo ahí. Es el error clásico
 * de morfología y por eso tiene su propio test de regresión.
 */
export const padMask = (
  mask: Uint8Array,
  width: number,
  height: number,
  pad: number,
): PaddedMask => {
  const paddedWidth = width + pad * 2;
  const paddedHeight = height + pad * 2;
  const padded = new Uint8Array(paddedWidth * paddedHeight);

  for (let y = 0; y < height; y += 1) {
    padded.set(mask.subarray(y * width, (y + 1) * width), (y + pad) * paddedWidth + pad);
  }

  return { mask: padded, width: paddedWidth, height: paddedHeight, pad };
};

/**
 * Transformada de distancia en una dimensión, sobre la envolvente inferior de
 * las parábolas centradas en cada muestra.
 *
 * `v` y `z` son buffers de trabajo que el llamador reutiliza entre filas para no
 * alocar en el bucle caliente.
 */
const distanceTransform1d = (
  f: Float64Array,
  n: number,
  d: Float64Array,
  v: Int32Array,
  z: Float64Array,
): void => {
  let k = 0;
  v[0] = 0;
  z[0] = -FAR;
  z[1] = FAR;

  for (let q = 1; q < n; q += 1) {
    // Intersección entre la parábola de q y la del último vértice del contorno.
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k -= 1;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k += 1;
    v[k] = q;
    z[k] = s;
    z[k + 1] = FAR;
  }

  k = 0;
  for (let q = 0; q < n; q += 1) {
    while (z[k + 1] < q) k += 1;
    const delta = q - v[k];
    d[q] = delta * delta + f[v[k]];
  }
};

/**
 * Distancia euclídea AL CUADRADO de cada píxel al píxel encendido más cercano.
 *
 * Se devuelve al cuadrado para no pagar una raíz por píxel: comparar contra r²
 * es equivalente a comparar la distancia contra r.
 */
export const euclideanDistanceTransform = (
  mask: Uint8Array,
  width: number,
  height: number,
): Float32Array => {
  const result = new Float32Array(width * height);
  const columnBuffer = new Float64Array(Math.max(width, height));
  const outputBuffer = new Float64Array(Math.max(width, height));
  const v = new Int32Array(Math.max(width, height));
  const z = new Float64Array(Math.max(width, height) + 1);

  // Primera pasada: por columnas.
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      columnBuffer[y] = mask[y * width + x] ? 0 : FAR;
    }
    distanceTransform1d(columnBuffer, height, outputBuffer, v, z);
    for (let y = 0; y < height; y += 1) {
      result[y * width + x] = outputBuffer[y];
    }
  }

  // Segunda pasada: por filas, sobre el resultado de la primera.
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * width;
    for (let x = 0; x < width; x += 1) {
      columnBuffer[x] = result[rowStart + x];
    }
    distanceTransform1d(columnBuffer, width, outputBuffer, v, z);
    for (let x = 0; x < width; x += 1) {
      result[rowStart + x] = outputBuffer[x];
    }
  }

  return result;
};

/**
 * Dilata la máscara: enciende todo píxel a distancia <= radius de la silueta.
 *
 * Como la transformada ya está calculada, esto es un umbral: cambiar el ancho
 * del borde no obliga a recalcular nada pesado.
 *
 * Los agujeros internos se resuelven solos con esta operación. La dilatación
 * agranda el contorno externo y encoge los agujeros al mismo tiempo, así que un
 * agujero de diámetro menor a 2·radius desaparece — que es justo lo correcto:
 * si el borde no entra, ese hueco no se puede fabricar.
 */
export const dilateFromDistance = (
  distanceSquared: Float32Array,
  radius: number,
): Uint8Array => {
  const radiusSquared = radius * radius;
  const dilated = new Uint8Array(distanceSquared.length);
  for (let i = 0; i < distanceSquared.length; i += 1) {
    dilated[i] = distanceSquared[i] <= radiusSquared ? 1 : 0;
  }
  return dilated;
};

/**
 * Área de la silueta dilatada, en píxeles, con cobertura subpíxel.
 *
 * Los píxeles que ya son parte de la silueta cuentan enteros. Para los de
 * afuera se acumula qué fracción queda dentro del radio, lo que saca el sesgo de
 * escalera de medio píxel que tendría un conteo binario.
 *
 * La máscara hace falta además de la distancia porque la transformada vale 0 en
 * TODO el interior de la silueta: no distingue un píxel del centro de uno del
 * borde. Sin ese dato, una pieza con borde chico mediría la mitad de lo real.
 */
export const dilatedAreaPx = (
  distanceSquared: Float32Array,
  mask: Uint8Array,
  radius: number,
): number => {
  let area = 0;
  for (let i = 0; i < distanceSquared.length; i += 1) {
    if (mask[i]) {
      area += 1;
      continue;
    }
    const coverage = radius + 0.5 - Math.sqrt(distanceSquared[i]);
    if (coverage >= 1) area += 1;
    else if (coverage > 0) area += coverage;
  }
  return area;
};

/** Cuenta los píxeles encendidos de una máscara. */
export const countMask = (mask: Uint8Array): number => {
  let total = 0;
  for (let i = 0; i < mask.length; i += 1) total += mask[i];
  return total;
};
