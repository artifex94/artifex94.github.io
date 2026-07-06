import React from 'react';
import { Check, MessageCircle } from 'lucide-react';
import { sistemaTier } from '../../data/business';
import { buildWhatsAppUrl, buildMailto } from '../../data/contact';
import { SistemaLiveDemo } from './SistemaLiveDemo';

// "Sistema Web a Medida" — the recommended tier. The live demo replaces the old
// static GIF and is itself the proof of what a custom panel looks like.
export const SistemaCard: React.FC = () => {
  const waHref =
    buildWhatsAppUrl('desarrollo', 'sistema') ?? buildMailto('Consulta - Sistema Web a Medida');
  const isWhatsApp = waHref.startsWith('https://wa.me/');

  return (
    <div className="relative flex h-full flex-col border border-accent bg-surface p-6 shadow-[0_0_28px_rgba(255,107,0,0.12)] sm:p-8">
      <span className="absolute -top-3 left-6 bg-accent px-3 py-1 text-xs font-bold uppercase tracking-widest text-on-accent">
        {sistemaTier.badge}
      </span>

      <div className="mb-1 font-mono text-xs uppercase tracking-widest text-accent">
        A medida
      </div>
      <h3 className="text-xl font-bold text-white">{sistemaTier.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-secondary">{sistemaTier.target}</p>

      <div className="mt-5">
        <SistemaLiveDemo />
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold text-white">{sistemaTier.price}</span>
        <span className="text-sm text-secondary">ARS</span>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {sistemaTier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-primary">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={waHref}
        {...(isWhatsApp ? { target: '_blank', rel: 'noreferrer' } : {})}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-accent px-6 py-3.5 font-bold text-on-accent transition-all duration-300 hover:opacity-90 hover:shadow-[0_0_20px_rgba(255,107,0,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {isWhatsApp && <MessageCircle size={18} />}
        Quiero un sistema a medida
      </a>
    </div>
  );
};
