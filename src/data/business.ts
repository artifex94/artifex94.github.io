// Content model for the /servicios/desarrollo showcase page.
// Data lives here, separated from the UI. Every figure appears exactly once:
// the monthly retainer price is defined solely as RETAINER_PRICE.
import {
  Building2, Stethoscope, UtensilsCrossed, ShoppingBag, Lightbulb, Briefcase,
  MessagesSquare, FileText, Blocks, Rocket,
  MessageSquare, Lock, FolderOpen,
  type LucideIcon,
} from 'lucide-react';

// ── Segments (rubros) ───────────────────────────────────────────────────────
// Each one fuses the old pain copy with a link to its live demo at /business/<slug>.
export interface Segment {
  slug: string;
  icon: LucideIcon;
  title: string;
  /** Short tension line, always visible on the collapsed card. */
  hook: string;
  /** Full pain + how it gets solved, revealed on expand. */
  pain: string;
}

export const segments: Segment[] = [
  {
    slug: 'inmobiliarias',
    icon: Building2,
    title: 'Inmobiliarias',
    hook: 'Los interesados se pierden entre WhatsApps y planillas.',
    pain: 'Sin un sistema propio, cada consulta queda suelta en un chat o una hoja de cálculo. Te armo un catálogo con filtros, fichas de cada propiedad y contacto directo, para que ninguna oportunidad se te escape.',
  },
  {
    slug: 'profesionales',
    icon: Stethoscope,
    title: 'Profesionales',
    hook: 'Te buscan en Google y terminan llamando a otro.',
    pain: 'Tus clientes te buscan online. Sin una presencia clara, llaman al siguiente de la lista. Te pongo visible en días, con tu información ordenada y el turno o la consulta a un clic.',
  },
  {
    slug: 'gastronomia',
    icon: UtensilsCrossed,
    title: 'Gastronomía',
    hook: 'El teléfono no para y los pedidos se traban.',
    pain: 'Un menú digital reduce las llamadas y los errores en los pedidos, y te da presencia local sin depender de las apps de terceros que se quedan con tu margen.',
  },
  {
    slug: 'comercios',
    icon: ShoppingBag,
    title: 'Comercios',
    hook: 'Vendés por WhatsApp, pero sin orden.',
    pain: 'Cada consulta sin un catálogo a mano te consume tiempo. Te ordeno el proceso de venta, lo dejo listo para atender rápido y preparado para escalar cuando el negocio crezca.',
  },
  {
    slug: 'emprendedores',
    icon: Lightbulb,
    title: 'Emprendedores',
    hook: 'Querés validar la idea sin gastar de más.',
    pain: 'Antes de invertir en grande, necesitás captar a tus primeros clientes. Te armo la presencia digital justa para arrancar, salir a la cancha y medir qué funciona de verdad.',
  },
  {
    slug: 'empresas',
    icon: Briefcase,
    title: 'Empresas',
    hook: 'Tus procesos críticos viven en planillas.',
    pain: 'Cuando la operación depende de hojas de cálculo y cadenas de correos, todo se vuelve frágil. Desarrollo sistemas internos y portales a medida que ordenan y sostienen el día a día.',
  },
];

// ── Presencia Digital: three internal levels ────────────────────────────────
export type PresenciaLevelId = 'presencia' | 'contenido' | 'negocio';

export interface PresenciaLevel {
  id: PresenciaLevelId;
  label: string;
  price: string;
  pitch: string;
  features: string[];
}

