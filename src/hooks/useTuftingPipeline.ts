import { useCallback, useEffect, useRef, useState } from 'react';
import type { Rgb } from '../utils/color';
import type { DetectedColor } from '../utils/tuftingPipeline';
import type { WorkerRequest, WorkerResponse } from '../workers/tufting.worker';

// Corre el pipeline de tufting fuera del hilo principal cuando se puede.
//
// El worker se crea PEREZOSAMENTE, en la primera corrida y no al montar. El
// prerender del build bootea la SPA en un Chromium headless: si el worker se
// instanciara al importar el módulo, cada ruta prerenderizada levantaría uno.

export interface PipelineOutput {
  areaM2: number;
  areaWithoutBorderM2: number;
  finalFeretCm: number;
  warnings: readonly string[];
  usedPaletteIndices: readonly number[];
  detectedColors: readonly DetectedColor[];
  preview: { rgba: Uint8ClampedArray; width: number; height: number };
  /** Extremos del Feret en coordenadas del preview, para la cinta de referencia. */
  feretLine: { ax: number; ay: number; bx: number; by: number };
}

export interface PipelineRunInput {
  blob: Blob;
  feretCm: number;
  borderCm: number;
  borderRgb: Rgb;
  maxColors: number;
}

export type PipelineStatus = 'idle' | 'running' | 'done' | 'error';

interface PipelineState {
  status: PipelineStatus;
  result: PipelineOutput | null;
  error: string | null;
}

const IDLE: PipelineState = { status: 'idle', result: null, error: null };

/**
 * Corre el pipeline en el hilo principal.
 *
 * Es el camino de respaldo cuando el navegador no soporta workers de módulo.
 * Funciona porque toda la lógica está en funciones puras: la única diferencia es
 * dónde se ejecutan.
 */
const runInline = async (input: PipelineRunInput): Promise<PipelineOutput | null> => {
  const [{ decodeToWorkingSize }, { runTuftingPipeline }] = await Promise.all([
    import('../utils/imageDecode'),
    import('../utils/tuftingPipeline'),
  ]);

  const decoded = await decodeToWorkingSize(input.blob);
  const result = runTuftingPipeline({
    decoded,
    feretCm: input.feretCm,
    borderCm: input.borderCm,
    borderRgb: input.borderRgb,
    maxColors: input.maxColors,
  });

  if (!result) return null;

  return {
    areaM2: result.measure.areaM2,
    areaWithoutBorderM2: result.measure.areaWithoutBorderM2,
    finalFeretCm: result.measure.finalFeretCm,
    warnings: result.measure.warnings,
    usedPaletteIndices: result.usedPaletteIndices,
    detectedColors: result.detectedColors,
    preview: result.preview,
    feretLine: result.feretLine,
  };
};

export const useTuftingPipeline = () => {
  const workerRef = useRef<Worker | null>(null);
  const runIdRef = useRef(0);
  const pendingRef = useRef(new Map<number, (value: PipelineOutput | null) => void>());
  const [state, setState] = useState<PipelineState>(IDLE);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    },
    [],
  );

  const ensureWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;
    if (typeof Worker === 'undefined') return null;

    try {
      const worker = new Worker(new URL('../workers/tufting.worker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        const resolve = pendingRef.current.get(message.runId);
        pendingRef.current.delete(message.runId);
        if (!resolve) return; // corrida vieja: se descarta

        if (!message.ok) {
          setState({ status: 'error', result: null, error: message.message });
          resolve(null);
          return;
        }

        resolve({
          areaM2: message.areaM2,
          areaWithoutBorderM2: message.areaWithoutBorderM2,
          finalFeretCm: message.finalFeretCm,
          warnings: message.warnings,
          usedPaletteIndices: message.usedPaletteIndices,
          detectedColors: message.detectedColors,
          preview: message.preview,
          feretLine: message.feretLine,
        });
      };

      workerRef.current = worker;
      return worker;
    } catch {
      // Navegador sin workers de módulo: se sigue por el hilo principal.
      return null;
    }
  }, []);

  const run = useCallback(
    async (input: PipelineRunInput): Promise<PipelineOutput | null> => {
      runIdRef.current += 1;
      const runId = runIdRef.current;
      setState({ status: 'running', result: null, error: null });

      const finish = (result: PipelineOutput | null): PipelineOutput | null => {
        // Solo la corrida más reciente puede escribir el estado: si el cliente
        // cambió algo mientras tanto, este resultado ya no corresponde.
        if (runId !== runIdRef.current) return null;
        if (!result) {
          setState({
            status: 'error',
            result: null,
            error: 'No encontré ninguna figura recortada en la imagen.',
          });
          return null;
        }
        setState({ status: 'done', result, error: null });
        return result;
      };

      const worker = ensureWorker();

      if (worker) {
        const request: WorkerRequest = {
          runId,
          blob: input.blob,
          feretCm: input.feretCm,
          borderCm: input.borderCm,
          borderRgb: input.borderRgb,
          maxColors: input.maxColors,
        };

        const result = await new Promise<PipelineOutput | null>((resolve) => {
          pendingRef.current.set(runId, resolve);
          worker.postMessage(request);
        });

        return finish(result);
      }

      try {
        return finish(await runInline(input));
      } catch (error) {
        if (runId !== runIdRef.current) return null;
        setState({
          status: 'error',
          result: null,
          error: error instanceof Error ? error.message : 'No pude procesar la imagen.',
        });
        return null;
      }
    },
    [ensureWorker],
  );

  const reset = useCallback(() => {
    runIdRef.current += 1;
    pendingRef.current.clear();
    setState(IDLE);
  }, []);

  return { ...state, run, reset };
};
