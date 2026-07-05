import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard';
import { ContactCTA } from '../components/ContactCTA';
import { Typewriter } from '../components/Typewriter';
import { services } from '../data/services';
import { data } from '../data/data';
import { usePageMeta } from '../hooks/usePageMeta';

export const Home: React.FC = () => {
  usePageMeta({
    title: 'Artifex — Desarrollo web, Fotografía y Tufting | Ramiro Escobar',
    description:
      'Artifex es el taller de Ramiro Escobar: desarrollo de sitios y sistemas web a medida, fotografía de eventos, retratos y producto, y piezas de tufting artesanales.',
    canonicalPath: '/',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen w-full bg-blueprint-grid py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        {/* Hero del hub */}
        <section className="py-12 md:py-20 text-center max-w-3xl mx-auto flex flex-col items-center">
          <span className="text-accent uppercase tracking-widest text-sm font-bold mb-4">
            // {data.personal.name}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            <Typewriter text="Un taller, tres oficios." speed="fast" />
          </h1>
          <p className="text-lg md:text-xl text-secondary leading-relaxed">
            Código, luz y lana. Construyo tiendas online que venden, fotografío eventos, personas
            y productos, y tejo piezas de tufting únicas. Elegí el servicio que estás buscando.
          </p>
        </section>

        {/* Cards de servicios: cada una con la paleta de su rubro */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} delay={0.1 + index * 0.15} />
          ))}
        </section>

        {/* Link secundario al portfolio */}
        <section className="text-center">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-sm text-secondary hover:text-accent transition-colors font-mono"
          >
            ¿Buscás mi perfil técnico? Ver portfolio completo
            <ArrowRight size={14} />
          </Link>
        </section>

        {/* CTA general */}
        <section className="mb-16 text-center border-t border-dashed border-line pt-12">
          <h2 className="text-2xl font-bold text-white mb-3">¿No sabés por dónde empezar?</h2>
          <p className="text-secondary mb-8">
            Contame qué necesitás y lo resolvemos juntos.
          </p>
          <ContactCTA service="general" emailSubject="Consulta desde artifex.click" />
        </section>
      </div>
    </motion.div>
  );
};
