import { measurePiece, type MeasureResult } from './imageMask';
import { modeFilter, quantizeToPalette, reduceColors, renderPreview } from './quantize';
import type { DecodedImage } from './imageDecode';
import type { Lab, Rgb } from './color';

// Orquesta el pipeline completo: medir la pieza y dibujar cómo quedaría en lana.
//
// Es una función pura sobre typed arrays, sin canvas ni DOM. Eso es lo que
// permite correrla dentro de un worker o en el hilo principal con el mismo
// código, y testearla sin navegador.

export interface PipelineInput {
  decoded: DecodedImage;
  /** Cuánto mide en la realidad el punto más largo del diseño. */
  feretCm: number;
  borderCm: number;
  /** Paleta de lanas en CIELAB, para el remapeo perceptual. */
  paletteLab: readonly Lab[];
  /** Los mismos colores en RGB, para dibujar. */
  paletteRgb: readonly Rgb[];
  /** Tabla precomputada de color a índice de lana. */
  lut: Uint8Array;
  borderRgb: Rgb;
  maxColors: number;
}

export interface PipelineResult {
  measure: MeasureResult;
  /** Previsualización lista para volcar a un canvas. */
  preview: {
    rgba: Uint8ClampedArray;
    width: number;
    height: number;
  };
  /** Índices de la paleta que efectivamente quedaron en la pieza. */
  usedPaletteIndices: readonly number[];
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
  paletteLab,
  paletteRgb,
  lut,
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

  const rawIndices = quantizeToPalette(decoded.rgba, lut);
  const aligned = padIndices(rawIndices, decoded.width, decoded.height, masks.width, masks.height);

  // El filtro de moda va ANTES de reducir: si se hiciera al revés, el ruido
  // moteado inflaría el histograma de colores minoritarios y se conservarían
  // lanas que en realidad no son regiones del diseño.
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

  return {
    measure,
    preview: { rgba, width: masks.width, height: masks.height },
    usedPaletteIndices,
  };
};
