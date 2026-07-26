import { alphaChannel } from './imageMask';

// Decodificación de la imagen subida a los píxeles con los que trabaja el
// pipeline. Es la única parte que toca canvas: todo lo demás son funciones puras
// sobre typed arrays.
//
// El mismo código corre en el hilo principal y dentro de un worker, eligiendo
// OffscreenCanvas cuando está disponible. Eso permite tener el worker por
// performance sin duplicar la lógica ni quedarse sin camino en navegadores viejos.

/**
 * Lado máximo al que se reduce la imagen antes de medir.
 *
 * Reducir NO pierde precisión: toda la medición es un ratio
 * (área / feret²) x (cm declarados)², así que la resolución se cancela. A 1024 px
 * un error de un píxel sobre el diámetro es ~0.1% en largo y ~0.2% en área,
 * irrelevante para un presupuesto. A cambio, el pipeline trabaja siempre sobre
 * como mucho un millón de píxeles y no revienta la memoria en un celular: una
 * foto de 12 Mpx en RGBA son 48 MB.
 */
export const WORK_MAX_DIM = 1024;

export interface DecodedImage {
  /** Canal alfa a resolución de trabajo. */
  alpha: Uint8Array;
  /** Píxeles RGBA a resolución de trabajo, para la previsualización. */
  rgba: Uint8ClampedArray;
  width: number;
  height: number;
}

interface Canvas2D {
  width: number;
  height: number;
  getContext(id: '2d'): {
    drawImage(image: CanvasImageSource, dx: number, dy: number): void;
    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
  } | null;
}

const createCanvas = (width: number, height: number): Canvas2D => {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height) as unknown as Canvas2D;
  }
  if (typeof document === 'undefined') {
    throw new Error('Sin OffscreenCanvas en el worker');
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas as unknown as Canvas2D;
};

/** Escala que hay que aplicar para que el lado mayor no pase de `maxDim`. */
export const workScale = (width: number, height: number, maxDim = WORK_MAX_DIM): number => {
  const longest = Math.max(width, height);
  return longest > maxDim ? maxDim / longest : 1;
};

/**
 * Decodifica la imagen y la reduce a la resolución de trabajo.
 *
 * El reescalado va DENTRO de createImageBitmap y no dibujando el original en un
 * canvas: así el bitmap grande nunca llega a materializarse en memoria.
 */
export const decodeToWorkingSize = async (
  source: Blob,
  maxDim = WORK_MAX_DIM,
): Promise<DecodedImage> => {
  const probe = await createImageBitmap(source);
  const scale = workScale(probe.width, probe.height, maxDim);

  let bitmap = probe;
  if (scale < 1) {
    const width = Math.max(1, Math.round(probe.width * scale));
    const height = Math.max(1, Math.round(probe.height * scale));
    bitmap = await createImageBitmap(source, {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: 'high',
    });
    probe.close();
  }

  const canvas = createCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('No pude preparar el lienzo para leer la imagen.');
  }

  context.drawImage(bitmap as unknown as CanvasImageSource, 0, 0);
  const imageData = context.getImageData(0, 0, bitmap.width, bitmap.height);
  const { width, height } = bitmap;
  bitmap.close();

  return { alpha: alphaChannel(imageData.data), rgba: imageData.data, width, height };
};
