import { maskFromAlpha, measurePiece, type MeasureResult } from './imageMask';
import { extractDominantColors } from './paletteExtract';
import { modeFilter, quantizeToPalette, reduceColors, renderPreview } from './quantize';
import { buildPaletteLut, labToSrgb, type Lab, type Rgb } from './color';
import { nameForTone, woolToneLab } from '../data/wools';
import type { DecodedImage } from './imageDecode';

// Orquesta el pipeline completo: medir la pieza y dibujar cómo quedaría en lana.
//
// Es una función pura sobre typed arrays, sin canvas ni DOM. Eso es lo que
// permite correrla dentro de un worker o en el hilo principal con el mismo
// código, y testearla sin navegador.
//
// La paleta NO es fija: se extrae del propio diseño (extractDominantColors) y
// cada color dominante se lleva al tono que la lana puede dar (woolToneLab). Así
// el preview muestra "tu diseño en lana" — sus colores, apagados y en regiones
// planas — en vez de forzarlo contra un inventario de conos.

export interface PipelineInput {
  decoded: DecodedImage;
  /** Cuánto mide en la realidad el punto más largo del diseño. */
  feretCm: number;
  borderCm: number;
  /** Color del borde perimetral, en RGB. */
  borderRgb: Rgb;
  maxColors: number;
}

/** Un color que efectivamente quedó en la pieza, ya llevado a tono de lana. */
export interface DetectedColor {
  rgb: Rgb;
  lab: Lab;
  /** Nombre humano aproximado (tono de referencia más cercano). */
  name: string;
}

export interface PipelineResult {
  measure: MeasureResult;
  /** Previsualización lista para volcar a un canvas. */
  preview: {
    rgba: Uint8ClampedArray;
    width: number;
    height: number;
  };
  /**
   * Extremos del diámetro de Feret EN COORDENADAS DEL PREVIEW (con margen).
   *
   * La medición los produce en el espacio sin margen; acá ya vienen corridos
   * por el pad para que dibujar la línea sobre el preview sea directo.
   */
  feretLine: { ax: number; ay: number; bx: number; by: number };
  /** Índices (dentro de la paleta derivada) que quedaron en la pieza. */
  usedPaletteIndices: readonly number[];
  /** Los colores que quedaron, ordenados por superficie, con nombre. */
  detectedColors: readonly DetectedColor[];
}

/**
 * Copia los índices de color al lienzo con margen que usan las máscaras.
 *
 * La medición trabaja sobre una máscara con margen (para que el borde no se
 * recorte), pero los colores vienen de la imagen original sin margen: hay que
 * alinearlos antes de dibujar.
 */
const padIndices = (
  indices: Uint8Array,
  width: number,
  height: number,
  paddedWidth: number,
  paddedHeight: number,
): Uint8Array => {
  const pad = Math.round((paddedWidth - width) / 2);
  const padY = Math.round((paddedHeight - height) / 2);
  const padded = new Uint8Array(paddedWidth * paddedHeight);

  for (let y = 0; y < height; y += 1) {
    padded.set(indices.subarray(y * width, (y + 1) * width), (y + padY) * paddedWidth + pad);
  }

  return padded;
};

export const runTuftingPipeline = ({
  decoded,
  feretCm,
  borderCm,
  borderRgb,
  maxColors,
}: PipelineInput): PipelineResult | null => {
  const measure = measurePiece({
    alpha: decoded.alpha,
    width: decoded.width,
    height: decoded.height,
    feretCm,
    borderCm,
  });

  if (!measure) return null;

  const { masks } = measure;

  // 1. Extraer los colores dominantes del propio diseño (sin margen) y llevarlos
  //    al tono que la lana realmente puede dar. Esta es la paleta de la pieza.
  const designMask = maskFromAlpha(decoded.alpha);
  const dominant = extractDominantColors(decoded.rgba, designMask, maxColors);
  if (dominant.length === 0) return null;

  const paletteLab: Lab[] = dominant.map((color) => woolToneLab(color.lab));
  const paletteRgb: Rgb[] = paletteLab.map(labToSrgb);

  // 2. Asignar cada píxel a su color de lana. La tabla se arma por imagen porque
  //    la paleta cambia con cada diseño; con ≤ maxColors colores es barata.
  const lut = buildPaletteLut(paletteLab);
  const rawIndices = quantizeToPalette(decoded.rgba, lut);
  const aligned = padIndices(rawIndices, decoded.width, decoded.height, masks.width, masks.height);

  // El filtro de moda va ANTES de reducir: si se hiciera al revés, el ruido
  // moteado inflaría el histograma de colores minoritarios y se conservarían
  // colores que en realidad no son regiones del diseño.
  const smoothed = modeFilter(aligned, masks.width, masks.height, masks.silhouette, paletteLab.length);
  const { indices, usedPaletteIndices } = reduceColors(
    smoothed,
    masks.silhouette,
    paletteLab,
    maxColors,
  );

  const rgba = renderPreview({
    indices,
    dilated: masks.dilated,
    silhouette: masks.silhouette,
    paletteRgb,
    borderRgb,
    width: masks.width,
    height: masks.height,
  });

  const detectedColors: DetectedColor[] = usedPaletteIndices.map((index) => ({
    rgb: paletteRgb[index],
    lab: paletteLab[index],
    name: nameForTone(paletteLab[index]),
  }));

  return {
    measure,
    preview: { rgba, width: masks.width, height: masks.height },
    feretLine: {
      ax: measure.feretLine.ax + masks.pad,
      ay: measure.feretLine.ay + masks.pad,
      bx: measure.feretLine.bx + masks.pad,
      by: measure.feretLine.by + masks.pad,
    },
    usedPaletteIndices,
    detectedColors,
  };
};
