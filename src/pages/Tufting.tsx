import React from 'react';
import { motion } from 'framer-motion';
// Fuente display de las páginas artísticas: al importarse acá, Vite la
// emite solo en este chunk (no pesa en home/desarrollo/portfolio).
import '@fontsource-variable/fraunces/index.css';
import { ContactCTA } from '../components/ContactCTA';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { tuftingLines, tuftingPieces, type PieceStatus } from '../data/tufting';
import { usePageMeta } from '../hooks/usePageMeta';
import { cn } from '../utils/cn';

const statusLabels: Record<PieceStatus, { label: string; className: string }> = {
  disponible: { label: 'Disponible', className: 'bg-accent text-on-accent' },
  vendida: { label: 'Vendida', className: 'bg-primary/10 text-secondary' },
  encargo: { label: 'A pedido', className: 'border border-accent text-accent' },
};

export const Tufting: React.FC = () => {
  usePageMeta({
    title: 'Tufting — Alfombras y Tapices Artesanales | Artifex — Ramiro Escobar',
    description:
      'Piezas de tufting hechas a mano: alfombras y tapices por encargo para hogar o negocio, colaboraciones con artistas y piezas únicas disponibles.',
    canonicalPath: '/servicios/tufting',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      data-theme="tufting"
      className="min-h-screen w-full bg-tufting-warm py-12 px-4 sm:px-6 lg:px-8 text-primary"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-20">
        {/* Hero */}
        <section className="py-12 md:py-20 text-center max-w-3xl mx-auto">
          <span className="text-accent uppercase tracking-widest text-sm font-bold mb-4 block">
            Tufting
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold mb-6 leading-tight">
            Tejido a mano, <br />
            <span className="text-accent italic">hilo por hilo.</span>
          </h1>
          <p className="text-lg text-secondary leading-relaxed">
            Alfombras y tapices únicos hechos con pistola de tufting: piezas por encargo para tu
            casa o tu negocio, colaboraciones con artistas y piezas listas para llevar.
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

        {/* Piezas */}
        <section>
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-semibold mb-3">Piezas</h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Algunas piezas hechas y ejemplos de encargos. Cada una es única: si querés algo
              parecido, lo diseñamos a tu medida.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tuftingPieces.map((piece, index) => {
              const status = statusLabels[piece.status];
              return (
                <motion.div
                  key={piece.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm"
                >
                  {piece.image ? (
                    <img
                      src={piece.image}
                      alt={`Pieza de tufting: ${piece.title}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <ImagePlaceholder className="border-0 rounded-none" />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="font-display text-lg font-semibold">{piece.title}</h3>
                      <span
                        className={cn(
                          'text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap',
                          status.className
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-secondary mb-1">{piece.size}</p>
                    <p className="text-xs text-secondary mb-3">{piece.materials}</p>
                    {piece.price && piece.status === 'disponible' && (
                      <p className="text-accent font-bold">{piece.price}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
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
        </section>
      </div>
    </motion.div>
  );
};
