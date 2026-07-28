import React from 'react';
import { cn } from '../../utils/cn';

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
