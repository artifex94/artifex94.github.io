import type React from 'react';

// Materiales base compartidos por el atelier de tufting.
// Nacen del Bastidor y se exportan para que toda la sección hable el mismo idioma.
export const woodFrame: React.CSSProperties = {
  background:
    'linear-gradient(150deg, #bd9573 0%, #ab8260 42%, #916f55 78%, #82624c 100%)',
  boxShadow:
    '0 24px 48px -20px rgba(43, 35, 32, 0.45),' +
    'inset 0 2px 3px rgba(255, 246, 235, 0.55),' +
    'inset 0 -3px 6px rgba(60, 42, 30, 0.4)',
};

export const woodGrain: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(93deg, rgba(43,35,32,0.09) 0 2px, transparent 2px 6px,' +
    ' rgba(255,246,235,0.05) 6px 8px, transparent 8px 13px)',
};

export const clothBackground: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(43,35,32,0.055) 0 1px, transparent 1px 5px),' +
    'repeating-linear-gradient(90deg, rgba(43,35,32,0.055) 0 1px, transparent 1px 5px)',
  boxShadow:
    'inset 0 0 28px rgba(43, 35, 32, 0.16), inset 0 0 3px rgba(43, 35, 32, 0.3)',
};

export const atelierFeltPanelClass =
  'atelier-felt atelier-stitch relative overflow-hidden rounded-[2rem] border border-white/70 text-primary shadow-[0_22px_54px_rgba(112,70,52,0.14),0_6px_18px_rgba(112,70,52,0.09),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-18px_34px_rgba(194,94,76,0.07)]';

export const atelierInteractiveClass =
  'transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_30px_64px_rgba(112,70,52,0.2),0_9px_22px_rgba(112,70,52,0.12),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-18px_34px_rgba(194,94,76,0.09)]';

export const atelierPillClass =
  'atelier-felt relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/25 px-5 py-3 text-sm font-bold text-primary shadow-[0_10px_22px_rgba(112,70,52,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 before:pointer-events-none before:absolute before:inset-1.5 before:rounded-full before:border before:border-dashed before:border-accent/45 hover:-translate-y-0.5 hover:border-accent/55 hover:bg-[color:var(--color-base)] hover:text-accent hover:shadow-[0_14px_28px_rgba(112,70,52,0.16)]';

export const atelierPrimaryTagClass =
  'atelier-tag relative inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-on-accent shadow-[0_16px_34px_rgba(194,94,76,0.26),inset_0_2px_4px_rgba(255,255,255,0.34),inset_0_-9px_18px_rgba(43,35,32,0.16)] transition-all duration-300 before:pointer-events-none before:absolute before:inset-1.5 before:rounded-full before:border before:border-dashed before:border-[color:rgba(253,249,243,0.72)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_20px_40px_rgba(194,94,76,0.34)]';
