import React from 'react';
import { motion } from 'framer-motion';
import { usePageMeta } from '../hooks/usePageMeta';
import { breadcrumb } from '../data/structuredData';
import { HeroBuild } from '../components/dev/HeroBuild';
import { SegmentGrid } from '../components/dev/SegmentGrid';
import { InvestmentSection } from '../components/dev/InvestmentSection';
import { ProcesoTimeline } from '../components/dev/ProcesoTimeline';
import { WhyMe } from '../components/dev/WhyMe';
import { FinalCTA } from '../components/dev/FinalCTA';
import { MobileWhatsAppFab } from '../components/dev/MobileWhatsAppFab';

// The development showcase page: six sections that assemble themselves as you
// scroll and interact. The craft of the motion is the sales argument.
export const Desarrollo: React.FC = () => {
  usePageMeta({
    title: 'Desarrollo Web y Sistemas a Medida | Artifex',
    description:
      'Construyo sitios y sistemas a medida para tu negocio: desde una web simple hasta un panel de gestión completo. Precios claros, proceso ordenado y acompañamiento continuo.',
    canonicalPath: '/servicios/desarrollo',
    // El nodo Service vive en el grafo base (structuredData.ts); acá solo el
    // breadcrumb propio de la página para no duplicar el @id #service-desarrollo.
    jsonLd: breadcrumb([
      { name: 'Inicio', path: '/' },
      { name: 'Desarrollo Web', path: '/servicios/desarrollo' },
    ]),
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full bg-blueprint-grid px-4 py-10 font-sans text-primary sm:px-6 md:py-16 lg:px-8"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-16 md:gap-24">
        <HeroBuild />
        <SegmentGrid />
        <InvestmentSection />
        <ProcesoTimeline />
        <WhyMe />
        <FinalCTA />
      </div>
      <MobileWhatsAppFab />
    </motion.div>
  );
};
