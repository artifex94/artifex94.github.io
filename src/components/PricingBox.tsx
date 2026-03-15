import React from 'react';

export interface PricingTier {
  name: string;
  target: string;
  setupPrice: string;
  retainerPrice: string;
  features: string[];
  isPopular?: boolean;
}

export const PricingBox: React.FC<PricingTier> = ({
  name,
  target,
  setupPrice,
  retainerPrice,
  features,
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
          <span className="text-3xl font-bold text-[#e5e5e5]">{setupPrice}</span>
        </div>
        <div className="bg-[#000000] p-5 border border-[#262626] group-hover:border-[#E67E32]/30 transition-colors">
          <span className="block text-xs text-[#E67E32] uppercase tracking-wider mb-2">Retainer Mensual</span>
          <span className="text-3xl font-bold text-[#e5e5e5]">{retainerPrice}</span>
          <span className="block text-xs text-[#a3a3a3] mt-2">+ Servidores y Mantenimiento</span>
        </div>
      </div>

      <ul className="flex flex-col gap-4 mb-10">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-[#e5e5e5]">
            <span className="text-[#E67E32] mt-0.5 font-bold">&gt;</span>
            {feature}
          </li>
        ))}
      </ul>

      <button 
        className={`mt-auto w-full py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 ${isPopular ? 'bg-[#E67E32] text-black hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-[#1f1f1f] text-[#e5e5e5] border border-[#262626] hover:bg-[#E67E32] hover:text-black hover:border-[#E67E32]'}`}
      >
        Solicitar Propuesta
      </button>
    </div>
  );
};