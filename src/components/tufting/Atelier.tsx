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
  <div className={cn('relative overflow-hidden rounded-[2.25rem] p-2.5 md:p-3.5', className)} style={woodFrame}>
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 rounded-[inherit]', grainClassName)}
      style={woodGrain}
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_3px_rgba(255,245,226,0.38)]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-[0.48rem] rounded-[1.75rem] border border-[rgba(62,39,25,0.26)] shadow-[inset_0_1px_2px_rgba(43,28,19,0.2)] md:inset-[0.65rem]"
    />
    <div className="relative">{children}</div>
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
      'atelier-felt relative flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-accent/30 text-accent shadow-[0_14px_24px_rgba(112,70,52,0.15),0_2px_7px_rgba(43,35,32,0.06),inset_0_1px_0_rgba(255,255,255,0.88)] before:pointer-events-none before:absolute before:inset-1.5 before:rounded-[1rem] before:border before:border-dashed before:border-accent/45',
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
      'yarn-pompon-number relative mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-2xl',
      className,
    )}
  >
    <span aria-hidden="true" className="absolute -inset-1 rounded-full opacity-70 [background-image:radial-gradient(circle_at_22%_18%,rgba(255,248,232,.45)_0_5%,transparent_16%),radial-gradient(circle_at_72%_76%,rgba(43,35,32,.18)_0_8%,transparent_24%),repeating-radial-gradient(circle_at_50%_50%,transparent_0_5px,rgba(255,240,215,.18)_6px,transparent_9px)]" />
    <span className="tuft-lettering relative text-[1.45rem] leading-none text-[#fff3df]">{value}</span>
  </span>
);

