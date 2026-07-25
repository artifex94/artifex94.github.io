import React, { useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { STEPS, canAdvance, useCalculatorState, type Step } from '../../hooks/useCalculatorState';
import { useTuftingPipeline } from '../../hooks/useTuftingPipeline';
import { availableWools, woolById, DEFAULT_BORDER_WOOL_ID, MAX_WOOLS_PER_PIECE } from '../../data/wools';
import { BORDER_WIDTH_CM } from '../../data/tuftingPricing';
import { validateDimensions } from '../../data/tuftingCalculator';
import { UploadStep } from './steps/UploadStep';
import { ShapeStep } from './steps/ShapeStep';
import { ColorsStep } from './steps/ColorsStep';
import { QuoteStep } from './steps/QuoteStep';

const STEP_LABELS: Record<Step, string> = {
  upload: 'Diseño',
  shape: 'Forma',
  colors: 'Colores',
  quote: 'Presupuesto',
};

/** Espera a que el cliente termine de escribir antes de medir. */
const MEASURE_DEBOUNCE_MS = 400;

export const CalculatorStepper: React.FC = () => {
  const [state, dispatch] = useCalculatorState();
  const pipeline = useTuftingPipeline();
  const { step, upload, shape, dimensions } = state;
  const objectUrl = upload?.objectUrl;

  // Las object URLs sostienen el archivo en memoria hasta que se revocan.
  // Se libera la anterior cuando se reemplaza el archivo y al desmontar.
  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const palette = useMemo(() => {
    const wools = availableWools();
    return {
      wools,
      lab: wools.map((wool) => wool.lab),
      rgb: wools.map((wool) => wool.rgb),
      border: woolById(DEFAULT_BORDER_WOOL_ID)?.rgb ?? ([26, 26, 26] as const),
    };
  }, []);

  const { run: runPipeline, reset: resetPipeline } = pipeline;
  const feretCm = dimensions.feretCm;
  const measurementReady =
    shape === 'contorneada' &&
    objectUrl !== undefined &&
    feretCm !== undefined &&
    validateDimensions('contorneada', dimensions).length === 0;

  // Guarda la última medición pedida para no repetirla al volver de un paso.
  const lastRunKey = useRef<string | null>(null);

  useEffect(() => {
    if (!measurementReady || !objectUrl || feretCm === undefined) {
      lastRunKey.current = null;
      return;
    }

    const key = `${objectUrl}|${feretCm}`;
    if (lastRunKey.current === key) return;

    const timer = setTimeout(async () => {
      lastRunKey.current = key;
      // El File original se recupera de la object URL: así el estado del
      // reducer se mantiene serializable y los tests no dependen de un File.
      const blob = await fetch(objectUrl).then((response) => response.blob());
      const result = await runPipeline({
        blob,
        feretCm,
        borderCm: BORDER_WIDTH_CM,
        paletteLab: palette.lab,
        paletteRgb: palette.rgb,
        borderRgb: palette.border,
        maxColors: MAX_WOOLS_PER_PIECE,
      });

      if (result) dispatch({ type: 'measured', areaM2: result.areaM2 });
    }, MEASURE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [measurementReady, objectUrl, feretCm, palette, runPipeline, dispatch]);

  // Cambiar de archivo invalida cualquier medición anterior.
  useEffect(() => {
    lastRunKey.current = null;
    resetPipeline();
  }, [objectUrl, resetPipeline]);

  const currentIndex = STEPS.indexOf(step);
  const isLast = step === 'quote';

  return (
    <div className="flex flex-col gap-10">
      <ol className="flex flex-wrap items-center gap-2 list-none p-0 text-sm">
        {STEPS.map((candidate, index) => {
          const done = index < currentIndex;
          const active = candidate === step;

          return (
            <li key={candidate} className="flex items-center gap-2">
              <button
                type="button"
                aria-current={active ? 'step' : undefined}
                disabled={!done && !active}
                onClick={() => dispatch({ type: 'go-to-step', step: candidate })}
                className={cn(
                  'px-3 py-1.5 rounded-full border transition-colors min-h-11 sm:min-h-0',
                  active && 'border-accent text-accent font-semibold',
                  done && 'border-line text-secondary hover:border-accent hover:text-accent',
                  !done && !active && 'border-line text-secondary opacity-50 cursor-not-allowed',
                )}
              >
                {index + 1}. {STEP_LABELS[candidate]}
              </button>
              {index < STEPS.length - 1 && (
                <span className="text-secondary" aria-hidden="true">
                  ·
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="bg-surface/50 border border-line rounded-2xl p-6 md:p-8">
        {step === 'upload' && (
          <UploadStep upload={upload} error={state.uploadError} dispatch={dispatch} />
        )}
        {step === 'shape' && <ShapeStep state={state} dispatch={dispatch} pipeline={pipeline} />}
        {step === 'colors' && (
          <ColorsStep state={state} dispatch={dispatch} preview={pipeline.result?.preview ?? null} />
        )}
        {step === 'quote' && <QuoteStep state={state} dispatch={dispatch} />}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => dispatch({ type: 'back' })}
          disabled={currentIndex === 0}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-3 rounded-full border border-line font-semibold transition-colors min-h-11',
            currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:border-accent hover:text-accent',
          )}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Atrás
        </button>

        {!isLast && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'next' })}
            disabled={!canAdvance(state)}
            className={cn(
              'inline-flex items-center gap-2 bg-accent text-on-accent px-6 py-3 rounded-full font-bold transition-opacity min-h-11',
              canAdvance(state) ? 'hover:opacity-90' : 'opacity-40 cursor-not-allowed',
            )}
          >
            Seguir
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
