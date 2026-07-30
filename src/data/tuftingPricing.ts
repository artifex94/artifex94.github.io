// Precio de las piezas de tufting: única fuente de verdad.
//
// Todo el sitio (calculadora, WhatsApp, edge functions de pago) tiene que salir
// de acá. Si aparece un número de precio hardcodeado en otro archivo, es un bug.
//
// CÓMO AJUSTAR LOS PRECIOS:
// - Sube la lana        -> cambiar MATERIAL_COST_PER_M2
// - Cambia la ganancia  -> cambiar MIN_MARGIN
// - Nuevo descuento     -> agregarlo a DISCOUNTS (y a DISCOUNT_LABELS y a
//                          DISCOUNT_MIN_LIST_ARS)
// - Otras cuotas        -> cambiar INSTALMENT_OPTIONS
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
 * Total de LISTA mínimo para que cada descuento sea elegible. 0 = sin mínimo.
 *
 * El código de Instagram es un premio para encargos grandes: en una pieza de
 * $30.000 no da el número. Se evalúa contra el total de lista, que es el precio
 * que el cliente ve antes de descuentos.
 *
 * OJO: MAX_DISCOUNT ignora estos mínimos a propósito. Si algún día el descuento
 * condicionado fuera el más grande, el precio de lista se despejaría con él
 * aunque no siempre aplique: se infla la lista para todos, que es el lado
 * conservador del error (nunca se cobra de menos).
 */
export const DISCOUNT_MIN_LIST_ARS: Record<DiscountId, number> = {
  transferencia: 0,
  instagram: 150_000,
};

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
 * Precio de lista mínimo de cualquier pieza, en pesos.
 *
 * Por debajo de esto no se toma el trabajo: montar el bastidor, preparar la lana
 * y el rato mínimo de taller no bajan aunque la pieza sea chica.
 */
export const MIN_PRICE_ARS = 30_000;

/**
 * Piso al que no baja el cálculo por área, ANTES de aplicar descuentos.
 *
 * Que el piso vaya antes y no después es todo el asunto: aplicándolo al final,
 * una pieza chica daba $30.000 de lista y $30.000 con descuento, o sea el 10%
 * por transferencia quedaba en cero y la UI tachaba un precio igual al total.
 *
 * Acá los $30.000 son PRECIO DE LISTA: el descuento puede bajarlos (25x25 cm con
 * transferencia sale $27.000), y a cambio no sube ningún precio del catálogo. Si
 * el criterio cambia a "nunca cobrar menos de $30.000, ni con descuento", esta
 * línea pasa a `MIN_PRICE_ARS / (1 - MAX_DISCOUNT)` y no se toca nada más.
 */
export const MIN_LIST_PRICE_ARS = MIN_PRICE_ARS;

/**
 * Cuotas que se ofrecen para el débito automático.
 *
 * El taller hace 2 o 3 y nada más: un plan largo lo obliga a financiar meses de
 * trabajo ya entregado. Esta lista la comparten la UI y la edge function que
 * crea la suscripción en MercadoPago.
 */
export const INSTALMENT_OPTIONS = [2, 3] as const;

/** Se deriva de INSTALMENT_OPTIONS: es la cuota más baja que se puede ofrecer. */
export const MAX_INSTALMENTS = Math.max(...INSTALMENT_OPTIONS);

/**
 * Paso de redondeo de la cuota mensual, más fino que ROUNDING_STEP a propósito.
 *
 * MercadoPago cobra un monto fijo en todas las repeticiones de un débito
 * automático, así que las cuotas tienen que ser iguales y la suma redondeada
 * termina arriba del total. Con paso de $1.000 el sobrante llegaba a $2.000 en 3
 * cuotas; con $100 queda por debajo de $300, siempre a favor del taller.
 */
export const INSTALMENT_STEP = 100;

/** Cuota mensual para un total dado. Espejada en supabase/functions/_shared/pricing.ts. */
export const instalmentAmountArs = (totalArs: number, instalments: number): number => {
  const safeInstalments = Math.max(Math.trunc(instalments), 1);
  return Math.ceil(totalArs / safeInstalments / INSTALMENT_STEP) * INSTALMENT_STEP;
};

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
  /** El descuento que efectivamente bajó el total, o null si ninguno lo bajó. */
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
 *
 * `listTotalArs` decide la elegibilidad por monto (DISCOUNT_MIN_LIST_ARS). El
 * default sin límite mantiene el contrato viejo para quien solo quiera saber qué
 * tasa gana entre varias.
 */
export const bestDiscount = (
  discounts: readonly DiscountId[] = [],
  listTotalArs: number = Number.POSITIVE_INFINITY,
): { id: DiscountId | null; rate: number } => {
  let id: DiscountId | null = null;
  let rate = 0;

  for (const candidate of discounts) {
    const candidateRate = DISCOUNTS[candidate];
    if (typeof candidateRate !== 'number') continue; // id desconocido
    // El filtro solo recorta candidatos: sigue ganando el mayor de los que quedan.
    if (listTotalArs < (DISCOUNT_MIN_LIST_ARS[candidate] ?? 0)) continue;
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

  // El orden importa. El piso se aplica a la base ANTES de descontar, y la lista
  // se calcula antes de mirar descuentos porque la elegibilidad de algunos
  // depende de ella.
  const baseArs = Math.max(billableAreaM2 * LIST_PRICE_PER_M2, MIN_LIST_PRICE_ARS);
  const listTotal = roundUpTo(baseArs, ROUNDING_STEP);
  const { id, rate } = bestDiscount(discounts, listTotal);
  // Se descuenta sobre la base sin redondear: descontar sobre la lista redondeada
  // haría que el cliente pague un peldaño más de lo prometido.
  const total = roundUpTo(baseArs * (1 - rate), ROUNDING_STEP);
  // El descuento que EFECTIVAMENTE bajó el total. Si no bajó nada no se informa,
  // así la UI no tacha un precio igual al total ni el WhatsApp promete un
  // descuento de cero.
  const applied = total < listTotal ? id : null;

  return {
    total,
    listTotal,
    billableAreaM2,
    appliedDiscount: applied,
    discountRate: applied ? rate : 0,
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
