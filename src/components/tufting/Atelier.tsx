import React from 'react';
import { cn } from '../../utils/cn';

import {
  atelierFeltPanelClass,
  woodFrame,
  woodGrain,
} from './atelierMaterials';

interface WoodFrameProps {
  children: React.ReactNode;
  className?: string;
  grainClassName?: string;
}

export const AtelierWoodFrame: React.FC<WoodFrameProps> = ({ children, className, grainClassName }) => (
  <div className={cn('relative rounded-[2.25rem] p-2.5 md:p-3.5', className)} style={woodFrame}>
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 rounded-[inherit]', grainClassName)}
      style={woodGrain}
    />
    {children}
  </div>
);

interface FeltPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  framed?: boolean;
}

export const AtelierFeltPanel: React.FC<FeltPanelProps> = ({ children, className, framed = false, ...props }) => {
  const panel = (
    <div className={cn(atelierFeltPanelClass, className)} {...props}>
      {children}
    </div>
  );

  return framed ? <AtelierWoodFrame>{panel}</AtelierWoodFrame> : panel;
};

export const AtelierIconBadge: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div
    className={cn(
      'atelier-felt relative flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-accent/30 text-accent shadow-[0_16px_30px_rgba(112,70,52,0.13),inset_0_1px_0_rgba(255,255,255,0.9)] before:pointer-events-none before:absolute before:inset-1.5 before:rounded-[1rem] before:border before:border-dashed before:border-accent/45',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const YarnBallNumber: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
  <span
    className={cn(
      'relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent font-display text-2xl font-bold text-on-accent shadow-[0_12px_24px_rgba(194,94,76,0.22),inset_0_2px_5px_rgba(255,255,255,0.45),inset_0_-7px_12px_rgba(43,35,32,0.16)] after:pointer-events-none after:absolute after:inset-1 after:rounded-full after:border after:border-dashed after:border-[color:rgba(253,249,243,0.58)]',
      className,
    )}
    style={{
      background:
        'radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--color-accent) 48%, #fdf9f3), var(--color-accent) 72%)',
    }}
  >
    <span aria-hidden="true" className="absolute inset-0 rounded-full opacity-35 [background-image:repeating-linear-gradient(115deg,transparent_0_4px,rgba(253,249,243,0.55)_5px,transparent_7px)]" />
    <span className="relative">{value}</span>
  </span>
);
