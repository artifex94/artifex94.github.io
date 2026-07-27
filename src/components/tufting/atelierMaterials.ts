import type React from 'react';

// Materiales base compartidos por el atelier de tufting.
// Nacen del Bastidor y se exportan para que toda la sección hable el mismo idioma.
export const woodFrame: React.CSSProperties = {
  backgroundColor: '#a97d59',
  backgroundImage:
    'linear-gradient(135deg, rgba(255,247,232,0.26) 0%, transparent 32%),' +
    'linear-gradient(315deg, rgba(51,33,22,0.26) 0%, transparent 42%),' +
    'linear-gradient(96deg, #c49a72 0%, #b68860 28%, #a27651 55%, #8d6447 78%, #7c573f 100%)',
  backgroundSize: '100% 100%, 100% 100%, 100% 100%',
  backgroundPosition: '0 0, 0 0, 0 0',
  boxShadow:
    '0 18px 24px -18px rgba(43, 35, 32, 0.52),' +
    'inset 0 1px 3px rgba(255, 246, 235, 0.62)',
};

export const woodGrain: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(96deg, rgba(56,33,20,0.14) 0 1px, transparent 1px 12px),' +
    'linear-gradient(90deg, transparent 0%, rgba(255,246,225,0.12) 14%, transparent 34%, rgba(65,39,25,0.10) 72%, transparent 100%)',
  backgroundSize: '100% 100%, 100% 100%',
  backgroundBlendMode: 'multiply, soft-light',
  opacity: 0.86,
};

export const clothBackground: React.CSSProperties = {
  backgroundColor: 'var(--color-base)',
  backgroundImage:
    'radial-gradient(ellipse at 18% 0%, rgba(194,94,76,0.065), transparent 58%)',
  boxShadow:
    'inset 0 0 20px rgba(43, 35, 32, 0.14), inset 0 1px 2px rgba(255, 255, 255, 0.42)',
};

export const atelierFeltPanelClass =
  'atelier-felt atelier-stitch relative overflow-hidden rounded-[2rem] border border-white/70 text-primary shadow-[0_20px_28px_rgba(112,70,52,0.16),0_3px_8px_rgba(43,35,32,0.06),inset_0_1px_0_rgba(255,255,255,0.92)]';

export const atelierInteractiveClass =
  'transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_22px_28px_rgba(112,70,52,0.18),0_4px_10px_rgba(43,35,32,0.07)]';

export const atelierPillClass =
  'atelier-felt relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/25 px-5 py-3 text-sm font-bold text-primary shadow-[0_12px_22px_rgba(112,70,52,0.15),0_2px_6px_rgba(43,35,32,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 before:pointer-events-none before:absolute before:inset-1.5 before:rounded-full before:border before:border-dashed before:border-accent/45 hover:-translate-y-0.5 hover:border-accent/55 hover:bg-[color:var(--color-base)] hover:text-accent hover:shadow-[0_12px_20px_rgba(112,70,52,0.14)]';

export const atelierPrimaryTagClass =
  'atelier-tag relative inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-on-accent shadow-[0_12px_22px_rgba(194,94,76,0.22),inset_0_1px_3px_rgba(255,255,255,0.3)] transition-all duration-300 before:pointer-events-none before:absolute before:inset-1.5 before:rounded-full before:border before:border-dashed before:border-[color:rgba(253,249,243,0.72)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_14px_22px_rgba(194,94,76,0.28)]';
