import { BORDER_WIDTH_CM, MAX_QUOTABLE_M2 } from './tuftingPricing';

// Formas, medidas y validaciones de la calculadora de tufting.
//
// Todo lo de acá son funciones puras sobre números: no tocan React ni el DOM.
// La UI las usa para decidir si puede avanzar de paso, y el backend de pagos
// recalcula con las mismas fórmulas para no confiar en lo que manda el cliente.

export type Shape = 'contorneada' | 'circular' | 'rectangular';

export interface ShapeOption {
  id: Shape;
  name: string;
  desc: string;
  /** true si la forma exige un PNG con transparencia. */
  requiresAlpha: boolean;
}

export const SHAPE_OPTIONS: readonly ShapeOption[] = [
  {
    id: 'contorneada',
    name: 'Contorneada',
    desc: 'Sigue la silueta de tu diseño, con el borde característico alrededor.',
    requiresAlpha: true,
  },
  {
    id: 'circular',
    name: 'Circular',
    desc: 'Tu diseño dentro de un círculo.',
    requiresAlpha: false,
  },
  {
    id: 'rectangular',
    name: 'Rectangular',
    desc: 'Tu diseño dentro de un rectángulo.',
    requiresAlpha: false,
  },
];

/** Medida mínima de un lado, en cm. Más chico que esto el borde se come la pieza. */
export const MIN_DIMENSION_CM = 25;

/**
 * Medida máxima de un lado, en cm.
 *
 * No es un límite del cálculo sino del bastidor: una pieza más grande hay que
 * tejerla por partes y coserla, y eso se cotiza a mano.
 */
export const MAX_DIMENSION_CM = 300;

export interface Dimensions {
  /** Forma circular: diámetro (eje mayor) de la pieza terminada. */
  diameterCm?: number;
  /**
   * Forma circular: cuánto se estira para hacerla óvalo. 1 = círculo perfecto;
   * >1 achata el eje menor (eje menor = diámetro / ovalRatio).
   */
  ovalRatio?: number;
  /** Forma rectangular: ancho de la pieza terminada. */
  widthCm?: number;
  /** Forma rectangular: alto de la pieza terminada. */
  heightCm?: number;
  /**
   * Forma contorneada: cuánto mide, en la realidad, la distancia entre los dos
   * puntos más separados del DISEÑO (sin contar el borde).
   */
  feretCm?: number;
}

export interface AspectRatio {
  id: string;
  /** Cómo se le muestra al cliente. */
  label: string;
  /** Relación ancho:alto. */
  w: number;
  h: number;
}

/**
 * Proporciones disponibles para el rectángulo, de cuadrado a "caminito".
 *
 * El lado mayor lo fija el slider de tamaño; de la proporción sale el otro lado.
 */
export const ASPECT_RATIOS: readonly AspectRatio[] = [
  { id: '1:1', label: 'Cuadrado 1:1', w: 1, h: 1 },
  { id: '3:2', label: 'Clásico 3:2', w: 3, h: 2 },
  { id: '2:1', label: 'Alargado 2:1', w: 2, h: 1 },
  { id: '3:1', label: 'Reposamuñecas 3:1', w: 3, h: 1 },
  { id: '4:1', label: 'Caminito 4:1', w: 4, h: 1 },
];

export const DEFAULT_ASPECT_RATIO_ID = '3:2';

/** Óvalo máximo: el eje menor no baja de major/OVAL_RATIO_MAX. */
export const OVAL_RATIO_MAX = 2.5;

export const aspectRatioById = (id: string): AspectRatio =>
  ASPECT_RATIOS.find((ratio) => ratio.id === id) ?? ASPECT_RATIOS[0];

/**
 * Medidas del rectángulo a partir de la proporción y el lado mayor (en cm).
 *
 * `sizeCm` es siempre el lado más largo; el otro sale de la relación de aspecto.
 */
export const dimensionsFromAspect = (
  aspectId: string,
  sizeCm: number,
): { widthCm: number; heightCm: number } => {
  const { w, h } = aspectRatioById(aspectId);
  if (w >= h) {
    return { widthCm: sizeCm, heightCm: Math.round((sizeCm * h) / w) };
  }
  return { widthCm: Math.round((sizeCm * w) / h), heightCm: sizeCm };
};

/** Área de una elipse, en m², a partir de sus dos ejes (diámetros) en cm. */
export const ellipseAreaM2 = (majorCm: number, minorCm: number): number =>
  (Math.PI * (majorCm / 2) * (minorCm / 2)) / CM2_PER_M2;

/** Eje menor de la forma circular/ovalada, dado el diámetro y el ovalRatio. */
export const minorAxisCm = (diameterCm: number, ovalRatio?: number): number =>
  diameterCm / (ovalRatio && ovalRatio > 1 ? ovalRatio : 1);

const CM2_PER_M2 = 10_000;

/** Área de un círculo, en m², a partir de su diámetro en cm. */
export const circleAreaM2 = (diameterCm: number): number =>
  (Math.PI * (diameterCm / 2) ** 2) / CM2_PER_M2;

/** Área de un rectángulo, en m², a partir de sus lados en cm. */
export const rectangleAreaM2 = (widthCm: number, heightCm: number): number =>
  (widthCm * heightCm) / CM2_PER_M2;

