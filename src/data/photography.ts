// Contenido de la página de Fotografía, separado de la UI igual que business.ts.
//
// CÓMO AGREGAR FOTOS:
// 1. Optimizar la imagen: WebP, lado mayor ≤1600px, calidad ~80 (objetivo <300KB).
// 2. Copiarla a public/photos/<categoria>/ con nombre descriptivo en kebab-case
//    (ej: public/photos/retratos/book-teatro-mendoza-01.webp).
// 3. Agregar una entrada en galleryPhotos con src, alt (¡describir la foto!),
//    categoría y las dimensiones reales en píxeles (evitan saltos de layout).

export type PhotoCategory = 'eventos' | 'retratos' | 'producto' | 'paisaje';

export interface GalleryPhoto {
  src: string;
  alt: string;
  category: PhotoCategory;
  width: number;
  height: number;
}

export interface PhotoPackage {
  name: string;
  target: string;
  price: string;
  includes: string[];
  isFeatured?: boolean;
}

export const photoCategories: { key: PhotoCategory; label: string; desc: string }[] = [
  {
    key: 'eventos',
    label: 'Eventos',
    desc: 'Cobertura de eventos culturales y sociales: el registro fiel de lo que pasó.',
  },
  {
    key: 'retratos',
    label: 'Retratos & Books',
    desc: 'Sesiones personales y books profesionales, en estudio o locación.',
  },
  {
    key: 'producto',
    label: 'Producto',
    desc: 'Fotografía de producto para e-commerce y redes: tu catálogo listo para vender.',
  },
  {
    key: 'paisaje',
    label: 'Paisaje & Arte',
    desc: 'Obra personal de paisaje, disponible como impresión.',
  },
];

// Las fotos reales se agregan siguiendo el instructivo de arriba. Ejemplo:
// {
//   src: '/photos/retratos/book-teatro-mendoza-01.webp',
//   alt: 'Retrato en clave baja de actriz en el teatro Independencia',
//   category: 'retratos',
//   width: 1600,
//   height: 2400,
// },
export const galleryPhotos: GalleryPhoto[] = [];

// EDITAR: precios y alcances de referencia; ajustar antes de publicar.
export const photoPackages: PhotoPackage[] = [
  {
    name: 'Evento',
    target: 'Eventos culturales, sociales y corporativos.',
    price: 'A convenir',
    includes: [
      'Cobertura por hora o jornada completa',
      'Selección y edición profesional',
      'Galería digital privada para descargar',
      'Entrega express de destacadas (24 hs)',
    ],
  },
  {
    name: 'Retrato / Book',
    target: 'Books profesionales, perfiles y sesiones personales.',
    price: 'A convenir',
    includes: [
      'Sesión en estudio o locación',
      'Asesoramiento de vestuario y poses',
      'Fotos editadas en alta resolución',
      'Versiones optimizadas para redes',
    ],
    isFeatured: true,
  },
  {
    name: 'Producto para marcas',
    target: 'Catálogos e-commerce, gastronomía y redes sociales.',
    price: 'A convenir',
    includes: [
      'Fotografía de producto con fondo neutro o ambientada',
      'Optimización para tienda online (peso y formato)',
      'Pack de imágenes para redes',
      'Descuento combinado con el servicio de desarrollo web',
    ],
  },
];
