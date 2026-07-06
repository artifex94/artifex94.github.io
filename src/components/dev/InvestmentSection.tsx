import React from 'react';
import { RETAINER_PRICE } from '../../data/business';
import { Reveal } from '../Reveal';
import { PresenciaStepper } from './PresenciaStepper';
import { SistemaCard } from './SistemaCard';

// "Cuánto sale": two boxes (the three-level Presencia stepper and the custom
// system), plus the single mention of the monthly retainer.
export const InvestmentSection: React.FC = () => {
  return (
    <section>
      <Reveal className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white">Cuánto sale</h2>
        <p className="mt-3 font-mono text-sm text-secondary">
          // Elegí por dónde arrancar.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <Reveal>
          <PresenciaStepper />
        </Reveal>
        <Reveal delay={0.1}>
          <SistemaCard />
        </Reveal>
      </div>

      {/* Retainer strip — the only place the monthly figure appears */}
      <Reveal delay={0.15}>
        <div className="mt-6 flex flex-col gap-4 border-l-4 border-l-accent bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h3 className="text-xl font-bold text-white">
              Y después de la entrega, no te quedás solo.
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-secondary">
              Un abono mensual mantiene tu sitio al día, seguro y con soporte directo, con respuesta
              en el día. Para los planes de Presencia Digital es opcional; en el Sistema a Medida el
              primer año ya está incluido y después podés seguir con el mismo abono.
            </p>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <div className="text-3xl font-extrabold text-accent">{RETAINER_PRICE}</div>
            <div className="font-mono text-xs uppercase tracking-wider text-secondary">
              ARS por mes
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
