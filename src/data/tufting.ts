import { Home, Palette, ShoppingBag, type LucideIcon } from 'lucide-react';

// Contenido de la página de Tufting, separado de la UI igual que business.ts.
//
// CÓMO AGREGAR PIEZAS:
// - Cada pieza es una entrada en tuftingPieces. Sin `image`, se muestra un
//   placeholder elegante ("Foto próximamente").
// - Cuando tengas la foto: optimizarla (WebP, ≤1600px, <300KB), guardarla en
//   public/photos/tufting/ y setear image: '/photos/tufting/nombre.webp'.
// - status: 'disponible' (se muestra precio), 'vendida' o 'encargo' (pieza de
//   muestra hecha a pedido; sin precio).

export type PieceStatus = 'disponible' | 'vendida' | 'encargo';

export interface TuftingPiece {
  id: string;
  title: string;
  size: string;
  materials: string;
  price?: string;
  status: PieceStatus;
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

// EDITAR: piezas de ejemplo para mostrar la estructura; reemplazar por las reales.
export const tuftingPieces: TuftingPiece[] = [
  {
    id: 'onda-terracota',
    title: 'Onda Terracota',
    size: '60 × 90 cm',
    materials: 'Lana acrílica sobre tela monk’s cloth, base antideslizante',
    price: 'Consultar',
    status: 'disponible',
  },
  {
    id: 'logo-comercio',
    title: 'Logo para comercio',
    size: 'A medida',
    materials: 'Lana acrílica, colores según manual de marca',
    status: 'encargo',
  },
  {
    id: 'retrato-mascota',
    title: 'Retrato de mascota',
    size: '50 × 50 cm',
    materials: 'Lana acrílica, diseño a partir de foto',
    status: 'encargo',
  },
];
