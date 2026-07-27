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
        <filter id={pileFilterId} x="-20%" y="-48%" width="140%" height="196%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.86 1.22" numOctaves="4" seed="73" result="fiberNoise" />
          <feDisplacementMap in="SourceGraphic" in2="fiberNoise" scale="2.65" result="fuzzyStitch" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.35" result="pileLift" />
          <feOffset in="pileLift" dx="1.1" dy="1.9" result="pileShadow" />
          <feColorMatrix in="pileShadow" type="matrix" values="0 0 0 0 0.17 0 0 0 0 0.12 0 0 0 0 0.09 0 0 0 0.25 0" result="contactShadow" />
          <feOffset in="SourceAlpha" dx="-0.7" dy="-0.7" result="topCatch" />
          <feColorMatrix in="topCatch" type="matrix" values="0 0 0 0 0.93 0 0 0 0 0.76 0 0 0 0 0.64 0 0 0 0.07 0" result="topLight" />
          <feMerge>
            <feMergeNode in="contactShadow" />
            <feMergeNode in="fuzzyStitch" />
            <feMergeNode in="topLight" />
          </feMerge>
        </filter>
        <filter id={haloFilterId} x="-24%" y="-60%" width="148%" height="220%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.1 1.46" numOctaves="3" seed="91" result="hairNoise" />
          <feDisplacementMap in="SourceGraphic" in2="hairNoise" scale="3.4" />
          <feGaussianBlur stdDeviation="1.05" />
        </filter>
        <filter id={`${id}-wool-stitch-twist`} x="-8%" y="-26%" width="116%" height="152%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.9 2.7" numOctaves="2" seed="97" result="twistFiber" />
          <feDisplacementMap in="SourceGraphic" in2="twistFiber" scale="0.45" result="softTwist" />
          <feGaussianBlur in="softTwist" stdDeviation="0.42" />
        </filter>
      </defs>
      <path
        d="M4 18 C 28 2, 48 32, 72 16 S 118 1, 142 17 S 188 31, 216 12"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.2"
        filter={`url(#${haloFilterId})`}
        transform="translate(1.4 2.1)"
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
        strokeDasharray="3 5"
        strokeDashoffset="3"
        opacity="0.1"
        filter={`url(#${pileFilterId})`}
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
        filter={`url(#${id}-wool-stitch-twist)`}
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
      'atelier-felt relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] border border-line shadow-[0_18px_40px_rgba(112,70,52,0.12),inset_0_2px_14px_rgba(255,255,255,0.9),inset_0_-16px_34px_rgba(43,35,32,0.08)]',
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
  'atelier-felt relative overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_22px_54px_rgba(112,70,52,0.15),4px_8px_18px_rgba(112,70,52,0.09),-2px_-2px_10px_rgba(255,255,255,0.55),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-18px_34px_rgba(194,94,76,0.06)]';

export const puffyInteractiveClass =
  'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(112,70,52,0.18),0_8px_18px_rgba(112,70,52,0.10),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-18px_34px_rgba(194,94,76,0.08)]';
