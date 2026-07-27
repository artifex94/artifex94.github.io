import React from 'react';
import { cn } from '../../utils/cn';

interface WoolStitchProps {
  className?: string;
  label?: string;
}

// Detalle decorativo de lana: cordón grueso de tufting rasterizado como imagen para evitar repintar paths durante el scroll.
const woolPath = 'M4 18 C 28 2, 48 32, 72 16 S 118 1, 142 17 S 188 31, 216 12';
const woolStitchSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 34" preserveAspectRatio="none">
  <path d="${woolPath}" fill="none" stroke="#2b2320" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="0.2" transform="translate(1.4 2.1)" />
  <path d="${woolPath}" fill="none" stroke="#2b2320" stroke-width="11.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.09" transform="translate(0.4 0.7)" />
  <path d="${woolPath}" fill="none" stroke="#fffaf2" stroke-width="12.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.15" />
  <path d="${woolPath}" fill="none" stroke="#c25e4c" stroke-width="8.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.92" />
  <path d="${woolPath}" fill="none" stroke="#7f3e35" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 5.4" stroke-dashoffset="1.1" opacity="0.16" />
  <path d="${woolPath}" fill="none" stroke="#ce7b6a" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2.7 4.8" opacity="0.5" />
  <path d="${woolPath}" fill="none" stroke="#fff4e8" stroke-width="0.72" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1.3 6.2" stroke-dashoffset="2.4" opacity="0.34" />
</svg>`;

const woolStitchSrc = `data:image/svg+xml,${encodeURIComponent(woolStitchSvg)}`;

export const WoolStitch: React.FC<WoolStitchProps> = ({ className, label }) => {
  return (
    <img
      src={woolStitchSrc}
      className={cn('h-8 w-full', className)}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      draggable={false}
      decoding="async"
    />
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
      'atelier-felt relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] border border-line shadow-[0_16px_26px_rgba(112,70,52,0.14),0_2px_7px_rgba(43,35,32,0.06),inset_0_1px_0_rgba(255,255,255,0.88)]',
      className,
    )}
  >
    <div className="relative w-3/4 rounded-full bg-surface/90 px-5 py-3 text-center text-sm font-semibold text-secondary shadow-[0_8px_16px_rgba(43,35,32,0.09)]">
      {label}
    </div>
  </div>
);

export const puffyCardClass =
  'atelier-felt relative overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_20px_28px_rgba(112,70,52,0.16),0_3px_8px_rgba(43,35,32,0.06),inset_0_1px_0_rgba(255,255,255,0.92)]';

export const puffyInteractiveClass =
  'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_28px_rgba(112,70,52,0.18),0_4px_10px_rgba(43,35,32,0.07)]';
