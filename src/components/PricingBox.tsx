import React from 'react';
import { type PricingTier } from '../data/business';
import { buildMailto } from '../data/contact';

export const PricingBox: React.FC<PricingTier> = ({
  name,
  target,
  setupPrice,
  retainerPrice,
  features,
  isPopular
}) => {
  const proposalMailto = buildMailto(`Solicitud de Propuesta - Plan ${name}`);

  return (
    <div className={`relative flex flex-col p-8 bg-surface border ${isPopular ? 'border-accent shadow-[0_0_20px_rgba(255,107,0,0.15)] scale-105 z-10' : 'border-line'} transition-transform duration-300 hover:border-accent group`}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-accent text-black text-xs font-bold uppercase tracking-widest">
          Recomendado
        </div>
      )}
      <h4 className="text-2xl font-bold text-primary border-b border-line pb-4 mb-4">{name}</h4>
      <p className="text-sm text-secondary mb-8 min-h-[40px] leading-relaxed">{target}</p>

      <div className="flex flex-col gap-4 mb-8 flex-grow">
        <div className="bg-base p-5 border border-line group-hover:border-accent/30 transition-colors">
          <span className="block text-xs text-accent uppercase tracking-wider mb-2">Setup Inicial</span>
          <span className="text-3xl font-bold text-primary">{setupPrice}</span>
        </div>
        <div className="bg-base p-5 border border-line group-hover:border-accent/30 transition-colors">
          <span className="block text-xs text-accent uppercase tracking-wider mb-2">Retainer Mensual</span>
          <span className="text-3xl font-bold text-primary">{retainerPrice}</span>
          <span className="block text-xs text-secondary mt-2">+ Servidores y Mantenimiento</span>
        </div>
      </div>

      <ul className="flex flex-col gap-4 mb-10">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-primary">
            <span className="text-accent mt-0.5 font-bold">&gt;</span>
            {feature}
          </li>
        ))}
      </ul>

      <a
        href={proposalMailto}
        className={`mt-auto w-full py-4 text-sm font-bold tracking-widest uppercase text-center transition-all duration-300 ${isPopular ? 'bg-accent text-black hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-surface text-primary border border-line hover:bg-accent hover:text-black hover:border-accent'}`}
      >
        Solicitar Propuesta
      </a>
    </div>
  );
};
