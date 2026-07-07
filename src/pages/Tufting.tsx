import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
// Fuente display de las páginas artísticas: al importarse acá, Vite la
// emite solo en este chunk (no pesa en home/desarrollo/portfolio).
import '@fontsource-variable/fraunces/index.css';
import { ContactCTA } from '../components/ContactCTA';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { tuftingLines, tuftingCategories } from '../data/tufting';
import { usePageMeta } from '../hooks/usePageMeta';
import { breadcrumb } from '../data/structuredData';

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
      <div className="max-w-6xl mx-auto flex flex-col gap-20">
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
            Alfombras artesanales y tapices únicos hechos con pistola de tufting: piezas por
            encargo para tu casa o tu negocio, colaboraciones con artistas y piezas listas para
            llevar.
          </p>
        </section>

        {/* Líneas de servicio */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tuftingLines.map((line, index) => {
            const Icon = line.icon;
            return (
              <motion.div
                key={line.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 bg-surface border border-line rounded-2xl shadow-sm"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-accent text-on-accent rounded-full mb-6">
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{line.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{line.desc}</p>
              </motion.div>
            );
          })}
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
                className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm"
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={`Pieza de tufting: ${category.title}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <ImagePlaceholder
                    label="Producto en proceso"
                    elegantLabel
                    className="border-0 rounded-none"
                  />
                )}
                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold mb-2">{category.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">{category.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Proceso breve */}
        <section className="border border-dashed border-line rounded-2xl p-8 md:p-12">
          <h2 className="font-display text-2xl font-semibold mb-8 text-center">
            ¿Cómo funciona un encargo?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-accent font-bold text-3xl mb-2">1</p>
              <p className="text-sm text-secondary">
                Me contás tu idea: medidas, colores, espacio donde va. Puede ser un boceto, una
                foto o solo una intuición.
              </p>
            </div>
            <div>
              <p className="text-accent font-bold text-3xl mb-2">2</p>
              <p className="text-sm text-secondary">
                Te paso el diseño digital y el presupuesto. Ajustamos juntos hasta que quede como
                lo imaginás.
              </p>
            </div>
            <div>
              <p className="text-accent font-bold text-3xl mb-2">3</p>
              <p className="text-sm text-secondary">
                Tejo tu pieza a mano y te la entrego terminada, con base y bordes rematados.
              </p>
            </div>
          </div>
        </section>

        {/* CTA de cierre */}
        <section className="mb-16 text-center">
          <h2 className="font-display text-3xl font-semibold mb-3">¿Tejemos algo juntos?</h2>
          <p className="text-secondary mb-8">
            Escribime con tu idea y te respondo con propuesta y presupuesto.
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
