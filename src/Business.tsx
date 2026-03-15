import React from 'react';
import { motion } from 'framer-motion';
import { BlueprintBox } from './components/BlueprintBox';
import { PricingBox, type PricingTier } from './components/PricingBox';

const pricingTiers: PricingTier[] = [
  {
    name: "Growth Headless",
    target: "Marcas DTC preparadas para dar el gran salto (Shopify Basic).",
    setupPrice: "~$2.8M ARS",
    retainerPrice: "~$250K ARS",
    features: [
      "Arquitectura Headless (Next.js + Shopify)",
      "Diseño UI/UX orientado a conversión",
      "Optimización Core Web Vitals",
      "Soporte técnico estándar"
    ]
  },
  {
    name: "Scale & Optimize",
    target: "Operaciones de Retail B2B / Fuerte enfoque en SEO (Shopify Advanced).",
    setupPrice: "~$5.5M ARS",
    retainerPrice: "~$450K ARS",
    features: [
      "Todo lo incluido en Growth",
      "Rutas de e-commerce complejas y filtrado dinámico",
      "Optimización SEO Técnica Avanzada",
      "Soporte prioritario y monitorización activa"
    ],
    isPopular: true
  },
  {
    name: "Enterprise",
    target: "Marcas Omnicanal con catálogos masivos (Shopify Plus).",
    setupPrice: "Desde $9.8M",
    retainerPrice: "~$900K ARS",
    features: [
      "Integraciones con ERPs/CRMs de terceros",
      "Multi-región y Multi-moneda nativo",
      "Desarrollo de features a medida",
      "SLA garantizado y línea directa"
    ]
  }
];

const onboardingSteps = [
  { step: "01", title: "Discovery", desc: "Auditoría técnica profunda y trazado del plan de acción enfocado en el CRO." },
  { step: "02", title: "Propuesta", desc: "Definición de arquitectura de datos, estimación de ROI e hitos de proyecto." },
  { step: "03", title: "Desarrollo", desc: "Sprints ágiles semanales para desacoplar e integrar Next.js con Shopify." },
  { step: "04", title: "Lanzamiento", desc: "Despliegue a producción y entrada al ciclo de Retainer para escalabilidad." },
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
        
        {/* Hero Section */}
        <BlueprintBox coords={{ x: 10, y: 15 }} delay={0.1}>
          <div className="py-12 md:py-20 text-center max-w-4xl mx-auto flex flex-col items-center">
            <span className="text-[#E67E32] uppercase tracking-widest text-sm font-bold mb-4 block">
              // Infraestructura E-commerce de Alto Rendimiento
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Escalabilidad y Velocidad que <span className="text-[#E67E32]">Convierten</span>.
            </h1>
            <p className="text-lg md:text-xl text-[#a3a3a3] mb-10 max-w-3xl leading-relaxed">
              No vendemos "plantillas". Construimos arquitecturas Headless (Next.js + Shopify) que recuperan el 20% de las ventas perdidas por latencia móvil. Diseñado exclusivamente para marcas que escalan.
            </p>
            <button className="bg-[#E67E32] text-black px-10 py-4 font-bold text-lg hover:bg-white hover:shadow-[0_0_20px_rgba(230,126,50,0.6)] transition-all duration-300">
              Agendar Auditoría Gratuita
            </button>
          </div>
        </BlueprintBox>

        {/* Problem vs Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BlueprintBox coords={{ x: 25, y: 40 }} delay={0.3}>
            <h3 className="text-xl font-bold text-white mb-6 border-b border-[#262626] pb-4">
              <span className="text-[#E67E32] mr-2">{"<"}</span>El Problema: Monolito Tradicional
            </h3>
            <ul className="space-y-4 text-[#a3a3a3]">
              <li className="flex gap-3"><span className="text-red-500 font-bold">x</span> Tiempos de carga superiores a 3 segundos.</li>
              <li className="flex gap-3"><span className="text-red-500 font-bold">x</span> Dependencia de plugins frágiles de terceros.</li>
              <li className="flex gap-3"><span className="text-red-500 font-bold">x</span> Caídas de servidor durante picos (Hot Sale/Cyber Monday).</li>
              <li className="flex gap-3"><span className="text-red-500 font-bold">x</span> Altas tasas de rebote móvil y carritos abandonados.</li>
            </ul>
          </BlueprintBox>

          <BlueprintBox coords={{ x: 75, y: 40 }} delay={0.4}>
            <h3 className="text-xl font-bold text-white mb-6 border-b border-[#262626] pb-4">
              <span className="text-[#E67E32] mr-2">{">"}</span>La Solución: Headless Commerce
            </h3>
            <ul className="space-y-4 text-[#a3a3a3]">
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
            <p className="text-[#a3a3a3]">Modelos paquetizados para asegurar transparencia y ROI desde el día 1.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier, idx) => (
              <PricingBox key={idx} {...tier} />
            ))}
          </div>
        </section>

        {/* Retainer Banner */}
        <BlueprintBox coords={{ x: 50, y: 80 }} delay={0.5} className="bg-[#1f1f1f] border-l-4 border-l-[#E67E32]">
          <div className="p-4 md:p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">El Abono Mensual no es un gasto. <br/><span className="text-[#E67E32]">Es tu Seguro de Infraestructura.</span></h3>
              <p className="text-[#a3a3a3]">Nuestro Retainer Mensual asegura alojamiento en servidores cloud ultrarrápidos, mantenimiento preventivo de código y evolución continua. Garantizamos que tu tienda nunca se caiga ni quede obsoleta ante las actualizaciones del ecosistema web.</p>
            </div>
          </div>
        </BlueprintBox>

        {/* Onboarding Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Proceso de Onboarding</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {onboardingSteps.map((step, idx) => (
              <div key={idx} className="bg-[#141414] border border-[#262626] p-6 relative hover:border-[#E67E32] transition-colors">
                <span className="absolute -top-4 -left-4 text-5xl font-black text-[#E67E32] opacity-20">{step.step}</span>
                <h4 className="text-xl font-bold text-[#e5e5e5] mb-3 relative z-10">{step.title}</h4>
                <p className="text-sm text-[#a3a3a3] relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};