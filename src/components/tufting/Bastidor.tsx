import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { PreviewCanvas } from './PreviewCanvas';
import { FeretTape } from './FeretTape';
import {
  describeDimensions,
  describeShape,
  type Dimensions,
  type Shape,
} from '../../data/tuftingCalculator';
import type { UploadState } from '../../hooks/useCalculatorState';
import type { PipelineOutput, PipelineStatus } from '../../hooks/useTuftingPipeline';

interface BastidorProps {
  upload: UploadState | null;
  shape: Shape | null;
  dimensions: Dimensions;
  areaM2: number | null;
  pipelineStatus: PipelineStatus;
  pipelineResult: PipelineOutput | null;
  className?: string;
}

// El bastidor: el marco donde la pieza vive durante todo el recorrido.
//
// Es el panel persistente de la izquierda. La imagen que sube el cliente nunca
// desaparece detrás de un paso: queda prendida acá y va tomando forma — primero
// el diseño crudo, después el contorno o la cinta métrica, al final la pieza
// remapeada a lanas reales. El juego es mirar cómo evoluciona.

/** Colores del marco de madera. Locales a este componente: no son tokens del tema. */
const WOOD = '#b08968';
const WOOD_SHADOW = '#8a6a52';

/** El lienzo vacío: tela de monje con su retícula, esperando el diseño. */
const clothBackground: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(43,35,32,0.05) 0 1px, transparent 1px 9px),' +
    'repeating-linear-gradient(90deg, rgba(43,35,32,0.05) 0 1px, transparent 1px 9px)',
};

export const Bastidor: React.FC<BastidorProps> = ({
  upload,
  shape,
  dimensions,
  areaM2,
  pipelineStatus,
  pipelineResult,
  className,
}) => {
  const reduce = useReducedMotion();

  const showContoured = shape === 'contorneada' && pipelineResult !== null;
  const feretCm = dimensions.feretCm;

  const statusText = (() => {
    if (!upload) return 'El bastidor está vacío. Subí tu diseño para empezar.';
    if (pipelineStatus === 'running') return 'Midiendo tu diseño…';
    if (!shape) return 'Diseño prendido. Ahora elegí la forma.';
    if (areaM2 === null) return `${describeShape(shape)}: falta la medida.`;
    return `${describeShape(shape)} · ${describeDimensions(shape, dimensions)}`;
  })();

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* El marco de madera. El grosor y el bisel son el "chrome" del juego. */}
      <div
        className="rounded-2xl p-3 shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${WOOD} 0%, ${WOOD_SHADOW} 100%)`,
        }}
      >
        <div
          className="relative rounded-xl bg-base overflow-hidden aspect-square flex items-center justify-center"
          style={clothBackground}
        >
          {!upload && (
            <p className="text-sm text-secondary text-center px-8 leading-relaxed">
              Tu diseño va a aparecer acá,
              <br />
              prendido al bastidor.
            </p>
          )}

          {upload && !showContoured && (
            <motion.div
              key={upload.objectUrl}
              className="relative w-full h-full flex items-center justify-center p-4"
              initial={reduce ? false : { opacity: 0, scale: 0.85, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <img
                src={upload.objectUrl}
                alt={`Tu diseño: ${upload.fileName}`}
                className="max-w-full max-h-full object-contain"
              />

              {/* Contorno de la forma elegida, para las formas simples. */}
              {shape === 'circular' && (
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  aria-hidden="true"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                </svg>
              )}
              {shape === 'rectangular' && (
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  aria-hidden="true"
                >
                  <rect
                    x="6"
                    y="6"
                    width="88"
                    height="88"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                </svg>
              )}
            </motion.div>
          )}

          {showContoured && pipelineResult && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <div className="relative max-w-full max-h-full">
                <PreviewCanvas
                  rgba={pipelineResult.preview.rgba}
                  width={pipelineResult.preview.width}
                  height={pipelineResult.preview.height}
                  className="max-w-full max-h-full w-auto h-auto"
                />
                {feretCm !== undefined && (
                  <FeretTape
                    line={pipelineResult.feretLine}
                    width={pipelineResult.preview.width}
                    height={pipelineResult.preview.height}
                    cm={feretCm}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* La ficha al pie: el estado de la pieza, siempre visible. */}
      <div
        className="bg-surface border border-line rounded-xl px-4 py-3 text-sm"
        aria-live="polite"
      >
        <p className="font-medium">{statusText}</p>
        {areaM2 !== null && (
          <p className="text-secondary font-mono mt-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {areaM2.toFixed(2)} m²
            {showContoured && pipelineResult && (
              <> · terminada mide ~{Math.round(pipelineResult.finalFeretCm)} cm</>
            )}
          </p>
        )}
        {pipelineResult?.warnings.map((warning) => (
          <p key={warning} className="text-accent text-xs mt-1.5">
            {warning}
          </p>
        ))}
      </div>
    </div>
  );
};
