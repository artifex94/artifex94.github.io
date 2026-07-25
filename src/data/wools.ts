import { hexToRgb, srgbToLab, type Lab, type Rgb } from '../utils/color';

// Paleta de lanas disponibles para tufting.
//
// Es la lista de colores REALES que hay en el taller. El diseño que sube el
// cliente se remapea contra esta paleta: no se le muestra un espectro completo
// porque no se puede tejer un color que no existe en el cono.
//
// ATENCIÓN: los colores de abajo son PROVISORIOS. Hay que reemplazarlos por las
// lanas que Ramiro tiene realmente en stock antes de publicar la calculadora.
//
// CÓMO ACTUALIZAR LA PALETA:
// - Cada lana necesita id (estable, se guarda en los pedidos), name (lo que ve
//   el cliente), code (el del proveedor, para comprar) y hex.
// - El hex conviene sacarlo de una foto de la lana con luz neutra, no del
//   catálogo del proveedor: el color impreso miente bastante.
// - `rgb` y `lab` se calculan solos. No hay que escribirlos a mano.
// - Para dar de baja una lana sin perder el histórico de pedidos, poner
//   available: false en vez de borrar la entrada.

export interface Wool {
  /** Identificador estable. Se guarda en los pedidos: no cambiarlo nunca. */
  id: string;
  /** Nombre que ve el cliente. */
  name: string;
  /** Código del proveedor, para reponer stock. */
  code: string;
  /** Color en hexadecimal, medido de la lana real. */
  hex: string;
  /** Derivado de hex. */
  rgb: Rgb;
  /** Derivado de hex. Es contra esto que se hace el matching perceptual. */
  lab: Lab;
  /** false para lanas discontinuadas: dejan de ofrecerse pero no se borran. */
  available: boolean;
}

interface WoolSeed {
  id: string;
  name: string;
  code: string;
  hex: string;
  available?: boolean;
}

// PROVISORIO: reemplazar por el stock real del taller.
const WOOL_SEEDS: readonly WoolSeed[] = [
  { id: 'blanco-crudo', name: 'Blanco crudo', code: 'AC-100', hex: '#f4f1ea' },
  { id: 'crema', name: 'Crema', code: 'AC-105', hex: '#e8dcc4' },
  { id: 'arena', name: 'Arena', code: 'AC-112', hex: '#c9b18c' },
  { id: 'caramelo', name: 'Caramelo', code: 'AC-120', hex: '#a9713f' },
  { id: 'chocolate', name: 'Chocolate', code: 'AC-128', hex: '#5b3a2a' },
  { id: 'negro', name: 'Negro', code: 'AC-199', hex: '#1a1a1a' },
  { id: 'gris-perla', name: 'Gris perla', code: 'AC-140', hex: '#b8b5b0' },
  { id: 'gris-topo', name: 'Gris topo', code: 'AC-145', hex: '#6e6a66' },
  { id: 'terracota', name: 'Terracota', code: 'AC-210', hex: '#c25e4c' },
  { id: 'rojo', name: 'Rojo', code: 'AC-220', hex: '#b3272d' },
  { id: 'rosa-viejo', name: 'Rosa viejo', code: 'AC-232', hex: '#d99a9a' },
  { id: 'mostaza', name: 'Mostaza', code: 'AC-240', hex: '#e0a72c' },
  { id: 'naranja', name: 'Naranja', code: 'AC-245', hex: '#e2703a' },
  { id: 'verde-oliva', name: 'Verde oliva', code: 'AC-310', hex: '#6b7a45' },
  { id: 'verde-bosque', name: 'Verde bosque', code: 'AC-320', hex: '#2f5d45' },
  { id: 'verde-agua', name: 'Verde agua', code: 'AC-330', hex: '#8fbfae' },
  { id: 'celeste', name: 'Celeste', code: 'AC-410', hex: '#8fb4d9' },
  { id: 'azul-noche', name: 'Azul noche', code: 'AC-425', hex: '#2b3f6b' },
  { id: 'violeta', name: 'Violeta', code: 'AC-510', hex: '#7a4a86' },
  { id: 'lila', name: 'Lila', code: 'AC-515', hex: '#b9a0cc' },
];

/** Completa cada lana con su representación en RGB y CIELAB. */
const hydrate = ({ available = true, ...seed }: WoolSeed): Wool => {
  const rgb = hexToRgb(seed.hex);
  return { ...seed, rgb, lab: srgbToLab(rgb), available };
};

export const wools: readonly Wool[] = WOOL_SEEDS.map(hydrate);

/** Solo las lanas que hay en stock. Es la paleta contra la que se cuantiza. */
export const availableWools = (): readonly Wool[] => wools.filter((wool) => wool.available);

/** Busca una lana por id. Devuelve undefined si no existe. */
export const woolById = (id: string): Wool | undefined => wools.find((wool) => wool.id === id);

/**
 * Lana del borde por defecto.
 *
 * El borde perimetral suele hacerse en un color liso que contraste con el
 * diseño; el cliente puede cambiarlo, pero conviene arrancar con algo neutro.
 */
export const DEFAULT_BORDER_WOOL_ID = 'negro';

/**
 * Máximo de lanas por pieza.
 *
 * No es una limitación técnica sino de taller: cada color extra es recargar la
 * pistola, un cono más que comprar y sobrante que queda sin usar. Arriba de este
 * número la pieza deja de ser rentable aunque el área sea la misma.
 */
export const MAX_WOOLS_PER_PIECE = 6;
