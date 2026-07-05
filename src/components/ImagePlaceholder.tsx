import React, { useId } from 'react';
import { cn } from '../utils/cn';

interface ImagePlaceholderProps {
  label?: string;
  className?: string;
}

// Placeholder para piezas que todavía no tienen foto: patrón de "trazos" de
// tufting dibujado en SVG con los colores del theme activo.
export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  label = 'Foto próximamente',
  className,
}) => {
  // id único por instancia: varios placeholders conviven en la misma página
  const patternId = useId();

  return (
    <div
      className={cn(
        'relative w-full aspect-square bg-surface border border-line overflow-hidden flex items-center justify-center',
        className
      )}
      role="img"
      aria-label={label}
    >
      <svg
        className="absolute inset-0 w-full h-full text-accent opacity-[0.14]"
        aria-hidden="true"
      >
        <defs>
          <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
            <path
              d="M4 24 Q 8 12 14 18 T 24 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <span className="relative text-xs uppercase tracking-widest text-secondary">
        {label}
      </span>
    </div>
  );
};
