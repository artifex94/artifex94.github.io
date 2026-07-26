import React from 'react';
import { cn } from '../../utils/cn';

interface WoolStitchProps {
  className?: string;
  label?: string;
}

// Detalle decorativo de lana: una puntada ondulada con torsión clara encima.
export const WoolStitch: React.FC<WoolStitchProps> = ({ className, label }) => (
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
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
      opacity="0.24"
    />
    <path
      d="M4 18 C 28 2, 48 32, 72 16 S 118 1, 142 17 S 188 31, 216 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.9"
    />
    <path
      d="M4 18 C 28 2, 48 32, 72 16 S 118 1, 142 17 S 188 31, 216 12"
      fill="none"
      stroke="var(--color-surface)"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeDasharray="1 8"
      opacity="0.8"
    />
  </svg>
);

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
