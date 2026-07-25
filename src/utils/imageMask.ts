import { feretDiameter, type PointList } from './geometry';
import {
  countMask,
  dilateFromDistance,
  dilatedAreaPx,
  euclideanDistanceTransform,
  padMask,
} from './morphology';

// De los píxeles de la imagen a los metros cuadrados que se cobran.
//
// Todas las funciones son puras sobre typed arrays: no tocan canvas ni DOM, así
// que corren igual en el hilo principal, dentro de un worker o en un test.

/**
 * Umbral de opacidad para decidir si un píxel es parte de la pieza.
 *
 * 128 es el punto de cobertura del 50%: los píxeles semitransparentes del
 * antialiasing quedan repartidos simétricamente adentro y afuera del contorno,
 * así que el error de área se cancela entre los tramos convexos y los cóncavos
 * en vez de acumularse.
 */
export const ALPHA_THRESHOLD = 128;

/** Manchas más chicas que esta fracción del total se descartan como ruido. */
export const MIN_COMPONENT_FRACTION = 0.005;

/** Fracción mínima de píxeles transparentes para considerar que hay recorte real. */
export const MIN_TRANSPARENT_FRACTION = 0.02;

/** Extrae la máscara binaria de la pieza a partir del canal alfa. */
export const maskFromAlpha = (
  alpha: Uint8Array | Uint8ClampedArray,
  threshold = ALPHA_THRESHOLD,
): Uint8Array => {
  const mask = new Uint8Array(alpha.length);
  for (let i = 0; i < alpha.length; i += 1) mask[i] = alpha[i] >= threshold ? 1 : 0;
  return mask;
};

/** Saca el canal alfa de un buffer RGBA. */
export const alphaChannel = (rgba: Uint8ClampedArray | Uint8Array): Uint8Array => {
  const alpha = new Uint8Array(rgba.length >>> 2);
  for (let i = 0; i < alpha.length; i += 1) alpha[i] = rgba[i * 4 + 3];
  return alpha;
};

/**
 * Qué proporción de la imagen es transparente.
 *
 * Un PNG puede declarar canal alfa y tenerlo todo opaco. Sin esta verificación
 * se habilitaría el contorneado sobre una imagen que en realidad es un
 * rectángulo lleno, y la silueta saldría siendo la imagen entera.
 */
export const transparentFraction = (alpha: Uint8Array | Uint8ClampedArray): number => {
  if (alpha.length === 0) return 0;
  let transparent = 0;
  for (let i = 0; i < alpha.length; i += 1) {
    if (alpha[i] < 250) transparent += 1;
  }
  return transparent / alpha.length;
};

/**
 * Se queda con la mancha conexa más grande y descarta las motas.
 *
 * Usa flood fill con pila explícita, nunca recursión: sobre un millón de píxeles
 * la recursión desborda la pila de JavaScript.
 */
export const largestComponent = (
  mask: Uint8Array,
  width: number,
  height: number,
  minFraction = MIN_COMPONENT_FRACTION,
): Uint8Array => {
  const total = width * height;
  const labels = new Int32Array(total).fill(-1);
  const stack = new Int32Array(total);
  const sizes: number[] = [];

  for (let start = 0; start < total; start += 1) {
    if (!mask[start] || labels[start] !== -1) continue;

    const label = sizes.length;
    let stackSize = 0;
    let componentSize = 0;
    stack[stackSize] = start;
    stackSize += 1;
    labels[start] = label;

    while (stackSize > 0) {
      stackSize -= 1;
      const index = stack[stackSize];
      componentSize += 1;

      const x = index % width;
      const y = (index - x) / width;

      // Vecindad de 8: dos trazos que se tocan en diagonal son una sola pieza.
      for (let dy = -1; dy <= 1; dy += 1) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          const neighbour = ny * width + nx;
          if (!mask[neighbour] || labels[neighbour] !== -1) continue;
          labels[neighbour] = label;
          stack[stackSize] = neighbour;
          stackSize += 1;
        }
      }
    }

    sizes.push(componentSize);
  }

  if (sizes.length === 0) return new Uint8Array(total);

  let biggest = 0;
  for (let i = 1; i < sizes.length; i += 1) {
    if (sizes[i] > sizes[biggest]) biggest = i;
  }

  const threshold = sizes[biggest] * minFraction;
  const kept = new Uint8Array(total);
  for (let i = 0; i < total; i += 1) {
    const label = labels[i];
    // Se conservan la mancha mayor y cualquier otra que no sea una mota.
    if (label !== -1 && sizes[label] >= threshold) kept[i] = 1;
  }

  return kept;
};

