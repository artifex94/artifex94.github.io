import React, { useId } from 'react';
import { cn } from '../../utils/cn';

interface WoolStitchProps {
  className?: string;
  label?: string;
}

// Detalle decorativo de lana: cordón grueso de tufting con borde afelpado, grano mate y torsión visible.
export const WoolStitch: React.FC<WoolStitchProps> = ({ className, label }) => {
  const id = useId().replace(/:/g, '-');
  const pileFilterId = `${id}-wool-stitch-pile`;
  const haloFilterId = `${id}-wool-stitch-halo`;

  return (
    <svg
      viewBox="0 0 220 34"
      className={cn('h-8 w-full text-accent', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={pileFilterId} x="-18%" y="-42%" width="136%" height="184%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.05" numOctaves="4" seed="73" result="fiberNoise" />
          <feDisplacementMap in="SourceGraphic" in2="fiberNoise" scale="2.3" result="fuzzyStitch" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.25" result="pileLift" />
          <feOffset in="pileLift" dx="0" dy="1.3" result="pileShadow" />
          <feColorMatrix in="pileShadow" type="matrix" values="0 0 0 0 0.17 0 0 0 0 0.12 0 0 0 0 0.09 0 0 0 0.2 0" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="fuzzyStitch" />
          </feMerge>
        </filter>
        <filter id={haloFilterId} x="-22%" y="-56%" width="144%" height="212%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.32" numOctaves="3" seed="91" result="hairNoise" />
          <feDisplacementMap in="SourceGraphic" in2="hairNoise" scale="3" />
          <feGaussianBlur stdDeviation="1" />
        </filter>
      </defs>
      <path
        d="M4 18 C 28 2, 48 32, 72 16 S 118 1, 142 17 S 188 31, 216 12"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.16"
        filter={`url(#${haloFilterId})`}
      />
      <path
        d="M4 18 C 28 2, 48 32, 72 16 S 118 1, 142 17 S 188 31, 216 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.28"
        filter={`url(#${haloFilterId})`}
      />
      <path
        d="M4 18 C 28 2, 48 32, 72 16 S 118 1, 142 17 S 188 31, 216 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="8.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
        filter={`url(#${pileFilterId})`}
      />
      <path
        d="M4 18 C 28 2, 48 32, 72 16 S 118 1, 142 17 S 188 31, 216 12"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 10"
        strokeDashoffset="4"
        opacity="0.12"
        filter={`url(#${pileFilterId})`}
      />
      <path
        d="M4 18 C 28 2, 48 32, 72 16 S 118 1, 142 17 S 188 31, 216 12"
        fill="none"
        stroke="var(--color-surface)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 10"
        opacity="0.72"
        filter={`url(#${pileFilterId})`}
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
      'relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.95),rgba(255,255,255,0)_34%),linear-gradient(135deg,rgba(194,94,76,0.18),rgba(245,239,230,0.95)_45%,rgba(194,94,76,0.12))] shadow-[inset_0_2px_14px_rgba(255,255,255,0.9),inset_0_-16px_34px_rgba(43,35,32,0.08)]',
      className,
    )}
  >
    <div className="absolute inset-0 opacity-35 [background-image:repeating-linear-gradient(115deg,transparent_0,transparent_10px,rgba(194,94,76,0.22)_11px,transparent_13px)]" />
    <div className="relative w-3/4 rounded-full bg-surface/75 px-5 py-3 text-center text-sm font-semibold text-secondary shadow-[0_12px_30px_rgba(43,35,32,0.10)] backdrop-blur-sm">
      {label}
    </div>
  </div>
);

export const puffyCardClass =
  'relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(255,248,240,0.88))] shadow-[0_20px_50px_rgba(112,70,52,0.14),0_5px_14px_rgba(112,70,52,0.08),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-18px_34px_rgba(194,94,76,0.06)]';

export const puffyInteractiveClass =
  'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(112,70,52,0.18),0_8px_18px_rgba(112,70,52,0.10),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-18px_34px_rgba(194,94,76,0.08)]';
