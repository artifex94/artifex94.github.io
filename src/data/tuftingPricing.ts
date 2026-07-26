// Precio de las piezas de tufting: única fuente de verdad.
//
// Todo el sitio (calculadora, WhatsApp, edge functions de pago) tiene que salir
// de acá. Si aparece un número de precio hardcodeado en otro archivo, es un bug.
//
// CÓMO AJUSTAR LOS PRECIOS:
// - Sube la lana        -> cambiar MATERIAL_COST_PER_M2
// - Cambia la ganancia  -> cambiar MIN_MARGIN
// - Nuevo descuento     -> agregarlo a DISCOUNTS (y a DiscountId)
// Nada más. LIST_PRICE_PER_M2 y todos los netos se recalculan solos.

/**
 * Costo de materiales por metro cuadrado, en pesos: lana, tela base, antideslizante
 * y pegamento. NO incluye tiempo de trabajo.
 */
export const MATERIAL_COST_PER_M2 = 75_000;

/**
 * Piso de ganancia, expresado como MARKUP SOBRE EL COSTO (no como margen sobre
 * el precio de venta).
 *
 * 0.50 significa "cobrar al menos una vez y media el material". Sobre 75.000 de
 * costo, el piso son 112.500 de neto.
 *
 * OJO: no confundir con "margen sobre venta". Un markup del 50% equivale a un
 * margen del 33% sobre el precio. Son cosas distintas y acá se usa markup.
 */
export const MIN_MARGIN = 0.5;

/** Descuentos disponibles, como fracción del precio de lista. */
export const DISCOUNTS = {
  /** Pago por transferencia o efectivo: no hay comisión de plataforma. */
  transferencia: 0.1,
  /** Código canjeable que se entrega por DM a quien sigue la cuenta. */
  instagram: 0.05,
} as const;

export type DiscountId = keyof typeof DISCOUNTS;

/** Cómo se le nombra cada descuento al cliente. */
export const DISCOUNT_LABELS: Record<DiscountId, string> = {
  transferencia: 'Transferencia o efectivo',
  instagram: 'Código de Instagram',
};

/**
 * Anticipo mínimo para pagar en cuotas, como fracción del total.
 *
 * Una alfombra a medida no se revende: si el débito automático falla en la
 * cuota 3, el material ya está puesto y el diseño es de otra persona. El
 * anticipo tiene que cubrir al menos los materiales.
 */
export const INSTALLMENT_DEPOSIT_RATE = 0.5;

/**
 * El descuento más grande que un cliente puede llegar a aplicar.
 *
 * Se deriva de DISCOUNTS en vez de escribirse a mano: agregar un descuento nuevo
 * más agresivo reajusta el precio de lista solo, sin que nadie se acuerde de
 * tocar esta línea.
 */
export const MAX_DISCOUNT = Math.max(...Object.values(DISCOUNTS));

/**
 * Precio de lista por metro cuadrado.
 *
 * Se despeja HACIA ATRÁS desde el piso de ganancia, para que el peor descuento
 * posible siga dejando MIN_MARGIN sobre el costo:
 *
 *     lista x (1 - MAX_DISCOUNT) >= costo x (1 + MIN_MARGIN)
 *
 * Publicar directamente `costo x (1 + MIN_MARGIN)` sería el error clásico: el
 * primer descuento perfora el piso y se vende por debajo del objetivo.
 */
export const LIST_PRICE_PER_M2 =
  (MATERIAL_COST_PER_M2 * (1 + MIN_MARGIN)) / (1 - MAX_DISCOUNT);

/** Ancho del borde perimetral que lleva toda pieza contorneada, en centímetros. */
export const BORDER_WIDTH_CM = 3;

/**
 * Área mínima facturable, en m² (30x30 cm).
 *
 * Sin este piso, un llavero de 10x10 cm cotiza ~1.300 pesos: menos que el
 * bastidor, el pegamento y el rato de trabajo. El área chica se cobra igual que
 * MIN_BILLABLE_M2.
 */
export const MIN_BILLABLE_M2 = 0.09;

/** Arriba de esta área no se cotiza automático: se deriva a presupuesto manual. */
export const MAX_QUOTABLE_M2 = 6;