/**
 * Área de la pieza según su forma.
 *
 * En circular y rectangular las medidas que da el cliente son las de la pieza
 * TERMINADA, así que el borde ya está adentro y no se suma nada. En contorneada
 * el área la mide el pipeline de imagen sobre la silueta ya dilatada, y por eso
 * no se puede calcular con una fórmula cerrada: se recibe hecha.
 */
export const areaM2ForShape = (shape: Shape, dimensions: Dimensions): number | null => {
  if (shape === 'circular') {
    const { diameterCm, ovalRatio } = dimensions;
    if (typeof diameterCm !== 'number') return null;
    // ovalRatio 1 (o ausente) ⇒ eje menor = mayor ⇒ círculo perfecto.
    return ellipseAreaM2(diameterCm, minorAxisCm(diameterCm, ovalRatio));
  }

  if (shape === 'rectangular') {
    const { widthCm, heightCm } = dimensions;
    return typeof widthCm === 'number' && typeof heightCm === 'number'
      ? rectangleAreaM2(widthCm, heightCm)
      : null;
  }

  // Contorneada: el área sale de medir la imagen, no de las dimensiones.
  return null;
};

export interface DimensionIssue {
  field: keyof Dimensions;
  message: string;
}

const validateSide = (
  field: keyof Dimensions,
  label: string,
  value: number | undefined,
): DimensionIssue | null => {
  if (value === undefined || Number.isNaN(value)) {
    return { field, message: `Falta indicar ${label}.` };
  }
  if (!Number.isFinite(value) || value <= 0) {
    return { field, message: `${label} tiene que ser un número mayor a cero.` };
  }
  if (value < MIN_DIMENSION_CM) {
    return { field, message: `El mínimo es ${MIN_DIMENSION_CM} cm.` };
  }
  if (value > MAX_DIMENSION_CM) {
    return {
      field,
      message: `Arriba de ${MAX_DIMENSION_CM} cm la pieza se cotiza a mano: escribime y lo vemos.`,
    };
  }
  return null;
};

/**
 * Revisa las medidas de una forma y devuelve los problemas encontrados.
 *
 * Devuelve una lista (no lanza) porque la UI muestra los errores al lado de cada
 * campo mientras el cliente escribe.
 */
export const validateDimensions = (
  shape: Shape,
  dimensions: Dimensions,
): readonly DimensionIssue[] => {
  const issues: DimensionIssue[] = [];

  if (shape === 'circular') {
    const issue = validateSide('diameterCm', 'el diámetro', dimensions.diameterCm);
    if (issue) issues.push(issue);
    // Al ovalar, el eje menor no puede quedar por debajo del mínimo.
    if (!issue && typeof dimensions.diameterCm === 'number') {
      const minor = minorAxisCm(dimensions.diameterCm, dimensions.ovalRatio);
      if (minor < MIN_DIMENSION_CM) {
        issues.push({
          field: 'diameterCm',
          message: `Ovalada así, el lado corto queda en ${Math.round(minor)} cm (mínimo ${MIN_DIMENSION_CM}). Achicá el óvalo o agrandá la pieza.`,
        });
      }
    }
  }

  if (shape === 'rectangular') {
    const width = validateSide('widthCm', 'el ancho', dimensions.widthCm);
    if (width) issues.push(width);
    const height = validateSide('heightCm', 'el alto', dimensions.heightCm);
    if (height) issues.push(height);
  }

  if (shape === 'contorneada') {
    const issue = validateSide('feretCm', 'la medida más larga', dimensions.feretCm);
    if (issue) issues.push(issue);
  }

  // El techo por lado no alcanza: 300x300 son 9 m², muy por encima del máximo.
  const area = areaM2ForShape(shape, dimensions);
  if (issues.length === 0 && area !== null && area > MAX_QUOTABLE_M2) {
    issues.push({
      field: shape === 'circular' ? 'diameterCm' : 'widthCm',
      message: `Son ${area.toFixed(2)} m². Arriba de ${MAX_QUOTABLE_M2} m² lo cotizo a mano.`,
    });
  }

  return issues;
};

/** Texto legible de las medidas, para el resumen y el mensaje de WhatsApp. */
export const describeDimensions = (shape: Shape, dimensions: Dimensions): string => {
  if (shape === 'circular' && dimensions.diameterCm) {
    const minor = Math.round(minorAxisCm(dimensions.diameterCm, dimensions.ovalRatio));
    return minor === dimensions.diameterCm
      ? `${dimensions.diameterCm} cm de diámetro`
      : `${dimensions.diameterCm} × ${minor} cm (óvalo)`;
  }
  if (shape === 'rectangular' && dimensions.widthCm && dimensions.heightCm) {
    return `${dimensions.widthCm} x ${dimensions.heightCm} cm`;
  }
  if (shape === 'contorneada' && dimensions.feretCm) {
    return `${dimensions.feretCm} cm en su punto más largo, con borde de ${BORDER_WIDTH_CM} cm`;
  }
  return 'medidas a confirmar';
};

/** Nombre legible de la forma. */
export const describeShape = (shape: Shape): string =>
  SHAPE_OPTIONS.find((option) => option.id === shape)?.name ?? shape;
