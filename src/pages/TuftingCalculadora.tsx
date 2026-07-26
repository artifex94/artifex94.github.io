import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
// Misma fuente display que el resto de las páginas artesanales. Al importarse
// acá, Vite la emite en este chunk y no pesa en el resto del sitio.
import '@fontsource-variable/fraunces/index.css';
import { CalculatorStepper } from '../components/tufting/CalculatorStepper';
import { usePageMeta } from '../hooks/usePageMeta';
import { breadcrumb } from '../data/structuredData';

export const TuftingCalculadora: React.FC = () => {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      data-theme="tufting"
      className="min-h-screen w-full bg-tufting-warm px-4 py-8 text-primary sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-7 lg:gap-10">
        <header className="text-center">
          <Link
            to="/servicios/tufting"
            className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Volver a Tufting
          </Link>
          <span className="text-accent uppercase tracking-widest text-xs font-bold mb-3 block">
            El taller
          </span>
          <h1 className="font-display text-3xl font-semibold leading-tight mb-4 md:text-5xl">
            Tu alfombra empieza <span className="text-accent italic">en este bastidor</span>
          </h1>
          <p className="text-secondary leading-relaxed max-w-2xl mx-auto">
            Prendé tu diseño, dale forma, elegí las lanas y mirala tomar cuerpo — el precio aparece
            solo. Sin esperas y sin compromiso.
          </p>
        </header>

        <CalculatorStepper />

        <p className="text-xs text-secondary text-center leading-relaxed">
          El presupuesto vale para las medidas que cargaste. Las piezas se tejen a mano: el color
          y la textura finales pueden variar apenas respecto de la pantalla — esa pequeña
          diferencia es la firma de lo hecho a mano.
        </p>
      </div>
    </motion.div>
  );
};
