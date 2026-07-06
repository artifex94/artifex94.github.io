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
}

export const tuftingLines: TuftingLine[] = [
  {
    title: 'Piezas por encargo',
    desc: 'Alfombras y tapices personalizados para tu casa o tu negocio: diseñamos juntos la pieza, o traés tu propio diseño y lo tejo.',
    icon: Home,
  },
  {
    title: 'Colaboraciones con artistas',
    desc: 'Llevá tu obra a la lana: trabajo con ilustradores y artistas para producir sus diseños en tufting, en ediciones únicas o series.',
    icon: Palette,
  },
  {
    title: 'Piezas disponibles',
    desc: 'Piezas únicas ya terminadas, listas para entregar. Lo que ves es lo que hay: cuando se va, se fue.',
    icon: ShoppingBag,
  },
];

export const tuftingCategories: TuftingCategory[] = [
  {
    id: 'alfombra',
    title: 'Alfombra',
    desc: 'Piezas de piso tejidas a mano, del boceto a tu espacio.',
  },
  {
    id: 'reposamunecas',
    title: 'Reposamuñecas',
    desc: 'Compañeros de escritorio: suaves, prácticos y con tu toque.',
  },
  {
    id: 'tapete',
    title: 'Tapete',
    desc: 'Piezas de pared y de acento, para darle calidez a cualquier rincón.',
  },
];
