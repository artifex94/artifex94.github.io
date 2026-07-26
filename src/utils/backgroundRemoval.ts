// Quitar fondo: genera transparencia desde una imagen opaca.
//
// El celular a veces entrega el diseño como JPEG (galería) y la transparencia se
// perdió. No se puede "recuperar", pero SÍ se puede GENERAR: si el diseño está
// sobre un fondo sólido/uniforme, se detecta ese fondo desde los bordes y se lo
// vuelve transparente. Así la forma contorneada funciona en cualquier teléfono.
//
// El recorrido es un flood fill con pila explícita desde el borde (mismo patrón
// que largestComponent en imageMask): sólo se borra el fondo CONECTADO al borde,
// nunca zonas internas del mismo color que estén rodeadas por el diseño.

/** Estructura mínima de un ImageData (para poder testear sin canvas/jsdom). */
export interface RgbaImage {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface RemoveBackgroundOptions {
  /** Distancia de color (0-255 por canal, euclidiana) para considerar "fondo". */
  tolerance?: number;
}

export interface RemoveBackgroundResult {
  data: RgbaImage;
  /** true si se quitó fondo; false si no era confiable (no se tocó la imagen). */
  removed: boolean;
}

const DEFAULT_TOLERANCE = 42;
/** Si el fondo detectado es menos que esto, no vale la pena (imagen sin fondo). */
const MIN_REMOVED_FRACTION = 0.02;
/** Si "se come" casi todo, el fondo no era uniforme: se descarta para no romper. */
const MAX_REMOVED_FRACTION = 0.97;

/** Color de fondo estimado: promedio de las cuatro esquinas. */
const sampleBackground = (img: RgbaImage): [number, number, number] => {
  const { data, width, height } = img;
  const corners = [
    0,
    (width - 1) * 4,
    (height - 1) * width * 4,
    ((height - 1) * width + (width - 1)) * 4,
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const c of corners) {
    r += data[c];
    g += data[c + 1];
    b += data[c + 2];
  }
  return [r / 4, g / 4, b / 4];
};

/**
 * Quita el fondo sólido conectado al borde, poniéndolo transparente.
 *
 * Modifica `img.data` in-place SOLO si el resultado es confiable; si no, devuelve
 * `removed:false` sin tocar nada.
 */
export const removeBackground = (
  img: RgbaImage,
  options: RemoveBackgroundOptions = {},
): RemoveBackgroundResult => {
  const { data, width, height } = img;
  const total = width * height;
  if (total === 0) return { data: img, removed: false };

  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
  const tolSq = tolerance * tolerance;
  const [br, bg, bb] = sampleBackground(img);

  const matches = (index: number): boolean => {
    const o = index * 4;
    const dr = data[o] - br;
    const dg = data[o + 1] - bg;
    const db = data[o + 2] - bb;
    return dr * dr + dg * dg + db * db <= tolSq;
  };

  const isBackground = new Uint8Array(total);
  const stack = new Int32Array(total);
  let stackSize = 0;

  const pushIf = (index: number) => {
    if (!isBackground[index] && matches(index)) {
      isBackground[index] = 1;
      stack[stackSize++] = index;
    }
  };

  // Semillas: todos los píxeles del borde que ya parezcan fondo.
  for (let x = 0; x < width; x += 1) {
    pushIf(x);
    pushIf((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    pushIf(y * width);
    pushIf(y * width + width - 1);
  }

  let removedCount = 0;
  while (stackSize > 0) {
    const index = stack[--stackSize];
    removedCount += 1;
    const x = index % width;
    const y = (index - x) / width;
    if (x > 0) pushIf(index - 1);
    if (x < width - 1) pushIf(index + 1);
    if (y > 0) pushIf(index - width);
    if (y < height - 1) pushIf(index + width);
  }

  const fraction = removedCount / total;
  if (fraction < MIN_REMOVED_FRACTION || fraction > MAX_REMOVED_FRACTION) {
    return { data: img, removed: false };
  }

  for (let i = 0; i < total; i += 1) {
    if (isBackground[i]) data[i * 4 + 3] = 0;
  }
  return { data: img, removed: true };
};