/** Todos los totales se redondean hacia arriba a este múltiplo, en pesos. */
export const ROUNDING_STEP = 1_000;

/**
 * Precio mínimo de cualquier pieza, en pesos.
 *
 * Por debajo de esto no se toma el trabajo: montar el bastidor, preparar la
 * lana y el rato mínimo de taller no bajan aunque la pieza sea chica. Se aplica
 * como piso final, después de calcular y de aplicar descuentos.
 */
export const MIN_PRICE_ARS = 30_000;

export interface PriceInput {
  /** Área de la pieza terminada, en m², con el borde ya incluido. */
  areaM2: number;
  /** Descuentos que el cliente eligió. NO se acumulan: gana el mayor. */
  discounts?: readonly DiscountId[];
}

export interface PriceResult {
  /** Total a cobrar en pesos, ya redondeado. */
  total: number;
  /** Precio antes de aplicar descuento, ya redondeado. */
  listTotal: number;
  /** Área que se terminó cobrando (puede ser mayor a la real por MIN_BILLABLE_M2). */
  billableAreaM2: number;
  /** El descuento que ganó, o null si no aplicó ninguno. */
  appliedDiscount: DiscountId | null;
  /** La fracción de ese descuento (0 si no hay). */
  discountRate: number;
  /** true si la pieza excede MAX_QUOTABLE_M2 y hay que cotizarla a mano. */
  requiresManualQuote: boolean;
}

/** Redondeo hacia arriba al múltiplo indicado. Nunca hacia abajo: comería margen. */
const roundUpTo = (value: number, step: number): number => {
  // La epsilon evita que 66000.0000001 (basura de punto flotante) salte a 67000.
  const EPSILON = 1e-9;
  return Math.ceil(value / step - EPSILON) * step;
};

/**
 * Elige el mejor descuento aplicable. Los descuentos NO se acumulan: si el
 * cliente califica para varios, se le da el más conveniente y nada más.
 *
 * Ignora ids desconocidos en vez de romper, porque estos valores pueden venir de
 * una URL o del body de un request.
 */
export const bestDiscount = (
  discounts: readonly DiscountId[] = [],
): { id: DiscountId | null; rate: number } => {
  let id: DiscountId | null = null;
  let rate = 0;

  for (const candidate of discounts) {
    const candidateRate = DISCOUNTS[candidate];
    if (typeof candidateRate !== 'number') continue; // id desconocido
    if (candidateRate > rate) {
      id = candidate;
      rate = candidateRate;
    }
  }

  return { id, rate };
};

/** Calcula el precio de una pieza. Función pura: mismo input, mismo output. */
export const computePrice = ({ areaM2, discounts = [] }: PriceInput): PriceResult => {
  const safeArea = Number.isFinite(areaM2) && areaM2 > 0 ? areaM2 : 0;
  const billableAreaM2 = Math.max(safeArea, MIN_BILLABLE_M2);
  const { id, rate } = bestDiscount(discounts);

  // Piso de precio: ninguna pieza baja de MIN_PRICE_ARS, ni en lista ni con el
  // mejor descuento. Como el piso sube ambos por igual, se mantiene total <= lista.
  const listTotal = Math.max(roundUpTo(billableAreaM2 * LIST_PRICE_PER_M2, ROUNDING_STEP), MIN_PRICE_ARS);
  const total = Math.max(
    roundUpTo(billableAreaM2 * LIST_PRICE_PER_M2 * (1 - rate), ROUNDING_STEP),
    MIN_PRICE_ARS,
  );

  return {
    total,
    listTotal,
    billableAreaM2,
    appliedDiscount: id,
    discountRate: rate,
    requiresManualQuote: safeArea > MAX_QUOTABLE_M2,
  };
};

/**
 * Markup sobre el costo que deja un neto por m² dado.
 *
 * Existe para que los tests puedan verificar el invariante de ganancia. La UI
 * NUNCA muestra este número: el cliente ve un total y nada más.
 */
export const markupOverCost = (netPricePerM2: number): number =>
  (netPricePerM2 - MATERIAL_COST_PER_M2) / MATERIAL_COST_PER_M2;

const arsFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

/** Formatea un monto en pesos argentinos, sin decimales. */
export const formatARS = (amount: number): string => arsFormatter.format(amount);
