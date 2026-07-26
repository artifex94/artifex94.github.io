import { Home, Palette, ShoppingBag, type LucideIcon } from 'lucide-react';

// Contenido de la página de Tufting, separado de la UI igual que business.ts.
//
// CÓMO AGREGAR LA FOTO REAL DE UNA CATEGORÍA:
// - Cada categoría es una entrada en tuftingCategories. Sin `image`, se
//   muestra el placeholder elegante ("Producto en proceso").
// - Cuando tengas la foto: optimizarla (WebP, ≤1600px, <300KB), guardarla en
//   public/photos/tufting/ y setear image: '/photos/tufting/nombre.webp'.

export interface TuftingCategory {
  id: string;
  title: string;
  desc: string;
  image?: string;
}

export interface TuftingLine {
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  cta: string;
}

export const tuftingLines: TuftingLine[] = [
  {
    title: 'Piezas por encargo',
    desc: 'Alfombras y tapices a tu medida, para tu casa o tu negocio. Me contás la idea y la dibujamos juntos, o traés tu diseño y yo lo traduzco a lana.',
    icon: Home,
    href: '/servicios/tufting/calculadora',
    cta: 'Armarla en el bastidor',
  },
  {
    title: 'Colaboraciones con artistas',
    desc: 'Tu obra, dicha en otro idioma: trabajo con ilustradores y artistas para tejer sus diseños en tufting, en ediciones únicas o series.',
    icon: Palette,
    href: '/servicios/tufting/colaboraciones',
    cta: 'Proponer una colaboración',
  },
  {
    title: 'Piezas disponibles',
    desc: 'Piezas únicas, ya tejidas y terminadas. Cada una existe una sola vez: cuando encuentra casa, no vuelve.',
    icon: ShoppingBag,
    href: '/servicios/tufting/tienda',
    cta: 'Ver piezas disponibles',
  },
];

export const tuftingCategories: TuftingCategory[] = [
  {
    id: 'alfombra',
    title: 'Alfombra',
    desc: 'Un pedazo de suelo que se vuelve tuyo: del boceto a tus pies.',
  },
  {
    id: 'reposamunecas',
    title: 'Reposamuñecas',
    desc: 'Lo infinito en lo chiquito: suave, práctico y con tu toque, al lado del teclado.',
  },
  {
    id: 'tapete',
    title: 'Tapete',
    desc: 'Piezas de pared y de acento: un cuadro que además se puede tocar.',
  },
];
