import { describe, it, expect } from 'vitest';
import {
  MATERIAL_COST_PER_M2,
  MIN_MARGIN,
  MAX_DISCOUNT,
  DISCOUNTS,
  LIST_PRICE_PER_M2,
  MIN_BILLABLE_M2,
  MAX_QUOTABLE_M2,
  ROUNDING_STEP,
  MIN_PRICE_ARS,
  MIN_LIST_PRICE_ARS,
  DISCOUNT_MIN_LIST_ARS,
  bestDiscount,
  computePrice,
  markupOverCost,
  formatARS,
  type DiscountId,
} from './tuftingPricing';

/** Todas las combinaciones de descuentos que un cliente puede llegar a tener. */
const DISCOUNT_COMBOS: readonly (readonly DiscountId[])[] = [
  [],
  ['transferencia'],
  ['instagram'],
  ['transferencia', 'instagram'],
  ['instagram', 'transferencia'],
];

const AREAS_M2 = [0.02, 0.05, MIN_BILLABLE_M2, 0.1, 0.25, 0.5, 1, 1.73, 2.5, 4, 6];

describe('constantes derivadas', () => {
  it('deriva MAX_DISCOUNT del descuento más grande de la tabla', () => {
    // Si mañana se agrega un descuento más agresivo, esto lo tiene que reflejar
    // solo, sin que nadie se acuerde de tocar la constante a mano.
    expect(MAX_DISCOUNT).toBe(Math.max(...Object.values(DISCOUNTS)));
  });

  it('despeja LIST_PRICE_PER_M2 desde las constantes, sin hardcodear el número', () => {
    // El test recomputa la fórmula: si alguien reemplaza la derivación por el
    // literal 132353, cambiar MIN_MARGIN rompe este test y se nota.
    const expected = (MATERIAL_COST_PER_M2 * (1 + MIN_MARGIN)) / (1 - MAX_DISCOUNT);
    expect(LIST_PRICE_PER_M2).toBeCloseTo(expected, 6);
  });

  it('deja exactamente el piso de markup cuando se aplica el peor descuento', () => {
    const worstNet = LIST_PRICE_PER_M2 * (1 - MAX_DISCOUNT);
    expect(markupOverCost(worstNet)).toBeCloseTo(MIN_MARGIN, 10);
    expect(worstNet).toBeCloseTo(MATERIAL_COST_PER_M2 * (1 + MIN_MARGIN), 6);
  });
});

describe('coherencia con el backend de pagos', () => {
  it('las constantes coinciden con las del backend de pagos', () => {
    // El precio vive duplicado: acá y en
    // supabase/functions/_shared/pricing.ts (este repo), porque el sitio es
    // un build estático y las edge functions corren en Deno, sin módulo común.
    //
    // Este test fija los valores exactos. Si alguien cambia el precio de un solo
    // lado, la suite falla y obliga a tocar el otro. Sin esto, la página podría
    // mostrar un total distinto del que termina cobrando MercadoPago, que es el
    // bug más probable de toda esta funcionalidad.
    expect(MATERIAL_COST_PER_M2).toBe(75_000);
    expect(MIN_MARGIN).toBe(0.5);
    expect(DISCOUNTS.transferencia).toBe(0.1);
    expect(DISCOUNTS.instagram).toBe(0.05);
    expect(MIN_BILLABLE_M2).toBe(0.09);
    expect(MAX_QUOTABLE_M2).toBe(6);
    expect(ROUNDING_STEP).toBe(1_000);
    expect(MIN_PRICE_ARS).toBe(30_000);
    expect(MIN_LIST_PRICE_ARS).toBe(30_000);
    expect(DISCOUNT_MIN_LIST_ARS.transferencia).toBe(0);
    expect(DISCOUNT_MIN_LIST_ARS.instagram).toBe(150_000);
  });
});