// Prices in ARS: review periodically for inflation.
export const presenciaLevels: PresenciaLevel[] = [
  {
    id: 'presencia',
    label: 'Presencia',
    price: '$200.000',
    pitch: 'Una web clara que muestra quién sos y qué hacés: tu negocio visible y captando consultas en menos de dos semanas.',
    features: [
      'Sección de servicios o productos orientada a convertir',
      'Formulario de contacto y botón de WhatsApp destacado',
      'Google Maps integrado',
      'Dominio y publicación incluidos',
      'Pensada para el celular, por donde llega la mayoría de tus clientes',
    ],
  },
  {
    id: 'contenido',
    label: 'Contenido',
    price: '$400.000',
    pitch: 'Todo lo de Presencia, más un blog o secciones que actualizás vos mismo, sin depender de nadie.',
    features: [
      'Todo lo de Presencia',
      'Blog o secciones que administrás desde un panel simple',
      'Actualizás el contenido sin llamar a un desarrollador',
      'Optimización básica para aparecer en Google',
      'Soporte prioritario ante cambios de contenido',
    ],
  },
  {
    id: 'negocio',
    label: 'Negocio',
    price: '$600.000',
    pitch: 'Una tienda online completa para vender, gestionar productos y ordenar tu proceso comercial de punta a punta.',
    features: [
      'Todo lo de Contenido',
      'Catálogo de productos con búsqueda y filtros',
      'Gestión de pedidos y stock desde tu propio panel',
      'Medios de pago y WhatsApp integrados',
      'Soporte prioritario y monitoreo activo',
    ],
  },
];

// ── Sistema Web a Medida ────────────────────────────────────────────────────
export interface SistemaTier {
  name: string;
  target: string;
  price: string;
  features: string[];
  badge: string;
}

export const sistemaTier: SistemaTier = {
  name: 'Sistema Web a Medida',
  target: 'Para negocios que necesitan sistematizar su operación: clientes, turnos, catálogos o tableros de control.',
  price: '$1.000.000',
  badge: 'Recomendado',
  features: [
    'Sistema funcionando en 90 días, con soporte incluido el primer año',
    'Panel de administración propio: todo el control desde una pantalla',
    'Base de datos y lógica pensadas para crecer con tu negocio',
    'Usuarios y permisos por rol',
    'Entregas parciales en cada etapa: ves el avance en tiempo real',
    'Acompañamiento mensual después de la entrega',
  ],
};

// ── Monthly retainer: single source of truth, mentioned once on the page ─────
export const RETAINER_PRICE = '$50.000';

// ── Process: four plain-language steps, no dev jargon ───────────────────────
export interface ProcessStep {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const procesoSteps: ProcessStep[] = [
  {
    icon: MessagesSquare,
    title: 'Charlamos',
    desc: 'Una charla para entender tu negocio, el problema y a dónde querés llegar. Sin cargo y sin compromiso.',
  },
  {
    icon: FileText,
    title: 'Te paso una propuesta',
    desc: 'Te llevo alcance, tiempos y un precio fijo cerrado. Sabés exactamente qué recibís antes de arrancar.',
  },
  {
    icon: Blocks,
    title: 'Lo construyo',
    desc: 'Trabajo con entregas parciales. Ves el avance en cada etapa y me vas dando tu opinión sobre la marcha.',
  },
  {
    icon: Rocket,
    title: 'Lo publico y te acompaño',
    desc: 'Sale a producción, te lo entrego funcionando y me quedo cerca para lo que necesites después.',
  },
];

// ── Differentiators ─────────────────────────────────────────────────────────
export interface Differentiator {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const differentiators: Differentiator[] = [
  {
    icon: MessageSquare,
    title: 'Comunicación directa',
    desc: 'Hablás siempre conmigo, sin intermediarios ni tickets, desde el primer mensaje hasta la entrega final.',
  },
  {
    icon: Lock,
    title: 'Precio fijo antes de empezar',
    desc: 'El presupuesto que acordamos es el que pagás. Sin extras sorpresa. Si algo cambia, lo hablamos antes de hacerlo.',
  },
  {
    icon: FolderOpen,
    title: 'El código es tuyo',
    desc: 'Acceso completo al proyecto y su documentación desde el día uno. Si otro desarrollador lo toma, puede hacerlo sin trabas.',
  },
];
