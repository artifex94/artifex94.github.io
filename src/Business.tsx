import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BlueprintBox } from './components/BlueprintBox';
import { PricingBox, type PricingTier } from './components/PricingBox';
import type { LucideIcon } from 'lucide-react';
import {
  MessageCircle,
  Building2, Stethoscope, UtensilsCrossed, ShoppingBag, Lightbulb, Briefcase,
  Search, FileText, Code2, Rocket, ArrowRight,
  MessageSquare, Lock, FolderOpen,
} from 'lucide-react';

const WHATSAPP_URL = "https://wa.me/5493436431987?text=Hola%20Ramiro%2C%20quiero%20consultar%20sobre%20un%20proyecto%20web.";

interface Segment {
  icon: LucideIcon;
  title: string;
  desc: string;
  demo: string;
}

interface Step {
  step: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface Differentiator {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Presencia Digital Express",
    target: "Para negocios, profesionales y emprendedores que necesitan presencia web rapida y efectiva.",
    setupPrice: "$200.000 - $400.000 ARS",
    retainerPrice: "$50.000 ARS",
    features: [
      "Tu negocio visible y captando consultas en menos de 2 semanas",
      "Seccion de servicios o productos clara y orientada a conversion",
      "Formulario de contacto + boton WhatsApp destacado",
      "Google Maps integrado",
      "Dominio y deploy incluidos (Vercel)",
      "Mobile-first: el 80% de tus clientes llegan desde el celular",
    ],
  },
  {
    name: "Sistema Web a Medida",
    target: "Para negocios que necesitan sistematizar operaciones: gestion de clientes, turnos, catalogos o dashboards.",
    setupPrice: "$1.000.000 ARS",
    retainerPrice: "$50.000 ARS",
    features: [
      "Sistema productivo en 90 dias, con soporte incluido el primer año",
      "Panel de administracion propio — control total desde una sola pantalla",
      "Base de datos y logica de negocio disenada para crecer",
      "Autenticacion de usuarios y roles",
      "Entregas parciales cada sprint — ves el avance en tiempo real",
      "Mantenimiento mensual incluido post-entrega",
    ],
    isPopular: true,
  },
];

const onboardingSteps: Step[] = [
  { step: "01", icon: Search,   title: "Discovery",         desc: "Reunion de diagnostico para entender el negocio, el problema y los objetivos. Sin costo ni compromiso." },
  { step: "02", icon: FileText, title: "Propuesta",         desc: "Alcance, arquitectura, tiempos y presupuesto fijo detallado. Sin sorpresas despues." },
  { step: "03", icon: Code2,    title: "Desarrollo",        desc: "Ciclo de desarrollo con entregas parciales. Ves el avance y das feedback en cada etapa." },
  { step: "04", icon: Rocket,   title: "Entrega & Soporte", desc: "Deploy a produccion, documentacion entregada y transicion al plan de mantenimiento." },
];

const targetSegments: Segment[] = [
  { icon: Building2,       title: "Inmobiliarias",  desc: "Sin sistema propio, perdes leads entre WhatsApps y planillas. Te armo un catalogo con filtros, fichas y contacto directo.",          demo: "/business/inmobiliarias" },
  { icon: Stethoscope,     title: "Profesionales",  desc: "Tus clientes te buscan en Google. Sin presencia profesional, llaman al siguiente. Te pongo visible en dias.",                         demo: "/business/profesionales" },
  { icon: UtensilsCrossed, title: "Gastronomia",    desc: "Un menu digital reduce llamadas y errores en pedidos, y te da presencia local sin depender de apps de terceros.",                     demo: "/business/gastronomia"   },
  { icon: ShoppingBag,     title: "Comercios",      desc: "Vendes por WhatsApp pero sin catalogo ordenado cada consulta te consume tiempo. Te organizo el proceso y lo escalo.",                 demo: "/business/comercios"     },
  { icon: Lightbulb,       title: "Emprendedores",  desc: "Necesitas validar tu idea y captar tus primeros clientes antes de invertir mas. Te armo la presencia digital para arrancar.",         demo: "/business/emprendedores" },
  { icon: Briefcase,       title: "Empresas",       desc: "Tus procesos criticos no pueden depender de hojas de calculo ni emails. Desarrollo sistemas internos y portales a medida.",           demo: "/business/empresas"      },
];

const differentiators: Differentiator[] = [
  {
    icon: MessageSquare,
    title: "Comunicacion directa",
    desc: "Sin intermediarios, sin ticketing, sin su consulta fue derivada al equipo. Hablas conmigo durante todo el proyecto, desde el primer mensaje hasta el deploy.",
  },
  {
    icon: Lock,
    title: "Precio fijo antes de empezar",
    desc: "El presupuesto que acordamos es el que pagas. Sin extras sorpresa ni horas adicionales no pactadas. Si algo cambia, lo hablamos antes de hacerlo.",
  },
  {
    icon: FolderOpen,
    title: "Codigo que es tuyo",
    desc: "Acceso completo al repositorio y documentacion del proyecto desde el dia uno. Si otro desarrollador necesita tomar el trabajo, puede hacerlo sin problemas.",
  },
];