/** Puntos del contorno: píxeles encendidos con al menos un vecino apagado. */
export const boundaryPoints = (mask: Uint8Array, width: number, height: number): PointList => {
  const points: number[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!mask[y * width + x]) continue;

      const onEdge =
        x === 0 ||
        y === 0 ||
        x === width - 1 ||
        y === height - 1 ||
        !mask[y * width + x - 1] ||
        !mask[y * width + x + 1] ||
        !mask[(y - 1) * width + x] ||
        !mask[(y + 1) * width + x];

      if (onEdge) points.push(x, y);
    }
  }

  return Int32Array.from(points);
};

export interface MeasureInput {
  /** Canal alfa de la imagen ya reducida a la resolución de trabajo. */
  alpha: Uint8Array | Uint8ClampedArray;
  width: number;
  height: number;
  /** Cuánto mide en la realidad la distancia entre los dos puntos más separados. */
  feretCm: number;
  /** Ancho del borde perimetral, en cm. */
  borderCm: number;
}

export interface MeasureResult {
  /** Área de la pieza terminada, con el borde ya sumado. */
  areaM2: number;
  /** Área de la silueta sola, sin borde. Sirve para mostrar cuánto suma el borde. */
  areaWithoutBorderM2: number;
  /** Diámetro de Feret medido sobre la imagen, en píxeles. */
  feretPx: number;
  /** Escala resultante. */
  cmPerPx: number;
  /** Cuánto va a medir la pieza terminada en su punto más largo. */
  finalFeretCm: number;
  warnings: readonly string[];
  /**
   * Máscaras con el margen ya aplicado, para dibujar la previsualización.
   *
   * Se devuelven porque ya están calculadas: rehacerlas afuera sería repetir la
   * transformada de distancia, que es la parte cara del pipeline.
   */
  masks: {
    /** Silueta original, con margen. */
    silhouette: Uint8Array;
    /** Pieza terminada: silueta más borde. */
    dilated: Uint8Array;
    width: number;
    height: number;
  };
}

/**
 * Mide la pieza: de píxeles a metros cuadrados cobrables.
 *
 * El Feret se mide sobre la silueta SIN dilatar, porque el cliente declara el
 * largo de lo que ve en su diseño. Medirlo después de agregar el borde haría que
 * esos centímetros incluyeran el borde y la pieza saliera más chica de lo pedido:
 * es un error silencioso y caro.
 */
export const measurePiece = ({
  alpha,
  width,
  height,
  feretCm,
  borderCm,
}: MeasureInput): MeasureResult | null => {
  const raw = maskFromAlpha(alpha);
  const mask = largestComponent(raw, width, height);
  const contour = boundaryPoints(mask, width, height);
  const feret = feretDiameter(contour);

  if (!feret || feret.distance <= 0) return null;

  const warnings: string[] = [];
  const cmPerPx = feretCm / feret.distance;
  const borderPx = borderCm / cmPerPx;

  // El margen tiene que ser mayor al borde, o un diseño que toca el filo de la
  // imagen perdería su borde justo ahí.
  const pad = Math.ceil(borderPx) + 2;
  const padded = padMask(mask, width, height, pad);
  const distanceSquared = euclideanDistanceTransform(padded.mask, padded.width, padded.height);

  const areaPx = dilatedAreaPx(distanceSquared, padded.mask, borderPx);
  const areaWithoutBorderPx = countMask(mask);

  const cm2PerPx = cmPerPx * cmPerPx;
  const areaM2 = (areaPx * cm2PerPx) / 10_000;
  const areaWithoutBorderM2 = (areaWithoutBorderPx * cm2PerPx) / 10_000;

  if (transparentFraction(alpha) < MIN_TRANSPARENT_FRACTION) {
    warnings.push(
      'La imagen casi no tiene transparencia: revisá que el fondo esté realmente borrado.',
    );
  }

  const touchesEdge = (() => {
    for (let x = 0; x < width; x += 1) {
      if (mask[x] || mask[(height - 1) * width + x]) return true;
    }
    for (let y = 0; y < height; y += 1) {
      if (mask[y * width] || mask[y * width + width - 1]) return true;
    }
    return false;
  })();

  if (touchesEdge) {
    warnings.push(
      'Tu diseño llega hasta el filo de la imagen: puede estar cortado. Dejale un margen alrededor.',
    );
  }

  return {
    areaM2,
    areaWithoutBorderM2,
    feretPx: feret.distance,
    cmPerPx,
    // El borde se agrega de los dos lados del eje más largo.
    finalFeretCm: feretCm + 2 * borderCm,
    warnings,
    masks: {
      silhouette: padded.mask,
      dilated: dilateFromDistance(distanceSquared, borderPx),
      width: padded.width,
      height: padded.height,
    },
  };
};
