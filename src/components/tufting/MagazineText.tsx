import React, { useRef } from 'react';
import { cn } from '../../utils/cn';
import { usePretextFlow } from '../../hooks/usePretextFlow';

interface MagazineTextProps {
  /** El párrafo a maquetar (una pieza de texto, sin markup). */
  text: string;
  /** Ornamento (nodo visual) que el texto esquiva. Se ubica como float. */
  ornament?: React.ReactNode;
  /** De qué lado va el ornamento. Default: derecha. */
  ornamentSide?: 'left' | 'right';
  /** Clases para el contenedor del ornamento (tamaño/márgenes). */
  ornamentClassName?: string;
  /** Clases tipográficas (font, color, tamaño). Se usan tanto en el texto base
      como en las líneas realzadas, para que midan y se vean idéntico. */
  className?: string;
  /** Ancho mínimo del contenedor para realzar; por debajo queda texto plano. */
  minWidth?: number;
  gap?: number;
}

// Texto "estilo revista" que fluye alrededor de un ornamento, con Pretext.
//
// El ornamento se renderiza como un float real: en el camino base (SSR, mobile,
// sin canvas) el texto lo esquiva con el wrap natural de CSS; cuando se puede,
// `usePretextFlow` mide el ornamento y superpone las líneas ya acomodadas con más
// precisión. SIEMPRE hay texto plano indexable/accesible: la copia base queda
// `sr-only` al realzar y las líneas visibles quedan `aria-hidden` para no
// duplicar la lectura. Si algo falla, se queda el texto plano.
export const MagazineText: React.FC<MagazineTextProps> = ({
  text,
  ornament,
  ornamentSide = 'right',
  ornamentClassName,
  className,
  minWidth,
  gap,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLParagraphElement>(null);
  const ornamentRef = useRef<HTMLDivElement>(null);
  const { lines, height, enhanced } = usePretextFlow({
    text,
    containerRef,
    measureRef,
    obstacleRef: ornamentRef,
    minWidth,
    gap,
  });

  return (
    <div ref={containerRef} className="relative" style={enhanced ? { height } : undefined}>
      {ornament && (
        <div
          ref={ornamentRef}
          aria-hidden="true"
          className={cn(
            'mb-3',
            ornamentSide === 'left' ? 'float-left mr-5' : 'float-right ml-5',
            ornamentClassName,
          )}
        >
          {ornament}
        </div>
      )}
      <p ref={measureRef} className={cn(className, enhanced && 'sr-only')}>
        {text}
      </p>
      {enhanced && lines && (
        <div aria-hidden="true" className={cn(className, 'pointer-events-none absolute inset-0 m-0')}>
          {lines.map((line, index) => (
            <span
              key={index}
              className="absolute whitespace-pre"
              style={{ left: line.x, top: line.y }}
            >
              {line.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
