import React from 'react';
import { BlueprintBox } from '../BlueprintBox';
import { ContactCTA } from '../ContactCTA';

// Closing section: a warm invitation, the shared contact CTA and a discreet
// link to the client portal.
export const FinalCTA: React.FC = () => {
  return (
    <section className="-mt-10 md:-mt-12">
      <BlueprintBox>
        <div className="py-5 text-center sm:py-6">
          <h2 className="text-3xl font-bold text-white">¿Tenés algo en mente?</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary/70">
            Contame qué necesitás para tu negocio. Te respondo yo — no un bot, no un equipo de
            ventas.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-primary/60">
            La primera charla es sin cargo y sin compromiso.
          </p>
          <ContactCTA
            service="desarrollo"
            emailSubject="Consulta - Desarrollo Web y Sistemas a Medida"
            label="Contame tu idea"
            className="mt-8"
          />
          <div className="mt-8 border-t border-line pt-5">
            <a
              href="https://portal.artifex.click"
              className="font-mono text-sm text-secondary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Acceso clientes →
            </a>
          </div>
        </div>
      </BlueprintBox>
    </section>
  );
};
