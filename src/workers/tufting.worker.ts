import { decodeToWorkingSize } from '../utils/imageDecode';
import { runTuftingPipeline } from '../utils/tuftingPipeline';
import { buildPaletteLut, type Lab, type Rgb } from '../utils/color';

// Worker del pipeline de tufting.
//
// La medición completa (componentes conexas, envolvente convexa, transformada de
// distancia y remapeo de color) son entre 60 y 200 ms en una compu de escritorio
// y hasta 800 ms en un celular gama media. En el hilo principal eso se traduce en
// cuadros perdidos cada vez que el cliente mueve un control, y el valor de la
// herramienta es justamente que la previsualización responda en vivo.
//
// Este archivo es una cáscara delgada: toda la lógica vive en funciones puras
// que también corren en el hilo principal cuando no hay worker disponible.

export interface WorkerRequest {
  /** Identificador de la corrida, para descartar respuestas viejas. */
  runId: number;
  blob: Blob;
  feretCm: number;
  borderCm: number;
  paletteLab: Lab[];
  paletteRgb: Rgb[];
  borderRgb: Rgb;
  maxColors: number;
}

export type WorkerResponse =
  | {
      runId: number;
      ok: true;
      areaM2: number;
      areaWithoutBorderM2: number;
      finalFeretCm: number;
      feretPx: number;
      cmPerPx: number;
      warnings: readonly string[];
      usedPaletteIndices: readonly number[];
      preview: { rgba: Uint8ClampedArray; width: number; height: number };
      /** Extremos del Feret en coordenadas del preview, para la línea de referencia. */
      feretLine: { ax: number; ay: number; bx: number; by: number };
    }
  | { runId: number; ok: false; message: string };

// El tsconfig de la app usa la lib del DOM, donde `self` es una Window y su
// postMessage tiene otra firma. Se tipa acá el scope de worker en vez de sumar
// un tsconfig aparte solo por este archivo.
const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: WorkerResponse, transfer?: Transferable[]) => void;
};

// La tabla de color depende solo de la paleta, que casi nunca cambia: se cachea
// para no pagar los 32.768 cálculos de ΔE2000 en cada corrida.
let cachedKey = '';
let cachedLut: Uint8Array | null = null;

const lutFor = (paletteLab: Lab[]): Uint8Array => {
  const key = JSON.stringify(paletteLab);
  if (key !== cachedKey || !cachedLut) {
    cachedLut = buildPaletteLut(paletteLab);
    cachedKey = key;
  }
  return cachedLut;
};

workerScope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { runId, blob, feretCm, borderCm, paletteLab, paletteRgb, borderRgb, maxColors } =
    event.data;

  try {
    const decoded = await decodeToWorkingSize(blob);
    const result = runTuftingPipeline({
      decoded,
      feretCm,
      borderCm,
      paletteLab,
      paletteRgb,
      lut: lutFor(paletteLab),
      borderRgb,
      maxColors,
    });

    if (!result) {
      const failure: WorkerResponse = {
        runId,
        ok: false,
        message: 'No encontré ninguna figura recortada en la imagen.',
      };
      workerScope.postMessage(failure);
      return;
    }

    const response: WorkerResponse = {
      runId,
      ok: true,
      areaM2: result.measure.areaM2,
      areaWithoutBorderM2: result.measure.areaWithoutBorderM2,
      finalFeretCm: result.measure.finalFeretCm,
      feretPx: result.measure.feretPx,
      cmPerPx: result.measure.cmPerPx,
      warnings: result.measure.warnings,
      usedPaletteIndices: result.usedPaletteIndices,
      preview: result.preview,
      feretLine: result.feretLine,
    };

    // El buffer de la previsualización se transfiere en vez de clonarse: son
    // varios megabytes y copiarlos en cada corrida se nota.
    workerScope.postMessage(response, [result.preview.rgba.buffer]);
  } catch (error) {
    const failure: WorkerResponse = {
      runId,
      ok: false,
      message: error instanceof Error ? error.message : 'No pude procesar la imagen.',
    };
    workerScope.postMessage(failure);
  }
};
