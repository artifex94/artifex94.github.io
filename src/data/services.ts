import { Code2, Camera, Scissors, type LucideIcon } from 'lucide-react';
import type { ServiceKey } from './contact';

export interface ServiceSummary {
  id: Exclude<ServiceKey, 'general'>;
  title: string;
  tagline: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** data-theme del servicio: la card del hub se muestra con su propia paleta. */
  theme?: 'fotografia' | 'tufting';
  /** Bordes redondeados para el rubro artesanal. */
  rounded?: boolean;
}

export const services: ServiceSummary[] = [
  {
    id: 'desarrollo',
    title: 'Desarrollo Web',
    tagline: 'Sitios y sistemas a medida',
    description:
      'Sitios web y sistemas para empresas, negocios y emprendedores: presencia digital clara y soporte continuo.',
    href: '/servicios/desarrollo',
    icon: Code2,
  },
  {
    id: 'fotografia',
    title: 'Fotografía',
    tagline: 'Eventos, retratos y producto',
    description:
      'Cobertura de eventos culturales, books y retratos, fotografía de producto para marcas y obra de paisaje.',
    href: '/servicios/fotografia',
    icon: Camera,
    theme: 'fotografia',
  },
  {
    id: 'tufting',
    title: 'Tufting',
    tagline: 'Alfombras y tapices artesanales',
    description:
      'Piezas por encargo para hogar o negocio, colaboraciones con artistas y piezas únicas listas para llevar.',
    href: '/servicios/tufting',
    icon: Scissors,
    theme: 'tufting',
    rounded: true,
  },
];
