import React from 'react';
import { BlueprintBox } from '../BlueprintBox';
import { ContactCTA } from '../ContactCTA';

// Closing section: a warm invitation, the shared contact CTA and a discreet
// link to the client portal.
export const FinalCTA: React.FC = () => {
  return (
    <section>
      <BlueprintBox coords={{ x: 50, y: 95 }}>
        <div className="py-8 text-center sm:py-10">
          <h2 className="text-3xl font-bold text-white">¿Tenés algo en mente?</h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary">
            La primera charla es sin cargo y sin compromiso. Contame qué necesitás y lo pensamos
            juntos.
          </p>
          <ContactCTA
            service="desarrollo"
            emailSubject="Consulta - Desarrollo Web y Sistemas a Medida"
            className="mt-8"
          />
        </div>
      </BlueprintBox>

      <div className="mt-8 text-center">
        <a
          href="https://portal.artifex.click"
          className="font-mono text-sm text-secondary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Acceso clientes →
        </a>
      </div>
    </section>
  );
};
