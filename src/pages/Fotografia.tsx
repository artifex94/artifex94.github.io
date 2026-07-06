import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
// Fuente display de las páginas artísticas: al importarse acá, Vite la
// emite solo en este chunk (no pesa en home/desarrollo/portfolio).
import '@fontsource-variable/fraunces/index.css';
import { GalleryGrid } from '../components/gallery/GalleryGrid';
import { PackageCard } from '../components/PackageCard';
import { ContactCTA } from '../components/ContactCTA';
import { galleryPhotos, photoCategories, photoPackages } from '../data/photography';
import { usePageMeta } from '../hooks/usePageMeta';
import { serviceSchemas, breadcrumb } from '../data/structuredData';

export const Fotografia: React.FC = () => {
  usePageMeta({
    title: 'Fotografía — Eventos, Retratos y Producto | Artifex — Ramiro Escobar',
    description:
      'Fotografía profesional: cobertura de eventos culturales, retratos y books, fotografía de producto para marcas y obra de paisaje en Victoria, Entre Ríos y la región.',
    canonicalPath: '/servicios/fotografia',
    jsonLd: [
      serviceSchemas.fotografia,
      breadcrumb([
        { name: 'Inicio', path: '/' },
        { name: 'Fotografía', path: '/servicios/fotografia' },
      ]),
    ],
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      data-theme="fotografia"
      className="min-h-screen w-full bg-gallery-photo py-12 px-4 sm:px-6 lg:px-8 text-primary"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-20">
        {/* Hero */}
        <section className="py-12 md:py-20 text-center max-w-3xl mx-auto">
          <span className="text-accent uppercase tracking-widest text-sm font-bold mb-4 block">
            Fotografía
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold mb-6 leading-tight">
            La luz cuenta la historia. <br />
            <span className="text-accent italic">Yo la escribo con vos.</span>
          </h1>
          <p className="text-lg text-secondary leading-relaxed font-sans">
            Cobertura de eventos culturales, retratos y books, fotografía de producto para marcas
            y obra de paisaje. Cada encargo se trabaja de principio a fin: toma, curaduría y
            edición.
          </p>
        </section>

        {/* Qué hago */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {photoCategories.map((category, index) => (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 bg-surface/60 border border-line"
            >
              <h3 className="font-display text-xl font-semibold mb-3">{category.label}</h3>
              <p className="text-sm text-secondary leading-relaxed">{category.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* Galería */}
        <section>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-semibold mb-3">Trabajo seleccionado</h2>
            <p className="text-secondary">
              Un paneo general por el trabajo hecho hasta ahora. Tocá cualquier foto para
              ampliarla.
            </p>
          </div>
          <GalleryGrid photos={galleryPhotos} />
        </section>

        {/* Paquetes */}
        <section>
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-semibold mb-3">Servicios y paquetes</h2>
            <p className="text-secondary">
              Cada trabajo es distinto: estos paquetes son el punto de partida de la conversación.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {photoPackages.map((pkg) => (
              <PackageCard key={pkg.name} {...pkg} service="fotografia" />
            ))}
          </div>
        </section>

        {/* Cross-link con desarrollo */}
        <section className="border border-dashed border-line p-8 text-center">
          <h3 className="font-display text-2xl font-semibold mb-3">
            ¿Tenés una tienda online (o querés una)?
          </h3>
          <p className="text-secondary mb-6 max-w-2xl mx-auto">
            Combino la fotografía de producto con mi servicio de desarrollo e-commerce: tu
            catálogo fotografiado, optimizado y publicado en una tienda que carga en
            milisegundos.
          </p>
          <Link
            to="/servicios/desarrollo"
            className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline"
          >
            Conocer el servicio de desarrollo <ArrowRight size={16} />
          </Link>
        </section>

        {/* CTA de cierre */}
        <section className="mb-16 text-center">
          <h2 className="font-display text-3xl font-semibold mb-3">Reservá tu fecha</h2>
          <p className="text-secondary mb-8">
            Contame qué necesitás fotografiar y te paso disponibilidad y presupuesto.
          </p>
          <ContactCTA service="fotografia" emailSubject="Consulta - Fotografía" />
        </section>
      </div>
    </motion.div>
  );
};
