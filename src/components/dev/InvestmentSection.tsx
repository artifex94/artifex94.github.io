import React from 'react';
import { Split } from 'lucide-react';
import { Reveal } from '../Reveal';
import { PresenciaStepper } from './PresenciaStepper';
import { SistemaCard } from './SistemaCard';

// "Cuánto sale": two boxes (the three-level Presencia stepper and the custom
// system). The monthly retainer is described here, but its figure lives on the
// Presencia pointer — the one place a price decision is made.
export const InvestmentSection: React.FC = () => {
  return (
    <section>
      <Reveal className="mb-8 text-center md:mb-10">
        <h2 className="text-3xl font-bold text-white">Cuánto sale</h2>
        <p className="mt-3 font-mono text-sm text-primary/80">
          // Dos caminos: tu web, o un sistema a tu medida.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
        <Reveal>
          <PresenciaStepper />
        </Reveal>
        <Reveal delay={0.1} className="flex h-full flex-col gap-3">
          {/* Fork, not eyebrow: a bridge that cuts the Tienda-vs-Sistema doubt. */}
          <div className="flex flex-col gap-1.5 border-l-2 border-l-accent bg-accent/[0.06] px-3 py-2.5">
            <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-accent">
              <Split className="h-3.5 w-3.5" aria-hidden="true" />
              ¿Tu operación necesita más que una web?
            </span>
            <p className="text-xs leading-relaxed text-primary/80">
              Si solo vendés productos, con Tienda alcanza. Para turnos, fichas de clientes o reportes
              de tu equipo, es a medida.
            </p>
          </div>
          <div className="flex-1">
            <SistemaCard />
          </div>
        </Reveal>
      </div>

      {/* Retainer strip — the monthly figure itself lives on the Presencia pointer */}
      <Reveal delay={0.15}>
        <div className="mt-6 border-l-4 border-l-accent bg-surface p-6 sm:p-8">
          <h3 className="text-xl font-bold text-white">
            Y después de la entrega, no te quedás solo.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary/80">
            El abono mensual mantiene tu sitio al día, seguro y con soporte directo — respuesta en el
            día. En el Sistema a Medida, el primer año ya está incluido.
          </p>
        </div>
      </Reveal>
    </section>
  );
};
