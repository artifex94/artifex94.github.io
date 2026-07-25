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
    // artifex-portal/supabase/functions/_shared/pricing.ts, porque el sitio es
    // un build estático y las edge functions corren en Deno, sin módulo común.
    //
    // Este test fija los valores exactos. Si alguien cambia el precio de un solo
    // lado, la suite falla y obliga a tocar el otro. Sin esto, la página podría
    // mostrar un total distinto del que termina cobrando MercadoPago, que es el
    // bug más probable de toda esta funcionalidad.
    expect(MATERIAL_COST_PER_M2).toBe(75_000);
    expect(MIN_MARGIN).toBe(0.5);
    expect(DISCOUNTS.transferencia).toBe(0.15);
    expect(DISCOUNTS.instagram).toBe(0.1);
    expect(MIN_BILLABLE_M2).toBe(0.09);
    expect(MAX_QUOTABLE_M2).toBe(6);
    expect(ROUNDING_STEP).toBe(1_000);
  });
});

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
