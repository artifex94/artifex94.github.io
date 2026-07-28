import productRug from '../assets/tufting/product-rug.webp';
import productWristRest from '../assets/tufting/product-wrist-rest.webp';
import productMat from '../assets/tufting/product-mat.webp';
import pathCommission from '../assets/tufting/path-commission.webp';
import pathCollaboration from '../assets/tufting/path-collaboration.webp';
import pathAvailable from '../assets/tufting/path-available.webp';

// Contenido de la página de Tufting, separado de la UI igual que business.ts.
//
// CÓMO AGREGAR LA FOTO REAL DE UNA CATEGORÍA:
// - Cada categoría trae una ilustración tufteada (`image` + `imageIsIllustration`).
// - Cuando tengas la foto real: optimizarla (WebP, ≤1600px, <300KB), guardarla en
//   public/photos/tufting/, setear image: '/photos/tufting/nombre.webp' y sacar
//   `imageIsIllustration` para que el alt vuelva a describir una pieza real.

export interface TuftingCategory {
  id: string;
  title: string;
  desc: string;
  image?: string;
  /** La imagen es una ilustración del formato, no una foto de pieza real. */
  imageIsIllustration?: boolean;
}

export interface TuftingLine {
  title: string;
  desc: string;
  /** Pictograma tufteado decorativo; el texto de la tarjeta lleva la semántica. */
  pictogram: string;
  href: string;
  cta: string;
}

export const tuftingLines: TuftingLine[] = [
  {
    title: 'Piezas por encargo',
    desc: 'Alfombras y tapices a tu medida, para tu casa o tu negocio. Me contás la idea y la dibujamos juntos, o traés tu diseño y yo lo traduzco a lana.',
    pictogram: pathCommission,
    href: '/servicios/tufting/calculadora',
    cta: 'Armarla en el bastidor',
  },
  {
    title: 'Colaboraciones con artistas',
    desc: 'Tu obra, dicha en otro idioma: trabajo con ilustradores y artistas para tejer sus diseños en tufting, en ediciones únicas o series.',
    pictogram: pathCollaboration,
    href: '/servicios/tufting/colaboraciones',
    cta: 'Proponer una colaboración',
  },
  {
    title: 'Piezas disponibles',
    desc: 'Piezas únicas, ya tejidas y terminadas. Cada una existe una sola vez: cuando encuentra casa, no vuelve.',
    pictogram: pathAvailable,
    href: '/servicios/tufting/tienda',
    cta: 'Ver piezas disponibles',
  },
];

export const tuftingCategories: TuftingCategory[] = [
  {
    id: 'alfombra',
    title: 'Alfombra',
    desc: 'Un pedazo de suelo que se vuelve tuyo: del boceto a tus pies.',
    image: productRug,
    imageIsIllustration: true,
  },
  {
    id: 'reposamunecas',
    title: 'Reposamuñecas',
    desc: 'Lo infinito en lo chiquito: suave, práctico y con tu toque, al lado del teclado.',
    image: productWristRest,
    imageIsIllustration: true,
  },
  {
    id: 'tapete',
    title: 'Tapete',
    desc: 'Piezas de pared y de acento: un cuadro que además se puede tocar.',
    image: productMat,
    imageIsIllustration: true,
  },
];