describe('piso de precio', () => {
  it('ninguna pieza baja del piso en su precio de LISTA', () => {
    for (const discounts of DISCOUNT_COMBOS) {
      const chica = computePrice({ areaM2: 0.09, discounts });
      expect(chica.listTotal).toBeGreaterThanOrEqual(MIN_LIST_PRICE_ARS);
      // El total nunca supera la lista, aun con el piso aplicado.
      expect(chica.total).toBeLessThanOrEqual(chica.listTotal);
      // Y no baja más de lo que permite el mejor descuento posible.
      expect(chica.total).toBeGreaterThanOrEqual(MIN_LIST_PRICE_ARS * (1 - MAX_DISCOUNT));
    }
  });

  it('deja que el descuento baje el piso: es precio de lista, no piso final', () => {
    // La regresión del bug reportado: con el piso aplicado DESPUÉS del descuento,
    // una pieza de 25x25 daba $30.000 de lista y $30.000 con transferencia.
    const chica = computePrice({ areaM2: 0.0625, discounts: ['transferencia'] });
    expect(chica.listTotal).toBe(30_000);
    expect(chica.total).toBe(27_000);
    expect(chica.appliedDiscount).toBe('transferencia');
    expect(chica.total).toBeLessThan(chica.listTotal);
  });

  it('sin descuento, la pieza chica queda en el piso y no informa descuento', () => {
    const chica = computePrice({ areaM2: 0.0625 });
    expect(chica.listTotal).toBe(30_000);
    expect(chica.total).toBe(30_000);
    expect(chica.appliedDiscount).toBeNull();
    expect(chica.discountRate).toBe(0);
  });

  it('el piso no afecta a las piezas que ya superan el mínimo', () => {
    const grande = computePrice({ areaM2: 2 });
    expect(grande.total).toBeGreaterThan(MIN_PRICE_ARS);
  });

  it('nunca informa un descuento que no bajó el total', () => {
    for (const areaM2 of AREAS_M2) {
      for (const discounts of DISCOUNT_COMBOS) {
        const price = computePrice({ areaM2, discounts });
        if (price.appliedDiscount) {
          expect(
            price.total,
            `área ${areaM2} informó ${price.appliedDiscount} sin bajar el total`,
          ).toBeLessThan(price.listTotal);
        } else {
          expect(price.total).toBe(price.listTotal);
        }
      }
    }
  });
});

describe('mínimo de compra por descuento', () => {
  it('no aplica el código de Instagram por debajo de $150.000 de lista', () => {
    // 1 m² = $125.000 de lista: no llega.
    const chica = computePrice({ areaM2: 1, discounts: ['instagram'] });
    expect(chica.listTotal).toBe(125_000);
    expect(chica.total).toBe(125_000);
    expect(chica.appliedDiscount).toBeNull();
  });

  it('lo aplica cuando la lista alcanza el mínimo', () => {
    // 1.2 m² = $150.000 justos: elegible.
    const grande = computePrice({ areaM2: 1.2, discounts: ['instagram'] });
    expect(grande.listTotal).toBe(150_000);
    expect(grande.total).toBe(143_000);
    expect(grande.appliedDiscount).toBe('instagram');
  });

  it('la transferencia no tiene mínimo', () => {
    const chica = computePrice({ areaM2: 0.0625, discounts: ['transferencia'] });
    expect(chica.appliedDiscount).toBe('transferencia');
  });

  it('con los dos tildados en pieza chica, gana la transferencia igual', () => {
    const chica = computePrice({ areaM2: 1, discounts: ['instagram', 'transferencia'] });
    expect(chica.appliedDiscount).toBe('transferencia');
    expect(chica.total).toBe(113_000);
  });
});

// Cuotas: no hay lógica propia que testear a propósito. La web cobra el total y
// las cuotas (2 o 3 con tarjeta) las resuelve la pasarela de MercadoPago.

describe('invariante de ganancia', () => {
  it('nunca perfora el piso de markup, para ninguna combinación de área y descuentos', () => {
    for (const areaM2 of AREAS_M2) {
      for (const discounts of DISCOUNT_COMBOS) {
        const { total, billableAreaM2 } = computePrice({ areaM2, discounts });
        const netPerM2 = total / billableAreaM2;

        expect(
          markupOverCost(netPerM2),
          `área ${areaM2} m² con [${discounts.join(', ')}] quedó por debajo del piso`,
        ).toBeGreaterThanOrEqual(MIN_MARGIN);
      }
    }
  });

  it('cobra siempre por encima del costo de materiales', () => {
    for (const areaM2 of AREAS_M2) {
      for (const discounts of DISCOUNT_COMBOS) {
        const { total, billableAreaM2 } = computePrice({ areaM2, discounts });
        expect(total).toBeGreaterThan(billableAreaM2 * MATERIAL_COST_PER_M2);
      }
    }
  });
});

