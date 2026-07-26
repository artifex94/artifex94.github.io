import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { PreviewCanvas } from './PreviewCanvas';
import { ShapeDesignCanvas } from './ShapeDesignCanvas';
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
  fillColor?: string;
  borderColor?: string;
  borderThick?: boolean;
  rotationDeg?: number;
  pieceWidthCm?: number;
  pieceHeightCm?: number;
  className?: string;
}

// El bastidor: el marco donde la pieza vive durante todo el recorrido.
//
// Es el panel persistente de la izquierda. La imagen que sube el cliente nunca
// desaparece detrás de un paso: queda prendida acá y va tomando forma — primero
// el diseño crudo, después el contorno o la cinta métrica, al final la pieza
// remapeada a lanas reales. El juego es mirar cómo evoluciona.

// Materialidad del marco. Locales a este componente: no son tokens del tema.
//
// Un gradiente solo se lee como "div pintado". La madera creíble necesita tres
// capas: el tono base con dirección de luz, la veta (bandas irregulares casi
// imperceptibles) y el bisel — luz arriba, sombra abajo — que es lo que hace
// que el marco tenga espesor en vez de ser una calcomanía.
const woodFrame: React.CSSProperties = {
  background:
    'linear-gradient(150deg, #bd9573 0%, #ab8260 42%, #916f55 78%, #82624c 100%)',
  boxShadow:
    '0 24px 48px -20px rgba(43, 35, 32, 0.45),' + // apoyo sobre la mesa
    'inset 0 2px 3px rgba(255, 246, 235, 0.55),' + // luz del bisel superior
    'inset 0 -3px 6px rgba(60, 42, 30, 0.4)', // sombra del bisel inferior
};

/** Veta: bandas finas a un ángulo apenas distinto del horizontal. */
const woodGrain: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(93deg, rgba(43,35,32,0.09) 0 2px, transparent 2px 6px,' +
    ' rgba(255,246,235,0.05) 6px 8px, transparent 8px 13px)',
};

/**
 * La tela de monje: trama fina y un viñeteado hacia los bordes.
 *
 * El viñeteado es lo que vende la ilusión: una tela tensada sobre un marco
 * siempre oscurece apenas contra el borde interior, donde dobla.
 */
const clothBackground: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(43,35,32,0.055) 0 1px, transparent 1px 5px),' +
    'repeating-linear-gradient(90deg, rgba(43,35,32,0.055) 0 1px, transparent 1px 5px)',
  boxShadow:
    'inset 0 0 28px rgba(43, 35, 32, 0.16), inset 0 0 3px rgba(43, 35, 32, 0.3)',
};

export const Bastidor: React.FC<BastidorProps> = ({
  upload,
  shape,
  dimensions,
  areaM2,
  pipelineStatus,
  pipelineResult,
  fillColor,
  borderColor,
  borderThick = false,
  rotationDeg = 0,
  pieceWidthCm,
  pieceHeightCm,
  className,
}) => {
  const reduce = useReducedMotion();
  const [previewError, setPreviewError] = useState<{ objectUrl: string; failed: boolean } | null>(
    null,
  );
  const currentPreviewFailed =
    previewError?.failed === true && previewError.objectUrl === upload?.objectUrl;

  const showContoured = shape === 'contorneada' && pipelineResult !== null;
  const showShapeDesign =
    upload !== null &&
    (shape === 'circular' || shape === 'rectangular') &&
    fillColor !== undefined &&
    borderColor !== undefined &&
    pieceWidthCm !== undefined &&
    pieceHeightCm !== undefined;
  const feretCm = dimensions.feretCm;

  const statusText = (() => {
    if (!upload) return 'El bastidor está vacío. Subí tu diseño para empezar.';
    if (pipelineStatus === 'running') return 'Midiendo tu diseño…';
    if (!shape) return 'Diseño prendido. Ahora elegí la forma.';
    if (areaM2 === null) return `${describeShape(shape)}: falta la medida.`;
    return `${describeShape(shape)} · ${describeDimensions(shape, dimensions)}`;
  })();

  return (
    <div className={cn('flex flex-row items-center gap-3 sm:flex-col sm:items-stretch sm:gap-2.5 lg:gap-4', className)}>
      {/* El marco de madera. El grosor y el bisel son el "chrome" del juego. */}
      <div className="relative w-[6.5rem] shrink-0 rounded-[1rem] p-2 shadow-xl sm:w-full sm:rounded-[1.4rem] sm:p-2.5 lg:p-3.5" style={woodFrame}>
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[1rem] pointer-events-none sm:rounded-[1.4rem]"
          style={woodGrain}
        />
        <div
          className="relative flex size-[5.5rem] min-h-0 items-center justify-center overflow-hidden rounded-md bg-base sm:size-auto sm:h-auto sm:min-h-[10.5rem] sm:aspect-square sm:rounded-lg lg:aspect-square"
          style={clothBackground}
        >
          {!upload && (
            <p className="px-2 text-center text-xs leading-snug text-secondary sm:px-6 sm:leading-relaxed sm:text-sm lg:px-8">
              Tu diseño va a aparecer acá,
              <br />
              prendido al bastidor.
            </p>
          )}

          {upload && !showContoured && (
            <motion.div
              key={upload.objectUrl}
              className="relative flex h-full w-full items-center justify-center p-1.5 sm:p-4"
              initial={reduce ? false : { opacity: 0, scale: 0.85, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              {showShapeDesign ? (
                <ShapeDesignCanvas
                  shape={shape}
                  pieceWidthCm={pieceWidthCm}
                  pieceHeightCm={pieceHeightCm}
                  fillColor={fillColor}
                  borderColor={borderColor}
                  borderThick={borderThick}
                  rotationDeg={rotationDeg}
                  imageUrl={upload.objectUrl}
                  className="w-full h-full"
                />
              ) : currentPreviewFailed ? (
                <p role="status" className="px-5 text-center text-xs leading-relaxed text-secondary sm:text-sm">
                  No pude mostrar la vista previa acá, pero el diseño se cargó bien.
                </p>
              ) : (
                <img
                  src={upload.objectUrl}
                  alt={`Tu diseño: ${upload.fileName}`}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setPreviewError({ objectUrl: upload.objectUrl, failed: true })}
                />
              )}
            </motion.div>
          )}

          {showContoured && pipelineResult && (
            <div className="relative flex h-full w-full items-center justify-center p-1.5 sm:p-4">
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

      {/* La ficha al pie: la etiqueta de taller de la pieza, siempre visible.
          El borde punteado interior es la costura de la etiqueta. */}
      <div className="min-w-0 flex-1 rounded-xl border border-line bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(255,248,240,0.9))] p-1.5 shadow-[0_10px_26px_rgba(112,70,52,0.10),inset_0_1px_0_rgba(255,255,255,0.95)] sm:w-full" aria-live="polite">
        <div className="rounded-lg border border-dashed border-accent/35 px-3 py-2 text-xs sm:px-3.5 sm:py-2.5 sm:text-sm">
          <p className="font-medium">{statusText}</p>
          {areaM2 !== null && (
            <p
              className="text-secondary font-mono mt-1"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
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
    </div>
  );
};
