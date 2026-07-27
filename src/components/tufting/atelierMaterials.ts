import type React from 'react';

// Materiales base compartidos por el atelier de tufting.
// Nacen del Bastidor y se exportan para que toda la sección hable el mismo idioma.
export const woodFrame: React.CSSProperties = {
  backgroundColor: '#a97d59',
  backgroundImage:
    'linear-gradient(135deg, rgba(255,247,232,0.34) 0%, rgba(255,247,232,0.08) 18%, transparent 34%),' +
    'linear-gradient(315deg, rgba(51,33,22,0.34) 0%, rgba(51,33,22,0.12) 24%, transparent 44%),' +
    'radial-gradient(ellipse at 24% 32%, rgba(89,54,32,0.26) 0 7%, rgba(158,104,66,0.15) 8% 13%, transparent 15%),' +
    'radial-gradient(ellipse at 72% 68%, rgba(76,45,27,0.18) 0 5%, rgba(191,136,91,0.12) 7% 11%, transparent 13%),' +
    'linear-gradient(96deg, #c49a72 0%, #b68860 28%, #a27651 55%, #8d6447 78%, #7c573f 100%)',
  backgroundSize: '100% 100%, 100% 100%, 18rem 9rem, 21rem 11rem, 100% 100%',
  backgroundPosition: '0 0, 0 0, 12% 18%, 78% 72%, 0 0',
  boxShadow:
    '0 30px 58px -22px rgba(43, 35, 32, 0.55),' +
    '0 10px 22px -16px rgba(43, 35, 32, 0.4),' +
    'inset 0 2px 3px rgba(255, 246, 235, 0.72),' +
    'inset 3px 0 4px rgba(255, 246, 235, 0.28),' +
    'inset -4px -5px 9px rgba(54, 34, 22, 0.46),' +
    'inset 0 0 0 1px rgba(63, 39, 25, 0.22)',
};

export const woodGrain: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(96deg, rgba(56,33,20,0.16) 0 1px, transparent 1px 7px, rgba(255,238,212,0.10) 8px 10px, transparent 10px 19px),' +
    'repeating-linear-gradient(101deg, transparent 0 13px, rgba(70,43,27,0.13) 14px 16px, transparent 17px 29px),' +
    'linear-gradient(90deg, transparent 0%, rgba(255,246,225,0.13) 12%, transparent 30%, rgba(65,39,25,0.12) 72%, transparent 100%),' +
    'radial-gradient(ellipse at 25% 35%, transparent 0 18%, rgba(56,33,20,0.18) 20% 23%, transparent 26%),' +
    'radial-gradient(ellipse at 72% 67%, transparent 0 16%, rgba(56,33,20,0.14) 19% 22%, transparent 25%)',
  backgroundSize: '100% 100%, 13rem 100%, 100% 100%, 18rem 9rem, 21rem 11rem',
  backgroundBlendMode: 'multiply, multiply, soft-light, multiply, multiply',
  opacity: 0.86,
};

export const clothBackground: React.CSSProperties = {
  backgroundColor: 'var(--color-base)',
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(43,35,32,0.065) 0 1px, transparent 1px 5px),' +
    'repeating-linear-gradient(90deg, rgba(43,35,32,0.052) 0 1px, transparent 1px 5px),' +
    'repeating-linear-gradient(27deg, transparent 0 11px, rgba(255,255,255,0.18) 12px, transparent 13px),' +
    'radial-gradient(ellipse at 18% 0%, rgba(194,94,76,0.07), transparent 58%)',
  boxShadow:
    'inset 0 0 30px rgba(43, 35, 32, 0.17), inset 2px 2px 3px rgba(255, 255, 255, 0.45), inset -2px -3px 5px rgba(43, 35, 32, 0.16)',
};

export const atelierFeltPanelClass =
  'atelier-felt atelier-stitch relative overflow-hidden rounded-[2rem] border border-white/70 text-primary shadow-[0_24px_58px_rgba(112,70,52,0.16),4px_9px_22px_rgba(112,70,52,0.10),-2px_-2px_10px_rgba(255,255,255,0.58),inset_0_1px_0_rgba(255,255,255,0.94),inset_0_-18px_34px_rgba(194,94,76,0.07)]';

export const atelierInteractiveClass =
  'transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_30px_64px_rgba(112,70,52,0.2),0_9px_22px_rgba(112,70,52,0.12),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-18px_34px_rgba(194,94,76,0.09)]';

export const atelierPillClass =
  'atelier-felt relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/25 px-5 py-3 text-sm font-bold text-primary shadow-[0_11px_24px_rgba(112,70,52,0.14),2px_4px_10px_rgba(112,70,52,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] transition-all duration-300 before:pointer-events-none before:absolute before:inset-1.5 before:rounded-full before:border before:border-dashed before:border-accent/45 hover:-translate-y-0.5 hover:border-accent/55 hover:bg-[color:var(--color-base)] hover:text-accent hover:shadow-[0_14px_28px_rgba(112,70,52,0.16)]';

export const atelierPrimaryTagClass =
  'atelier-tag relative inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-on-accent shadow-[0_16px_34px_rgba(194,94,76,0.26),inset_0_2px_4px_rgba(255,255,255,0.34),inset_0_-9px_18px_rgba(43,35,32,0.16)] transition-all duration-300 before:pointer-events-none before:absolute before:inset-1.5 before:rounded-full before:border before:border-dashed before:border-[color:rgba(253,249,243,0.72)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_20px_40px_rgba(194,94,76,0.34)]';