describe('bestDiscount', () => {
  it('no acumula descuentos: gana el mayor', () => {
    expect(bestDiscount(['transferencia', 'instagram'])).toEqual({
      id: 'transferencia',
      rate: DISCOUNTS.transferencia,
    });
  });

  it('es indiferente al orden en que vienen los descuentos', () => {
    expect(bestDiscount(['instagram', 'transferencia'])).toEqual(
      bestDiscount(['transferencia', 'instagram']),
    );
  });

  it('devuelve null sin descuentos', () => {
    expect(bestDiscount([])).toEqual({ id: null, rate: 0 });
    expect(bestDiscount()).toEqual({ id: null, rate: 0 });
  });

  it('ignora ids desconocidos en vez de romper', () => {
    // Estos valores pueden llegar de una URL o del body de un request.
    const sucio = ['no-existe', 'instagram', ''] as unknown as DiscountId[];
    expect(bestDiscount(sucio)).toEqual({ id: 'instagram', rate: DISCOUNTS.instagram });
  });

  it('tolera duplicados', () => {
    expect(bestDiscount(['instagram', 'instagram'])).toEqual({
      id: 'instagram',
      rate: DISCOUNTS.instagram,
    });
  });
});

describe('computePrice', () => {
  it('aplica un solo descuento aunque el cliente califique para los dos', () => {
    const soloTransferencia = computePrice({ areaM2: 1, discounts: ['transferencia'] });
    const ambos = computePrice({ areaM2: 1, discounts: ['transferencia', 'instagram'] });

    expect(ambos.total).toBe(soloTransferencia.total);
    expect(ambos.appliedDiscount).toBe('transferencia');
  });

  it('redondea siempre hacia arriba', () => {
    for (const areaM2 of AREAS_M2) {
      for (const discounts of DISCOUNT_COMBOS) {
        const { total, billableAreaM2 } = computePrice({ areaM2, discounts });
        const { rate } = bestDiscount(discounts);
        const exacto = billableAreaM2 * LIST_PRICE_PER_M2 * (1 - rate);

        expect(total % ROUNDING_STEP).toBe(0);
        expect(total).toBeGreaterThanOrEqual(Math.floor(exacto));
      }
    }
  });

  it('aplica el área mínima facturable a las piezas chicas', () => {
    // Un llavero de 10x10 cm no puede cotizar menos que el bastidor que consume.
    const llavero = computePrice({ areaM2: 0.01 });
    const minima = computePrice({ areaM2: MIN_BILLABLE_M2 });

    expect(llavero.billableAreaM2).toBe(MIN_BILLABLE_M2);
    expect(llavero.total).toBe(minima.total);
  });

  it('marca las piezas grandes para presupuesto manual', () => {
    expect(computePrice({ areaM2: MAX_QUOTABLE_M2 }).requiresManualQuote).toBe(false);
    expect(computePrice({ areaM2: MAX_QUOTABLE_M2 + 0.01 }).requiresManualQuote).toBe(true);
  });

  it('no explota con áreas inválidas', () => {
    for (const areaM2 of [0, -5, NaN, Infinity]) {
      const result = computePrice({ areaM2 });
      expect(result.billableAreaM2).toBe(MIN_BILLABLE_M2);
      expect(Number.isFinite(result.total)).toBe(true);
    }
  });

  it('crece de forma monótona con el área', () => {
    const areas = [0.5, 1, 2, 3];
    const totales = areas.map((areaM2) => computePrice({ areaM2 }).total);
    const ordenados = [...totales].sort((a, b) => a - b);
    expect(totales).toEqual(ordenados);
  });

  it('expone el precio de lista sin descuento junto al total', () => {
    const conDescuento = computePrice({ areaM2: 1, discounts: ['transferencia'] });
    const sinDescuento = computePrice({ areaM2: 1 });

    expect(conDescuento.listTotal).toBe(sinDescuento.total);
    expect(conDescuento.total).toBeLessThan(conDescuento.listTotal);
  });
});

describe('formatARS', () => {
  it('formatea en pesos argentinos sin decimales', () => {
    // es-AR mete un espacio duro (U+00A0) después del símbolo: hay que
    // normalizarlo o la aserción flakea según la versión de ICU.
    const normalizado = formatARS(132_353).replace(/\u00A0/g, ' ');
    expect(normalizado).toContain('$');
    expect(normalizado).toContain('132.353');
    expect(normalizado).not.toContain(',');
  });
});
