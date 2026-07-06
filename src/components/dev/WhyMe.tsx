import React from 'react';
import { differentiators } from '../../data/business';
import { BlueprintBox } from '../BlueprintBox';
import { Reveal } from '../Reveal';

// "Por qué trabajar conmigo": the three differentiators, each in a tilting
// BlueprintBox so the section carries the same blueprint signature.
export const WhyMe: React.FC = () => {
  return (
    <section>
      <Reveal className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white">Por qué trabajar conmigo</h2>
        <p className="mt-3 font-mono text-sm text-secondary">
          // Tres cosas que no vas a tener que aclarar dos veces.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {differentiators.map((item, i) => {
          const Icon = item.icon;
          return (
            <BlueprintBox key={item.title} delay={i * 0.1}>
              <Icon className="mb-4 h-6 w-6 text-accent" aria-hidden="true" />
              <h3 className="mb-2 font-bold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-secondary">{item.desc}</p>
            </BlueprintBox>
          );
        })}
      </div>
    </section>
  );
};
