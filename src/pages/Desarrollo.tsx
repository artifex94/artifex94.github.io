import React from 'react';
import { motion } from 'framer-motion';
import { BlueprintBox } from '../components/BlueprintBox';
import { PricingBox } from '../components/PricingBox';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { pricingTiers, onboardingSteps, demoPages } from '../data/business';
import { buildMailto, buildWhatsAppUrl } from '../data/contact';
import { usePageMeta } from '../hooks/usePageMeta';
import { ContactCTA } from '../components/ContactCTA';

const heroCtaHref = buildWhatsAppUrl('desarrollo') ?? buildMailto('Consulta - Desarrollo Web y Sistemas a Medida');
const isHeroCtaWhatsApp = heroCtaHref.startsWith('https://wa.me/');

export const Desarrollo: React.FC = () => {
  usePageMeta({
    title: 'Desarrollo Web y Sistemas a Medida | Artifex — Ramiro Escobar',
    description:
      'Sitios web y sistemas a medida para empresas, negocios y emprendedores: presencia digital clara, procesos ordenados y soporte continuo. Planes de inversión transparentes.',
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
              // Desarrollo de Software a Medida
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Tu negocio necesita un sistema que <span className="text-accent">trabaje por vos</span>.
            </h1>
            <p className="text-lg md:text-xl text-secondary mb-10 max-w-3xl leading-relaxed">
              Desarrollo sitios web y sistemas a medida para empresas, negocios y emprendedores. Entrega en tiempo real, precios transparentes y soporte continuo desde el primer mensaje hasta la entrega final.
            </p>
            <a
              href={heroCtaHref}
              {...(isHeroCtaWhatsApp ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="flex items-center gap-3 bg-accent text-black px-10 py-4 font-bold text-lg hover:bg-white hover:shadow-[0_0_20px_rgba(255,107,0,0.6)] transition-all duration-300"
            >
              {isHeroCtaWhatsApp && <MessageCircle size={20} />}
              Consultar por WhatsApp
            </a>
          </div>
        </BlueprintBox>

        {/* Problem vs Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BlueprintBox coords={{ x: 25, y: 40 }} delay={0.3}>
            <h3 className="text-xl font-bold text-white mb-6 border-b border-line pb-4">
              <span className="text-accent mr-2">{"<"}</span>El Problema: Sin presencia digital ordenada
            </h3>
            <ul className="space-y-4 text-secondary">
              <li className="flex gap-3"><span className="text-red-500 font-bold">x</span> Perdés clientes que ya te buscan en Google y no te encuentran.</li>
              <li className="flex gap-3"><span className="text-red-500 font-bold">x</span> Atendés consultas repetidas por WhatsApp sin catálogo ni web clara.</li>
              <li className="flex gap-3"><span className="text-red-500 font-bold">x</span> Dependés de una planilla o cuaderno para gestionar pedidos y turnos.</li>
              <li className="flex gap-3"><span className="text-red-500 font-bold">x</span> Tu presencia online no refleja la seriedad de tu negocio.</li>
            </ul>
          </BlueprintBox>

          <BlueprintBox coords={{ x: 75, y: 40 }} delay={0.4}>
            <h3 className="text-xl font-bold text-white mb-6 border-b border-line pb-4">
              <span className="text-accent mr-2">{">"}</span>Cómo trabajo
            </h3>
            <ul className="space-y-4 text-secondary">
              <li className="flex gap-3"><span className="text-green-500 font-bold">✓</span> Comunicación directa conmigo, sin intermediarios, desde el primer mensaje hasta la entrega final.</li>
              <li className="flex gap-3"><span className="text-green-500 font-bold">✓</span> Precio fijo acordado antes de empezar: sin extras sorpresa.</li>
              <li className="flex gap-3"><span className="text-green-500 font-bold">✓</span> Sitio optimizado para celular, donde llega el 80% de tus clientes.</li>
              <li className="flex gap-3"><span className="text-green-500 font-bold">✓</span> Código y documentación tuyos desde el día uno.</li>
            </ul>
          </BlueprintBox>
        </div>

        {/* Pricing Section */}
        <section className="mt-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Servicios y Precios</h2>
            <p className="text-secondary">Transparencia total desde el primer día. Sin sorpresas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingTiers.map((tier) => (
              <PricingBox key={tier.name} {...tier} />
            ))}
          </div>
        </section>

        {/* Retainer Banner */}
        <BlueprintBox coords={{ x: 50, y: 80 }} delay={0.5} className="bg-surface border-l-4 border-l-accent">
          <div className="p-4 md:p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">El mantenimiento mensual no es un gasto. <br/><span className="text-accent">Es tu garantía de continuidad.</span></h3>
              <p className="text-secondary">Por $50.000 ARS/mes tu sitio se mantiene actualizado, seguro y con soporte directo. Ante cualquier cambio o problema, respuesta en el día.</p>
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

        {/* Demos por rubro */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">Mirá ejemplos por rubro</h2>
            <p className="text-secondary">
              Demos interactivas y navegables: así puede verse el sitio de tu negocio.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoPages.map((demo) => (
              <Link
                key={demo.slug}
                to={`/business/${demo.slug}`}
                className="group bg-surface border border-line p-6 hover:border-accent transition-colors"
              >
                <h4 className="text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                  {demo.label}
                </h4>
                <p className="text-sm text-secondary mb-4">{demo.desc}</p>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-accent">
                  Ver demo
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA de cierre */}
        <section className="mb-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">¿Hablamos de tu proyecto?</h2>
          <ContactCTA service="desarrollo" emailSubject="Consulta - Desarrollo Web y Sistemas a Medida" />
        </section>
      </div>
    </motion.div>
  );
};
