// Compositor del diseño de las piezas circular/rectangular.
//
// Dibuja, sobre un canvas 2D, la pieza terminada: un relleno de color con la
// imagen del cliente ADENTRO (recortada a la forma, en contain y rotable) y un
// anillo de borde en su propio color. La misma función se usa para el preview en
// vivo del bastidor y para exportar el PNG que viaja con el encargo.
//
// No depende de React: recibe un contexto y parámetros. El único requisito es un
// canvas 2D real (hilo principal), no jsdom — por eso se verifica con Playwright.

export type ComposeShape = 'circular' | 'rectangular';

export interface ComposeParams {
  shape: ComposeShape;
  /** Caja contenedora de la pieza terminada, en cm: fija la proporción. */
  pieceWidthCm: number;
  pieceHeightCm: number;
  /** Color del relleno (fondo detrás del diseño). */
  fillColor: string;
  /** Color del borde perimetral. */
  borderColor: string;
  /** Borde grueso (true) o normal (false). */
  borderThick: boolean;
  /** Rotación de la imagen dentro de la forma, en grados. */
  rotationDeg: number;
  /** Imagen del cliente ya cargada, o null si todavía no hay. */
  image: CanvasImageSource | null;
  /** Dimensiones naturales de la imagen, para calcular el contain. */
  imageWidth?: number;
  imageHeight?: number;
}

/** El borde, como fracción del lado más corto de la pieza dibujada. */
const BORDER_FRACTION = { normal: 0.05, thick: 0.1 } as const;
/** Aire alrededor de la pieza dentro del canvas. */
const PADDING_FRACTION = 0.06;

const DEG_TO_RAD = Math.PI / 180;

/** Traza el contorno de la forma (rectángulo o elipse) en la caja dada. */
const tracePath = (
  ctx: CanvasRenderingContext2D,
  shape: ComposeShape,
  x: number,
  y: number,
  w: number,
  h: number,
): void => {
  ctx.beginPath();
  if (shape === 'circular') {
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.closePath();
};

/**
 * Dibuja el diseño compuesto en el contexto, ocupando `canvasW × canvasH`.
 *
 * Orden: anillo de borde (forma externa) → relleno (forma interna) → imagen
 * recortada a la forma interna, en contain sobre su caja rotada (así una imagen
 * girada entra completa) y centrada.
 */
export const composeShapeDesign = (
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  params: ComposeParams,
): void => {
  const { shape, pieceWidthCm, pieceHeightCm } = params;
  ctx.clearRect(0, 0, canvasW, canvasH);

  // Caja de dibujo: la proporción de la pieza dentro del canvas, con aire.
  const availW = canvasW * (1 - 2 * PADDING_FRACTION);
  const availH = canvasH * (1 - 2 * PADDING_FRACTION);
  const pieceRatio = pieceWidthCm / pieceHeightCm;
  let boxW = availW;
  let boxH = boxW / pieceRatio;
  if (boxH > availH) {
    boxH = availH;
    boxW = boxH * pieceRatio;
  }
  const boxX = (canvasW - boxW) / 2;
  const boxY = (canvasH - boxH) / 2;

  const borderPx = Math.min(boxW, boxH) * BORDER_FRACTION[params.borderThick ? 'thick' : 'normal'];

  // Anillo de borde: la forma externa pintada del color del borde.
  tracePath(ctx, shape, boxX, boxY, boxW, boxH);
  ctx.fillStyle = params.borderColor;
  ctx.fill();

  // Forma interna (pieza sin el borde): el relleno.
  const inX = boxX + borderPx;
  const inY = boxY + borderPx;
  const inW = Math.max(1, boxW - 2 * borderPx);
  const inH = Math.max(1, boxH - 2 * borderPx);

  tracePath(ctx, shape, inX, inY, inW, inH);
  ctx.fillStyle = params.fillColor;
  ctx.fill();

  // La imagen va recortada a la forma interna.
  if (params.image && params.imageWidth && params.imageHeight) {
    ctx.save();
    tracePath(ctx, shape, inX, inY, inW, inH);
    ctx.clip();

    const angle = params.rotationDeg * DEG_TO_RAD;
    const cos = Math.abs(Math.cos(angle));
    const sin = Math.abs(Math.sin(angle));
    // Caja que ocupa la imagen ya rotada: así el contain la mete entera.
    const rotatedW = params.imageWidth * cos + params.imageHeight * sin;
    const rotatedH = params.imageWidth * sin + params.imageHeight * cos;
    const scale = Math.min(inW / rotatedW, inH / rotatedH);
    const drawW = params.imageWidth * scale;
    const drawH = params.imageHeight * scale;

    ctx.translate(inX + inW / 2, inY + inH / 2);
    ctx.rotate(angle);
    ctx.drawImage(params.image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }
};

/**
 * Renderiza el diseño a un PNG (Blob) para adjuntar al encargo.
 *
 * Usa un canvas propio a `sizePx` de lado mayor (respetando la proporción de la
 * pieza). Corre en el hilo principal (hay `document`).
 */
export const exportDesignBlob = async (
  params: ComposeParams,
  sizePx = 1200,
): Promise<Blob> => {
  const ratio = params.pieceWidthCm / params.pieceHeightCm;
  const width = ratio >= 1 ? sizePx : Math.round(sizePx * ratio);
  const height = ratio >= 1 ? Math.round(sizePx / ratio) : sizePx;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No pude preparar el lienzo para exportar el diseño.');

  composeShapeDesign(ctx, width, height, params);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No pude exportar el diseño.'))),
      'image/png',
    );
  });
};
