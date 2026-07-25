import { deltaE2000, lookupPaletteIndex, type Lab } from './color';

// Transducción de la imagen a los colores de lana disponibles.
//
// POR QUÉ NO HAY DITHERING:
// El dithering cambia resolución espacial por resolución de color: alterna dos
// tintas para simular una tercera que no existe. Acá la "tinta" es una lana
// física cargada en la pistola, así que una zona ditherizada no es una mezcla:
// es la instrucción de cambiar de cono cada tres milímetros. No es fabricable.
//
// Lo que hace falta entregar es un mapa de REGIONES PLANAS, que además es lo que
// el artesano necesita para calcar el diseño sobre la tela. Por eso, después de
// asignar cada píxel a su lana, se pasa un filtro de moda: es el anti-dither.

/** Asigna cada píxel de un buffer RGBA a un índice de la paleta. */
export const quantizeToPalette = (
  rgba: Uint8ClampedArray | Uint8Array,
  lut: Uint8Array,
): Uint8Array => {
  const count = rgba.length >>> 2;
  const indices = new Uint8Array(count);
  for (let i = 0; i < count; i += 1) {
    indices[i] = lookupPaletteIndex(lut, rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]);
  }
  return indices;
};

/**
 * Voto mayoritario en una vecindad de 3x3.
 *
 * Cualquier foto trae ruido de sensor y de compresión, y ese ruido hace que
 * píxeles vecinos caigan en lanas distintas produciendo un moteado imposible de
 * tejer. Este filtro lo colapsa a manchas parejas.
 *
 * Solo se consideran los píxeles marcados en `mask`: el fondo no vota.
 */
export const modeFilter = (
  indices: Uint8Array,
  width: number,
  height: number,
  mask: Uint8Array,
  paletteSize: number,
): Uint8Array => {
  const output = new Uint8Array(indices.length);
  const votes = new Uint16Array(paletteSize);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (!mask[index]) continue;

      votes.fill(0);
      let winner = indices[index];
      let best = 0;

      for (let dy = -1; dy <= 1; dy += 1) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          const neighbour = ny * width + nx;
          if (!mask[neighbour]) continue;

          const candidate = indices[neighbour];
          votes[candidate] += 1;
          if (votes[candidate] > best) {
            best = votes[candidate];
            winner = candidate;
          }
        }
      }

      output[index] = winner;
    }
  }

  return output;
};

export interface ColorReduction {
  indices: Uint8Array;
  /** Índices de paleta que quedaron, ordenados por superficie ocupada. */
  usedPaletteIndices: readonly number[];
}

/**
 * Deja como mucho `maxColors` lanas distintas.
 *
 * El límite no es técnico sino de taller: cada color extra es recargar la
 * pistola y un cono más que comprar y que después sobra.
 *
 * Quedarse con los K más grandes a secas se come regiones chicas pero
 * cromáticamente únicas: los ojos de un personaje desaparecen porque ocupan
 * poca superficie. Por eso primero se protege toda lana que cubra al menos
 * `protectedFraction` de la pieza, y recién después se llenan los cupos por área.
 */
export const reduceColors = (
  indices: Uint8Array,
  mask: Uint8Array,
  palette: readonly Lab[],
  maxColors: number,
  protectedFraction = 0.02,
): ColorReduction => {
  const histogram = new Uint32Array(palette.length);
  let total = 0;

  for (let i = 0; i < indices.length; i += 1) {
    if (!mask[i]) continue;
    histogram[indices[i]] += 1;
    total += 1;
  }

  if (total === 0) return { indices, usedPaletteIndices: [] };

  const present = Array.from(histogram.entries())
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  if (present.length <= maxColors) {
    return { indices, usedPaletteIndices: present.map(([index]) => index) };
  }

  const threshold = total * protectedFraction;
  const survivors: number[] = [];

  for (const [index, count] of present) {
    if (survivors.length >= maxColors) break;
    if (count >= threshold) survivors.push(index);
  }
  for (const [index] of present) {
    if (survivors.length >= maxColors) break;
    if (!survivors.includes(index)) survivors.push(index);
  }

  // Cada lana descartada se manda a la superviviente perceptualmente más
  // parecida, no a la más parecida en RGB.
  const remap = new Uint8Array(palette.length);
  for (let i = 0; i < palette.length; i += 1) {
    if (survivors.includes(i)) {
      remap[i] = i;
      continue;
    }
    let bestIndex = survivors[0];
    let bestDistance = Infinity;
    for (const candidate of survivors) {
      const distance = deltaE2000(palette[i], palette[candidate]);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = candidate;
      }
    }
    remap[i] = bestIndex;
  }

  const reduced = new Uint8Array(indices.length);
  for (let i = 0; i < indices.length; i += 1) {
    reduced[i] = mask[i] ? remap[indices[i]] : indices[i];
  }

  return { indices: reduced, usedPaletteIndices: survivors };
};

export interface PreviewInput {
  indices: Uint8Array;
  /** Máscara de la pieza terminada, borde incluido. */
  dilated: Uint8Array;
  /** Máscara de la silueta original, sin borde. */
  silhouette: Uint8Array;
  /** Colores de la paleta en RGB, indexados igual que `indices`. */
  paletteRgb: readonly (readonly [number, number, number])[];
  /** Color del borde perimetral. */
  borderRgb: readonly [number, number, number];
  width: number;
  height: number;
}

/**
 * Dibuja la previsualización, píxel por píxel y sin ninguna IA de por medio.
 *
 * La banda del borde sale gratis de la morfología: es todo lo que entró en la
 * máscara dilatada pero no estaba en la silueta original.
 */
export const renderPreview = ({
  indices,
  dilated,
  silhouette,
  paletteRgb,
  borderRgb,
  width,
  height,
}: PreviewInput): Uint8ClampedArray => {
  const rgba = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;

    if (!dilated[i]) {
      rgba[offset + 3] = 0; // fuera de la pieza: transparente
      continue;
    }

    const color = silhouette[i] ? paletteRgb[indices[i]] : borderRgb;
    rgba[offset] = color[0];
    rgba[offset + 1] = color[1];
    rgba[offset + 2] = color[2];
    rgba[offset + 3] = 255;
  }

  return rgba;
};
