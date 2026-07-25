import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  STEPS,
  canAdvance,
  resolveAreaM2,
  useCalculatorState,
  type Step,
} from '../../hooks/useCalculatorState';
import { useTuftingPipeline } from '../../hooks/useTuftingPipeline';
import { availableWools, woolById, DEFAULT_BORDER_WOOL_ID, MAX_WOOLS_PER_PIECE } from '../../data/wools';
import { BORDER_WIDTH_CM } from '../../data/tuftingPricing';
import { validateDimensions } from '../../data/tuftingCalculator';
import { Bastidor } from './Bastidor';
import { ThreadProgress } from './ThreadProgress';
import { UploadStep } from './steps/UploadStep';
import { ShapeStep } from './steps/ShapeStep';
import { ColorsStep } from './steps/ColorsStep';
import { QuoteStep } from './steps/QuoteStep';

/** Espera a que el cliente termine de escribir antes de medir. */
const MEASURE_DEBOUNCE_MS = 400;

// El taller: bastidor a la izquierda, mesa de trabajo a la derecha.
//
// La pieza vive SIEMPRE en el bastidor — subir el diseño, elegir la forma o las
// lanas nunca la esconde. La mesa muestra la etapa activa, y el hilo de arriba
// marca cuánto se tejió. No hay pasarela: la compra es una consecuencia de que
// la pieza esté lista, no el objetivo de la pantalla.
export const CalculatorStepper: React.FC = () => {
  const [state, dispatch] = useCalculatorState();
  const pipeline = useTuftingPipeline();
  const reduce = useReducedMotion();
  const { step, upload, shape, dimensions } = state;
  const objectUrl = upload?.objectUrl;

  // Las object URLs sostienen el archivo en memoria hasta que se revocan.
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

  const canVisit = (candidate: Step): boolean => {
    const target = STEPS.indexOf(candidate);
    if (target < currentIndex) return true;
    return target === currentIndex + 1 && canAdvance(state);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 lg:gap-12 items-start">
      {/* El bastidor: en desktop acompaña el scroll; en mobile encabeza. */}
      <Bastidor
        upload={upload}
        shape={shape}
        dimensions={dimensions}
        areaM2={resolveAreaM2(state)}
        pipelineStatus={pipeline.status}
        pipelineResult={pipeline.result}
        className="lg:sticky lg:top-24"
      />

      {/* La mesa de trabajo. */}
      <div className="flex flex-col gap-8 min-w-0">
        <ThreadProgress
          current={step}
          canVisit={canVisit}
          onVisit={(target) => dispatch({ type: 'go-to-step', step: target })}
          threadWoolId={state.woolIds[0]}
        />

        <div className="bg-surface/60 border border-line rounded-2xl p-6 md:p-8 overflow-hidden shadow-sm">
          {/* La etapa es una secuencia real: numerarla orienta sin volverse checkout. */}
          <p
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-secondary mb-5"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            Etapa {currentIndex + 1} de {STEPS.length}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {step === 'upload' && (
                <UploadStep upload={upload} error={state.uploadError} dispatch={dispatch} />
              )}
              {step === 'shape' && (
                <ShapeStep state={state} dispatch={dispatch} pipeline={pipeline} />
              )}
              {step === 'colors' && <ColorsStep state={state} dispatch={dispatch} />}
              {step === 'quote' && <QuoteStep state={state} dispatch={dispatch} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => dispatch({ type: 'back' })}
            disabled={currentIndex === 0}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-full border border-line font-semibold transition-colors min-h-11',
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:border-accent hover:text-accent',
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
              Continuar
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
