import React from 'react';
import { cn } from '../../utils/cn';

interface WoolStitchProps {
  className?: string;
  label?: string;
}

// Detalle decorativo de lana: cordón grueso de tufting con borde afelpado, grano mate y torsión visible.
export const WoolStitch: React.FC<WoolStitchProps> = ({ className, label }) => {
  return (
    <svg
      viewBox="0 0 220 34"
      className={cn('h-8 w-full text-accent', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="none"
    >
      <path
        d="M4 18 C 28 2, 48 32, 72 16 S 118 1, 142 17 S 188 31, 216 12"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.2"
        transform="translate(1.4 2.1)"
      />
      <path
        d="M4 18 C 28 2, 48 32, 72 16 S 118 1, 142 17 S 188 31, 216 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="8.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M4 18 C 28 2, 48 32, 72 16 S 118 1, 142 17 S 188 31, 216 12"
        fill="none"
        stroke="color-mix(in srgb, currentColor 76%, #f5d6c7)"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="3 5"
        opacity="0.34"
      />
    </svg>
  );
};

interface WoolPlaceholderProps {
  label?: string;
  className?: string;
}

export const WoolPlaceholder: React.FC<WoolPlaceholderProps> = ({
  label = 'Pieza en preparación',
  className,
}) => (
  <div
    className={cn(
      'atelier-felt relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] border border-line shadow-[0_14px_22px_rgba(112,70,52,0.11),inset_0_1px_0_rgba(255,255,255,0.86)]',
      className,
    )}
  >
    <div className="relative w-3/4 rounded-full bg-surface/90 px-5 py-3 text-center text-sm font-semibold text-secondary shadow-[0_8px_16px_rgba(43,35,32,0.09)]">
      {label}
    </div>
  </div>
);

export const puffyCardClass =
  'atelier-felt relative overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_18px_24px_rgba(112,70,52,0.13),inset_0_1px_0_rgba(255,255,255,0.9)]';

export const puffyInteractiveClass =
  'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_24px_rgba(112,70,52,0.16)]';
