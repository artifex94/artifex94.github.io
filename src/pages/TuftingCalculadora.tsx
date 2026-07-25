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
      className="min-h-screen w-full bg-tufting-warm py-12 px-4 sm:px-6 lg:px-8 text-primary"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        <header className="text-center">
          <Link
            to="/servicios/tufting"
            className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Volver a Tufting
          </Link>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4 leading-tight">
            ¿Cuánto sale <span className="text-accent italic">tu alfombra</span>?
          </h1>
          <p className="text-secondary leading-relaxed max-w-2xl mx-auto">
            Subí tu diseño, decime de qué tamaño la querés y te digo el precio al toque. Sin
            esperar, sin compromiso.
          </p>
        </header>

        <CalculatorStepper />

        <p className="text-xs text-secondary text-center leading-relaxed">
          El presupuesto es para las medidas que cargaste. Las piezas se tejen a mano, así que el
          color y la textura finales pueden variar un poco respecto de la pantalla.
        </p>
      </div>
    </motion.div>
  );
};
