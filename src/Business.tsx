import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BlueprintBox } from './components/BlueprintBox';
import { PricingBox, type PricingTier } from './components/PricingBox';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_URL = "https://wa.me/5493436431987?text=Hola%20Ramiro%2C%20quiero%20consultar%20sobre%20un%20proyecto%20web.";

const pricingTiers: PricingTier[] = [
  {
    name: "Presencia Digital Express",
    target: "Para negocios, profesionales y emprendedores que necesitan presencia web rápida y efectiva.",
    setupPrice: "$200.000 – $400.000 ARS",
    retainerPrice: "$50.000 ARS",
    features: [
      "Landing page profesional y mobile-first",
      "Sección de servicios o productos",
      "Formulario de contacto + botón WhatsApp",
      "Google Maps integrado",
      "Dominio y deploy incluidos (Vercel)",
      "Entrega en 1 a 2 semanas",
    ],
  },
  {
    name: "Sistema Web a Medida",
    target: "Para negocios que necesitan sistematizar operaciones: gestión de clientes, turnos, catálogos o dashboards.",
    setupPrice: "$1.000.000 ARS",
    retainerPrice: "$50.000 ARS",
    features: [
      "Aplicación web completa según requerimiento",
      "Panel de administración propio",
      "Base de datos y lógica de negocio a medida",
      "Autenticación de usuarios",
      "Ciclo de desarrollo de 3 meses",
      "Mantenimiento mensual incluido post-entrega",
    ],
    isPopular: true,
  },
];

const onboardingSteps = [
  { step: "01", title: "Discovery", desc: "Reunión de diagnóstico para entender el negocio, el problema y los objetivos. Sin costo." },
  { step: "02", title: "Propuesta", desc: "Definición del alcance, arquitectura, tiempos y presupuesto detallado." },
  { step: "03", title: "Desarrollo", desc: "Ciclo de desarrollo con entregas parciales y comunicación continua." },
  { step: "04", title: "Entrega & Soporte", desc: "Deploy a producción y transición al plan de mantenimiento mensual." },
];

const targetSegments = [
  { icon: "🏢", title: "Inmobiliarias", desc: "Catálogo de propiedades, filtros y contacto directo.", demo: "/business/inmobiliarias" },
  { icon: "🩺", title: "Profesionales", desc: "Médicos, abogados y contadores que necesitan captar clientes online.", demo: "/business/profesionales" },
  { icon: "🍽️", title: "Gastronomía", desc: "Menú digital, pedidos por WhatsApp y presencia local.", demo: "/business/gastronomia" },
  { icon: "🛍️", title: "Comercios", desc: "Catálogo digital para tiendas que venden por WhatsApp.", demo: "/business/comercios" },
  { icon: "🚀", title: "Emprendedores", desc: "MVP o landing page para validar una idea rápido.", demo: null },
  { icon: "⚙️", title: "Empresas", desc: "Sistemas internos, dashboards y automatizaciones a medida.", demo: null },
];

export const Business: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen w-full bg-black bg-blueprint-grid py-12 px-4 sm:px-6 lg:px-8 text-[#e5e5e5] font-sans"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-16">

        {/* Hero */}
        <BlueprintBox coords={{ x: 10, y: 15 }} delay={0.1}>
          <div className="py-12 md:py-20 text-center max-w-4xl mx-auto flex flex-col items-center">
            <span className="text-[#E67E32] uppercase tracking-widest text-sm font-bold mb-4 block">
              // Desarrollo de Software a Medida
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Tu negocio necesita un sistema que{" "}
              <span className="text-[#E67E32]">trabaje por vos.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#a3a3a3] mb-10 max-w-3xl leading-relaxed">
              Desarrollo plataformas digitales y sistemas web a medida para empresas, negocios y emprendedores. 
              Entrega en tiempo real, precios transparentes y soporte continuo.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-[#E67E32] text-black px-10 py-4 font-bold text-lg hover:bg-white hover:shadow-[0_0_20px_rgba(230,126,50,0.6)] transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              Consultar por WhatsApp
            </a>
          </div>
        </BlueprintBox>

        {/* Segmentos target */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">¿Para quién trabajo?</h2>
            <p className="text-[#a3a3a3]">Cualquier negocio que necesite software que funcione.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {targetSegments.map((seg, idx) => (
              seg.demo ? (
                <Link
                  key={idx}
                  to={seg.demo}
                  className="bg-[#141414] border border-[#262626] p-5 hover:border-[#E67E32] transition-colors group block"
                >
                  <span className="text-2xl mb-3 block">{seg.icon}</span>
                  <h4 className="text-white font-bold mb-1 group-hover:text-[#E67E32] transition-colors">{seg.title}</h4>
                  <p className="text-xs text-[#a3a3a3] mb-2">{seg.desc}</p>
                  <span className="text-xs text-[#E67E32] font-semibold">Ver demo →</span>
                </Link>
              ) : (
                <div
                  key={idx}
                  className="bg-[#141414] border border-[#262626] p-5 hover:border-[#E67E32] transition-colors"
                >
                  <span className="text-2xl mb-3 block">{seg.icon}</span>
                  <h4 className="text-white font-bold mb-1">{seg.title}</h4>
                  <p className="text-xs text-[#a3a3a3]">{seg.desc}</p>
                </div>
              )
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Servicios y Precios</h2>
            <p className="text-[#a3a3a3]">Transparencia total desde el primer día. Sin sorpresas.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier, idx) => (
              <PricingBox key={idx} {...tier} />
            ))}
          </div>
        </section>

        {/* Mantenimiento banner */}
        <BlueprintBox coords={{ x: 50, y: 80 }} delay={0.5} className="bg-[#1f1f1f] border-l-4 border-l-[#E67E32]">
          <div className="p-4 md:p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">
                El mantenimiento mensual no es un gasto.<br />
                <span className="text-[#E67E32]">Es tu garantía de continuidad.</span>
              </h3>
              <p className="text-[#a3a3a3]">
                Por $50.000 ARS/mes tu sistema se mantiene actualizado, seguro y con soporte directo. 
                Ante cualquier cambio o problema, respuesta en el día.
              </p>
            </div>
          </div>
        </BlueprintBox>

        {/* Proceso */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">¿Cómo trabajamos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {onboardingSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-[#141414] border border-[#262626] p-6 relative hover:border-[#E67E32] transition-colors"
              >
                <span className="absolute -top-4 -left-4 text-5xl font-black text-[#E67E32] opacity-20">
                  {step.step}
                </span>
                <h4 className="text-xl font-bold text-[#e5e5e5] mb-3 relative z-10">{step.title}</h4>
                <p className="text-sm text-[#a3a3a3] relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <BlueprintBox coords={{ x: 50, y: 95 }} delay={0.6}>
          <div className="text-center py-10">
            <h3 className="text-2xl font-bold text-white mb-4">
              ¿Tenés un proyecto en mente?
            </h3>
            <p className="text-[#a3a3a3] mb-8 max-w-xl mx-auto">
              Contame qué necesitás. La primera consulta es sin cargo y sin compromiso.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 bg-[#E67E32] text-black px-10 py-4 font-bold text-lg hover:bg-white transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              Escribime por WhatsApp
            </a>
          </div>
        </BlueprintBox>

      </div>
    </motion.div>
  );
};
