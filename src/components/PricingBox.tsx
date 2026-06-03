import React from 'react';

export interface PricingTier {
  name: string;
  target: string;
  setupPrice: string;
  setupOptions?: {
    label: string;
    description: string;
    price: string;
  }[];
  retainerPrice: string;
  features: string[];
  ctaHref?: string;
  visualSrc?: string;
  visualAlt?: string;
  isPopular?: boolean;
}

export const PricingBox: React.FC<PricingTier> = ({
  name,
  target,
  setupPrice,
  setupOptions,
  retainerPrice,
  features,
  ctaHref,
  visualSrc,
  visualAlt,
  isPopular
}) => {
  return (
    <div className={`relative flex flex-col p-8 bg-[#141414] border ${isPopular ? 'border-[#E67E32] shadow-[0_0_20px_rgba(230,126,50,0.15)] scale-105 z-10' : 'border-[#262626]'} transition-transform duration-300 hover:border-[#E67E32] group`}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#E67E32] text-black text-xs font-bold uppercase tracking-widest">
          Recomendado
        </div>
      )}
      <h4 className="text-2xl font-bold text-[#e5e5e5] border-b border-[#262626] pb-4 mb-4">{name}</h4>
      <p className="text-sm text-[#a3a3a3] mb-8 min-h-[40px] leading-relaxed">{target}</p>

      <div className="flex flex-col gap-4 mb-8 flex-grow">
        <div className="bg-[#000000] p-5 border border-[#262626] group-hover:border-[#E67E32]/30 transition-colors">
          <span className="block text-xs text-[#E67E32] uppercase tracking-wider mb-2">Setup Inicial</span>
          {setupOptions ? (
            <div className="flex flex-col gap-4">
              {setupOptions.map((option) => (
                <div key={option.label} className="border-b border-[#262626] last:border-b-0 pb-4 last:pb-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <span className="text-sm font-bold text-[#e5e5e5]">{option.label}</span>
                    <span className="text-2xl font-bold text-[#e5e5e5]">{option.price}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#a3a3a3]">{option.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-3xl font-bold text-[#e5e5e5]">{setupPrice}</span>
          )}
        </div>
        <div className="bg-[#000000] p-5 border border-[#262626] group-hover:border-[#E67E32]/30 transition-colors">
          <span className="block text-xs text-[#E67E32] uppercase tracking-wider mb-2">Retainer Mensual</span>
          <span className="text-3xl font-bold text-[#e5e5e5]">{retainerPrice}</span>
          <span className="block text-xs text-[#a3a3a3] mt-2">+ Servidores y Mantenimiento</span>
        </div>
        {visualSrc && (
          <div className="overflow-hidden bg-[#000000] border border-[#262626] group-hover:border-[#E67E32]/30 transition-colors">
            <img
              src={visualSrc}
              alt={visualAlt ?? ''}
              className="aspect-video w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      <ul className="flex flex-col gap-4 mb-10">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-[#e5e5e5]">
            <span className="text-[#E67E32] mt-0.5 font-bold">&gt;</span>
            {feature}
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        target="_blank"
        rel="noreferrer"
        className={`mt-auto inline-flex w-full items-center justify-center py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 ${isPopular ? 'bg-[#E67E32] text-black hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-[#1f1f1f] text-[#e5e5e5] border border-[#262626] hover:bg-[#E67E32] hover:text-black hover:border-[#E67E32]'}`}
      >
        Solicitar Propuesta
      </a>
    </div>
  );
};
