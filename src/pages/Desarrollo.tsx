import React from 'react';
import { motion } from 'framer-motion';
import { BlueprintBox } from '../components/BlueprintBox';
import { PricingBox } from '../components/PricingBox';
import { pricingTiers, onboardingSteps } from '../data/business';
import { buildMailto } from '../data/contact';
import { usePageMeta } from '../hooks/usePageMeta';
import { ContactCTA } from '../components/ContactCTA';

const auditMailto = buildMailto('Auditoría Gratuita - Headless E-commerce');

export const Desarrollo: React.FC = () => {
  usePageMeta({
    title: 'Desarrollo E-commerce Headless | Artifex — Ramiro Escobar',
    description:
      'Arquitecturas headless (Next.js + Shopify) para marcas que escalan: velocidad, conversión y soporte continuo. Planes de inversión transparentes.',
    canonicalPath: '/servicios/desarrollo',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen w-full bg-blueprint-grid py-12 px-4 sm:px-6 lg:px-8 text-primary font-sans"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-16">

        {/* Hero Section */}
        <BlueprintBox coords={{ x: 10, y: 15 }} delay={0.1}>
          <div className="py-12 md:py-20 text-center max-w-4xl mx-auto flex flex-col items-center">
            <span className="text-accent uppercase tracking-widest text-sm font-bold mb-4 block">
              // Infraestructura E-commerce de Alto Rendimiento
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Escalabilidad y Velocidad que <span className="text-accent">Convierten</span>.
            </h1>
            <p className="text-lg md:text-xl text-secondary mb-10 max-w-3xl leading-relaxed">
              No vendemos "plantillas". Construimos arquitecturas Headless (Next.js + Shopify) que recuperan el 20% de las ventas perdidas por latencia móvil. Diseñado exclusivamente para marcas que escalan.
            </p>
            <a
              href={auditMailto}
              className="bg-accent text-black px-10 py-4 font-bold text-lg hover:bg-white hover:shadow-[0_0_20px_rgba(255,107,0,0.6)] transition-all duration-300"
            >
              Agendar Auditoría Gratuita
            </a>
          </div>
        </BlueprintBox>

        {/* Problem vs Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BlueprintBox coords={{ x: 25, y: 40 }} delay={0.3}>
            <h3 className="text-xl font-bold text-white mb-6 border-b border-line pb-4">
              <span className="text-accent mr-2">{"<"}</span>El Problema: Monolito Tradicional
            </h3>
            <ul className="space-y-4 text-secondary">
              <li className="flex gap-3"><span className="text-red-500 font-bold">x</span> Tiempos de carga superiores a 3 segundos.</li>
              <li className="flex gap-3"><span className="text-red-500 font-bold">x</span> Dependencia de plugins frágiles de terceros.</li>
              <li className="flex gap-3"><span className="text-red-500 font-bold">x</span> Caídas de servidor durante picos (Hot Sale/Cyber Monday).</li>
              <li className="flex gap-3"><span className="text-red-500 font-bold">x</span> Altas tasas de rebote móvil y carritos abandonados.</li>
            </ul>
          </BlueprintBox>

          <BlueprintBox coords={{ x: 75, y: 40 }} delay={0.4}>
            <h3 className="text-xl font-bold text-white mb-6 border-b border-line pb-4">
              <span className="text-accent mr-2">{">"}</span>La Solución: Headless Commerce
            </h3>
            <ul className="space-y-4 text-secondary">
              <li className="flex gap-3"><span className="text-green-500 font-bold">✓</span> Cargas en milisegundos (React/Next.js).</li>
              <li className="flex gap-3"><span className="text-green-500 font-bold">✓</span> Backend y Frontend desacoplados para seguridad total.</li>
              <li className="flex gap-3"><span className="text-green-500 font-bold">✓</span> Motor transaccional inquebrantable (Shopify).</li>
              <li className="flex gap-3"><span className="text-green-500 font-bold">✓</span> Maximización del CRO y retención de usuarios.</li>
            </ul>
          </BlueprintBox>
        </div>

        {/* Pricing Section */}
        <section className="mt-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Planes de Inversión Tecnológica</h2>
            <p className="text-secondary">Modelos paquetizados para asegurar transparencia y ROI desde el día 1.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <PricingBox key={tier.name} {...tier} />
            ))}
          </div>
        </section>

        {/* Retainer Banner */}
        <BlueprintBox coords={{ x: 50, y: 80 }} delay={0.5} className="bg-surface border-l-4 border-l-accent">
          <div className="p-4 md:p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">El Abono Mensual no es un gasto. <br/><span className="text-accent">Es tu Seguro de Infraestructura.</span></h3>
              <p className="text-secondary">Nuestro Retainer Mensual asegura alojamiento en servidores cloud ultrarrápidos, mantenimiento preventivo de código y evolución continua. Garantizamos que tu tienda nunca se caiga ni quede obsoleta ante las actualizaciones del ecosistema web.</p>
            </div>
          </div>
        </BlueprintBox>

        {/* Onboarding Process */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Proceso de Onboarding</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {onboardingSteps.map((step) => (
              <div key={step.step} className="bg-surface border border-line p-6 relative hover:border-accent transition-colors">
                <span className="absolute -top-4 -left-4 text-5xl font-black text-accent opacity-20">{step.step}</span>
                <h4 className="text-xl font-bold text-primary mb-3 relative z-10">{step.title}</h4>
                <p className="text-sm text-secondary relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA de cierre */}
        <section className="mb-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">¿Hablamos de tu proyecto?</h2>
          <ContactCTA service="desarrollo" emailSubject="Consulta - Desarrollo E-commerce" />
        </section>
      </div>
    </motion.div>
  );
};
