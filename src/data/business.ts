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

export const onboardingSteps: OnboardingStep[] = [
  { step: "01", title: "Discovery", desc: "Auditoría técnica profunda y trazado del plan de acción enfocado en el CRO." },
  { step: "02", title: "Propuesta", desc: "Definición de arquitectura de datos, estimación de ROI e hitos de proyecto." },
  { step: "03", title: "Desarrollo", desc: "Sprints ágiles semanales para desacoplar e integrar Next.js con Shopify." },
  { step: "04", title: "Lanzamiento", desc: "Despliegue a producción y entrada al ciclo de Retainer para escalabilidad." },
];
