import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
// Fuente display de las páginas artísticas: al importarse acá, Vite la
// emite solo en este chunk (no pesa en home/desarrollo/portfolio).
import '@fontsource-variable/fraunces/index.css';
import { ContactCTA } from '../components/ContactCTA';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { puffyCardClass, puffyInteractiveClass, WoolStitch } from '../components/tufting/PuffySurface';
import { tuftingLines, tuftingCategories } from '../data/tufting';
import { usePageMeta } from '../hooks/usePageMeta';
import { breadcrumb } from '../data/structuredData';
import { cn } from '../utils/cn';

export const Tufting: React.FC = () => {
  usePageMeta({
    title: 'Tufting: Alfombras Artesanales en Victoria | Artifex',
    description:
      'Alfombras artesanales y tapices de tufting hechos a mano: piezas por encargo para hogar o negocio, colaboraciones con artistas y piezas únicas disponibles.',
    canonicalPath: '/servicios/tufting',
    // El nodo Service vive en el grafo base (structuredData.ts); acá solo el
    // breadcrumb propio de la página para no duplicar el @id #service-tufting.
    jsonLd: breadcrumb([
      { name: 'Inicio', path: '/' },
      { name: 'Tufting', path: '/servicios/tufting' },
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
      <div className="max-w-6xl mx-auto flex flex-col gap-16 md:gap-20">
        {/* Hero */}
        <section className="py-12 md:py-20 text-center max-w-3xl mx-auto">
          <span className="text-accent uppercase tracking-widest text-sm font-bold mb-4 block">
            Tufting · Alfombras y tapices artesanales · Victoria, Entre Ríos
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold mb-6 leading-tight">
            Tejido a mano, <br />
            <span className="text-accent italic">hilo por hilo.</span>
          </h1>
          <p className="text-lg text-secondary leading-relaxed">
            Alfombras artesanales y tapices únicos hechos con pistola de tufting: encargá tu pieza,
            proponé una colaboración artística o elegí una obra lista para llevar.
          </p>
          <WoolStitch className="mx-auto mt-8 max-w-sm" />
        </section>

        {/* Líneas accionables */}
        <section aria-labelledby="tufting-caminos">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-accent">
              <Sparkles size={14} aria-hidden="true" /> Elegí por dónde arrancar
            </span>
            <h2 id="tufting-caminos" className="font-display text-3xl font-semibold mt-5 mb-3">
              Tres caminos para darle forma a la lana
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Cada tarjeta te lleva al próximo paso: bastidor para presupuestar, formulario para
              obras compartidas o tienda de piezas únicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {tuftingLines.map((line, index) => {
              const Icon = line.icon;
              return (
                <motion.div
                  key={line.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    to={line.href}
                    className={cn(
                      puffyCardClass,
                      puffyInteractiveClass,
                      'group flex h-full min-h-[20rem] flex-col p-7 focus-visible:rounded-[2rem]',
                    )}
                  >
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
                    <div className="relative mb-7 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-accent text-on-accent shadow-[0_16px_30px_rgba(194,94,76,0.24),inset_0_2px_4px_rgba(255,255,255,0.35)]">
                      <Icon size={26} aria-hidden="true" />
                    </div>
                    <h3 className="relative font-display text-2xl font-semibold mb-3">
                      {line.title}
                    </h3>
                    <p className="relative text-sm text-secondary leading-relaxed flex-1">
                      {line.desc}
                    </p>
                    <div className="relative mt-7">
                      <WoolStitch className="mb-4 opacity-80" />
                      <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-accent transition-colors group-hover:bg-accent">
                        {line.cta}
                        <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Categorías */}
        <section>
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-semibold mb-3">Qué tejo</h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Tres formatos para arrancar. Contame tu idea y la armamos juntos, a tu medida.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tuftingCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(puffyCardClass, 'p-3')}
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={`Pieza de tufting: ${category.title}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-square object-cover rounded-[1.6rem]"
                  />
                ) : (
                  <ImagePlaceholder
                    label="Producto en proceso"
                    elegantLabel
                    className="border-0 rounded-[1.6rem]"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold mb-2">{category.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">{category.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Proceso breve */}
        <section className={cn(puffyCardClass, 'p-8 md:p-12')}>
          <h2 className="font-display text-2xl font-semibold mb-8 text-center">
            Si la pieza es por encargo, el proceso es simple
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              'Me contás tu idea: medidas, colores y dónde va. Puede ser boceto, foto o intuición.',
              'Te paso diseño digital y presupuesto. Ajustamos juntos hasta que quede como lo imaginás.',
              'Tejo la pieza a mano y la entrego terminada, con base y bordes rematados.',
            ].map((step, index) => (
              <div key={step}>
                <p className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 font-display text-2xl font-bold text-accent shadow-[inset_0_2px_8px_rgba(255,255,255,0.8)]">
                  {index + 1}
                </p>
                <p className="text-sm text-secondary leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA de cierre */}
        <section className="mb-16 text-center">
          <h2 className="font-display text-3xl font-semibold mb-3">¿Tejemos algo juntos?</h2>
          <p className="text-secondary mb-8">
            Escribime y vemos juntos si conviene encargo, colaboración o una pieza disponible.
          </p>
          <ContactCTA service="tufting" emailSubject="Consulta - Tufting" rounded />
          <p className="text-sm text-secondary mt-6">
            ¿Querés fotos profesionales de tus piezas?{' '}
            <Link to="/servicios/fotografia" className="text-accent hover:underline">
              Conocé el servicio de fotografía
            </Link>
          </p>
        </section>
      </div>
    </motion.div>
  );
};