export const Business = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen w-full bg-black bg-blueprint-grid py-12 px-4 sm:px-6 lg:px-8 text-[#e5e5e5]"
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

        {/* Segmentos */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Para quien trabajo</h2>
            <p className="text-[#a3a3a3]">Cualquier negocio que necesite software que funcione.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {targetSegments.map((seg, idx) => {
              const Icon = seg.icon;
              return (
                <Link
                  key={idx}
                  to={seg.demo}
                  className="bg-[#141414] border border-[#262626] p-5 hover:border-[#E67E32] hover:bg-[#1a1409] transition-all duration-200 group block"
                >
                  <Icon className="w-7 h-7 text-[#E67E32]/60 mb-4 group-hover:text-[#E67E32] transition-colors" />
                  <h4 className="text-white font-bold mb-1 group-hover:text-[#E67E32] transition-colors">{seg.title}</h4>
                  <p className="text-xs text-[#a3a3a3] mb-3 leading-relaxed">{seg.desc}</p>
                  <span className="flex items-center gap-1 text-xs text-[#E67E32]/60 font-mono group-hover:text-[#E67E32] transition-colors">
                    Ver demo <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Pricing */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Servicios y Precios</h2>
            <p className="text-[#a3a3a3]">Transparencia total desde el primer dia. Sin sorpresas.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier, idx) => (
              <PricingBox key={idx} {...tier} />
            ))}
          </div>
        </section>

        {/* Mantenimiento */}
        <BlueprintBox coords={{ x: 50, y: 80 }} delay={0.5} innerClassName="bg-[#1f1f1f] border-l-4 border-l-[#E67E32]">
          <div className="p-4 md:p-8">
            <h3 className="text-2xl font-bold text-white mb-3">
              El mantenimiento mensual no es un gasto.<br />
              <span className="text-[#E67E32]">Es tu garantia de continuidad.</span>
            </h3>
            <p className="text-[#a3a3a3]">
              Por $50.000 ARS/mes tu sistema se mantiene actualizado, seguro y con soporte directo.
              Ante cualquier cambio o problema, respuesta en el dia.
            </p>
          </div>
        </BlueprintBox>

        {/* Proceso */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Como trabajamos</h2>
            <p className="text-[#a3a3a3] text-sm font-mono">// Cuatro etapas claras, sin sorpresas.</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-[2.6rem] left-[12.5%] right-[12.5%] h-px z-0 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-[#E67E32]/25 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative z-10">
              {onboardingSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="group relative bg-[#141414] border border-[#262626] p-6 flex flex-col gap-4 hover:border-[#E67E32]/50 hover:bg-[#181818] transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 border border-[#E67E32]/30 flex items-center justify-center text-[#E67E32] text-[11px] font-mono font-bold bg-[#1a1209] group-hover:border-[#E67E32] group-hover:bg-[#E67E32]/10 transition-all shrink-0">
                        {step.step}
                      </span>
                      <Icon className="w-5 h-5 text-[#E67E32]/40 group-hover:text-[#E67E32] transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#e5e5e5] mb-2 group-hover:text-white transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-sm text-[#737373] leading-relaxed group-hover:text-[#a3a3a3] transition-colors">
                        {step.desc}
                      </p>
                    </div>
                    {idx < onboardingSteps.length - 1 && (
                      <div className="md:hidden flex justify-center pt-1">
                        <ArrowRight className="w-4 h-4 text-[#E67E32]/30 rotate-90" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E67E32] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Por que yo */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Por que trabajar conmigo</h2>
            <p className="text-[#a3a3a3] text-sm font-mono">// Tres cosas que no vas a tener que aclarar dos veces.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {differentiators.map(({ icon: Icon, title, desc }, idx) => (
              <div key={idx} className="group bg-[#141414] border border-[#262626] p-6 hover:border-[#E67E32]/50 transition-all duration-300">
                <Icon className="w-6 h-6 text-[#E67E32]/50 mb-4 group-hover:text-[#E67E32] transition-colors" />
                <h4 className="text-white font-bold mb-2">{title}</h4>
                <p className="text-sm text-[#737373] leading-relaxed group-hover:text-[#a3a3a3] transition-colors">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <BlueprintBox coords={{ x: 50, y: 95 }} delay={0.6}>
          <div className="text-center py-10">
            <h3 className="text-2xl font-bold text-white mb-4">
              Tenes un proyecto en mente?
            </h3>
            <p className="text-[#a3a3a3] mb-8 max-w-xl mx-auto">
              Contame que necesitas. La primera consulta es sin cargo y sin compromiso.
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
