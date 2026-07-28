import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
// Misma fuente display que el resto de las páginas artesanales. Al importarse
// acá, Vite la emite en este chunk y no pesa en el resto del sitio.
import '@fontsource-variable/fraunces/index.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import { CalculatorStepper } from '../components/tufting/CalculatorStepper';
import { AtelierFeltPanel, AtelierWoodFrame } from '../components/tufting/Atelier';
import { atelierFeltPanelClass, atelierPillClass } from '../components/tufting/atelierMaterials';
import { FileteadoDivider } from '../components/tufting/Fileteado';
import { usePageMeta } from '../hooks/usePageMeta';
import { breadcrumb } from '../data/structuredData';
import { cn } from '../utils/cn';

export const TuftingCalculadora: React.FC = () => {
  const reduceMotion = useReducedMotion();
  // El cartel de entrada se retira al primer gesto de trabajo en el taller,
  // para que el bastidor quede limpio.
  const [heroDismissed, setHeroDismissed] = React.useState(false);
  const dismissHero = React.useCallback(() => setHeroDismissed(true), []);

  usePageMeta({
    title: 'Calculá el precio de tu alfombra de tufting | Artifex',
    description:
      'Subí tu diseño, elegí forma, medidas y colores, y mirá al instante cuánto sale tu alfombra artesanal de tufting hecha a mano.',
    canonicalPath: '/servicios/tufting/calculadora',
    jsonLd: breadcrumb([
      { name: 'Inicio', path: '/' },
      { name: 'Tufting', path: '/servicios/tufting' },
      { name: 'Calculadora', path: '/servicios/tufting/calculadora' },
    ]),
  });

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
      data-theme="tufting"
      className="min-h-screen w-full overflow-x-hidden bg-atelier-cloth px-4 pb-8 pt-3 text-primary sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-7 lg:gap-10">
        {/* El cartel de entrada flota POR ENCIMA del taller (overlay fijo): no
            empuja el layout al aparecer ni fuerza reacomodos al retirarse. */}
        <AnimatePresence>
          {!heroDismissed && (
            <motion.div
              key="hero-cartel"
              role="dialog"
              aria-modal="true"
              aria-label="Bienvenida al taller de tufting"
              className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(43,35,32,0.38)] px-4 py-8 backdrop-blur-[3px] sm:items-center"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' } }}
              onPointerDown={dismissHero}
            >
              <motion.div
                className="w-full max-w-3xl"
                initial={reduceMotion ? false : { y: 16, scale: 0.98 }}
                animate={{ y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { y: -12, scale: 0.98 }}
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 130, damping: 20 }}
              >
                <AtelierWoodFrame className="rounded-[2.6rem] p-2.5 sm:p-3.5">
                  <div className={cn(atelierFeltPanelClass, 'px-5 py-8 text-center sm:px-10 md:py-10')}>
                    <div className="relative z-10">
                      <span className="text-accent uppercase tracking-widest text-xs font-bold mb-3 block">
                        El taller
                      </span>
                      <p className="font-display text-3xl font-semibold leading-tight mb-4 md:text-5xl">
                        Tu alfombra empieza <span className="text-accent italic">en este bastidor</span>
                      </p>
                      <p className="text-secondary leading-relaxed max-w-2xl mx-auto">
                        Prendé tu diseño, dale forma, elegí las lanas y mirala tomar cuerpo — el precio aparece
                        solo. Sin esperas y sin compromiso.
                      </p>
                      <FileteadoDivider className="mx-auto mt-7 max-w-sm" />
                      <p className="mt-5 text-xs uppercase tracking-widest text-secondary">
                        Tocá donde sea para empezar
                      </p>
                    </div>
                  </div>
                </AtelierWoodFrame>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className="sr-only">Tu alfombra empieza en este bastidor</h1>
        <div className="flex justify-center sm:justify-start">
          <Link
            to="/servicios/tufting"
            className={cn(atelierPillClass, 'min-h-0 px-4 py-2 text-sm text-secondary')}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Volver a Tufting
          </Link>
        </div>

        <section
          className="relative"
          aria-label="Calculadora de tufting"
          onPointerDownCapture={dismissHero}
          onFocusCapture={dismissHero}
        >
          <CalculatorStepper />
        </section>

        <AtelierFeltPanel className="mx-auto max-w-3xl px-5 py-4 text-center">
          <p className="relative z-10 text-xs text-secondary leading-relaxed">
            El presupuesto vale para las medidas que cargaste. Las piezas se tejen a mano: el color
            y la textura finales pueden variar apenas respecto de la pantalla — esa pequeña
            diferencia es la firma de lo hecho a mano.
          </p>
        </AtelierFeltPanel>
      </div>
    </motion.div>
  );
};
