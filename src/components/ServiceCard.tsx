import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '../utils/cn';
import type { ServiceSummary } from '../data/services';

interface ServiceCardProps {
  service: ServiceSummary;
  delay?: number;
}

// Card del hub: gracias al data-theme, cada servicio se previsualiza
// con su propia paleta dentro de la home blueprint.
export const ServiceCard: React.FC<ServiceCardProps> = ({ service, delay = 0 }) => {
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      data-theme={service.theme}
      className="h-full"
    >
      <Link
        to={service.href}
        className={cn(
          'group flex flex-col h-full p-8 bg-base border border-line transition-all duration-300 hover:border-accent hover:-translate-y-1',
          service.rounded && 'rounded-2xl'
        )}
      >
        <div
          className={cn(
            'w-12 h-12 flex items-center justify-center bg-surface border border-line text-accent mb-6 group-hover:bg-accent group-hover:text-on-accent transition-colors',
            service.rounded && 'rounded-full'
          )}
        >
          <Icon size={22} />
        </div>

        <p className="text-xs text-accent uppercase tracking-widest mb-2">{service.tagline}</p>
        <h3 className="text-2xl font-bold text-primary mb-4">{service.title}</h3>
        <p className="text-sm text-secondary leading-relaxed flex-grow">{service.description}</p>

        <span className="inline-flex items-center gap-2 text-sm font-bold text-accent mt-8">
          Ver servicio
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
};
