// Datos de la página Business, separados de la UI igual que data.ts
export interface PricingTier {
  name: string;
  target: string;
  setupPrice: string;
  retainerPrice: string;
  features: string[];
  isPopular?: boolean;
}

export interface OnboardingStep {
  step: string;
  title: string;
  desc: string;
}

// Precios en ARS: revisar periódicamente por inflación
export const pricingTiers: PricingTier[] = [
  {
    name: "Presencia",
    target: "Landing page que muestre quién sos y qué hacés: tu negocio visible y captando consultas en menos de 2 semanas.",
    setupPrice: "$200.000 ARS",
    retainerPrice: "$50.000 ARS",
    features: [
      "Sección de servicios o productos clara y orientada a conversión",
      "Formulario de contacto + botón de WhatsApp destacado",
      "Google Maps integrado",
      "Dominio y publicación incluidos",
      "Optimizado para celular: el 80% de tus clientes llegan desde ahí"
    ]
  },
  {
    name: "Contenido",
    target: "Todo lo de Presencia, más un blog o secciones administrables para compartir y actualizar tu contenido vos mismo.",
    setupPrice: "$400.000 ARS",
    retainerPrice: "$50.000 ARS",
    features: [
      "Todo lo incluido en Presencia",
      "Blog o secciones administrables desde un panel simple",
      "Actualización de contenido sin depender de un desarrollador",
      "SEO on-page básico para aparecer en Google",
      "Soporte prioritario ante cambios de contenido"
    ]
  },
  {
    name: "Negocio",
    target: "Tienda web que te permita vender online, gestionar productos y ordenar tu proceso comercial de punta a punta.",
    setupPrice: "$600.000 ARS",
    retainerPrice: "$50.000 ARS",
    features: [
      "Todo lo incluido en Contenido",
      "Catálogo de productos con búsqueda y filtros",
      "Gestión de pedidos y stock desde un panel propio",
      "Integración de medios de pago y WhatsApp",
      "Soporte prioritario y monitorización activa"
    ]
  },
  {
    name: "Sistema Web a Medida",
    target: "Para negocios que necesitan sistematizar operaciones: gestión de clientes, turnos, catálogos o dashboards.",
    setupPrice: "$1.000.000 ARS",
    retainerPrice: "$50.000 ARS",
    features: [
      "Sistema productivo en 90 días, con soporte incluido el primer año",
      "Panel de administración propio: control total desde una sola pantalla",
      "Base de datos y lógica de negocio diseñada para crecer",
      "Autenticación de usuarios y roles",
      "Entregas parciales cada sprint: ves el avance en tiempo real",
      "Mantenimiento mensual incluido post-entrega"
    ],
    isPopular: true
  }
];

export interface DemoPage {
  slug: string;
  label: string;
  desc: string;
}

// Demos interactivas por rubro: mini-sitios de venta en /business/<slug>
export const demoPages: DemoPage[] = [
  { slug: 'inmobiliarias', label: 'Inmobiliarias', desc: 'Listado de propiedades con filtros y fichas.' },
  { slug: 'profesionales', label: 'Profesionales', desc: 'Reserva de turnos online para consultorios.' },
  { slug: 'gastronomia', label: 'Gastronomía', desc: 'Menú digital con categorías y destacados.' },
  { slug: 'comercios', label: 'Comercios', desc: 'Tienda con búsqueda, filtros y favoritos.' },
  { slug: 'emprendedores', label: 'Emprendedores', desc: 'Landing de servicios con planes y precios.' },
  { slug: 'empresas', label: 'Empresas', desc: 'Dashboard de gestión con KPIs y reportes.' },
];

export const onboardingSteps: OnboardingStep[] = [
  { step: "01", title: "Discovery", desc: "Reunión de diagnóstico para entender el negocio, el problema y los objetivos. Sin costo ni compromiso." },
  { step: "02", title: "Propuesta", desc: "Alcance, arquitectura, tiempos y presupuesto fijo detallado. Sin sorpresas después." },
  { step: "03", title: "Desarrollo", desc: "Ciclo de desarrollo con entregas parciales. Ves el avance y das feedback en cada etapa." },
  { step: "04", title: "Entrega & Soporte", desc: "Publicación del sitio en vivo, documentación entregada y transición al plan de mantenimiento." },
];
