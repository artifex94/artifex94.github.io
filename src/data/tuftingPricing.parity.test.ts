import { describe, it, expect } from 'vitest';
import {
  computePrice,
  instalmentAmountArs,
  INSTALMENT_OPTIONS,
  MIN_BILLABLE_M2,
  type DiscountId,
} from './tuftingPricing';
// El espejo del servidor no importa nada, así que se puede cargar tal cual.
import * as server from '../../supabase/functions/_shared/pricing';

// El precio vive duplicado (cliente en TS, servidor en Deno) porque no hay módulo
// común entre un build estático y una edge function. El test de constantes de
// tuftingPricing.test.ts fija los valores; este verifica la FÓRMULA COMPLETA, que
// es donde de verdad se puede filtrar la divergencia: que la página muestre un
// total y MercadoPago cobre otro es el peor bug posible de esta funcionalidad.

/** Áreas elegidas para pisar los bordes: el piso de precio, el mínimo facturable y el mínimo del código de Instagram. */
const AREAS_M2 = [0.02, 0.0625, MIN_BILLABLE_M2, 0.1, 0.2, 0.24, 0.2667, 0.5, 1, 1.19, 1.2, 1.21, 2.5, 6];

const COMBOS: readonly (readonly DiscountId[])[] = [
  [],
  ['transferencia'],
  ['instagram'],
  ['transferencia', 'instagram'],
];

describe('paridad de precios entre el sitio y las edge functions', () => {
  it('calcula el mismo total para toda área y combinación de descuentos', () => {
    for (const areaM2 of AREAS_M2) {
      for (const discounts of COMBOS) {
        const client = computePrice({ areaM2, discounts });
        // En el servidor la transferencia entra por `payByTransfer` y el código de
        // Instagram por `discountId`, que solo se otorga con un código validado.
        const remote = server.priceFromArea(areaM2, {
          payByTransfer: discounts.includes('transferencia'),
          discountId: discounts.includes('instagram') ? 'instagram' : undefined,
        });

        const where = `área ${areaM2} m² con [${discounts.join(', ')}]`;
        expect(remote, where).not.toBeNull();
        expect(remote!.amountArs, `${where}: total`).toBe(client.total);
        expect(remote!.listAmountArs, `${where}: lista`).toBe(client.listTotal);
        expect(remote!.discountId, `${where}: descuento`).toBe(client.appliedDiscount);
        expect(remote!.discountRate, `${where}: tasa`).toBe(client.discountRate);
      }
    }
  });

  it('comparte las constantes que definen el precio', () => {
    expect(server.MATERIAL_COST_PER_M2).toBe(75_000);
    expect(server.MIN_MARGIN).toBe(0.5);
    expect(server.MIN_PRICE_ARS).toBe(30_000);
    expect(server.MIN_LIST_PRICE_ARS).toBe(30_000);
    expect(server.DISCOUNT_MIN_LIST_ARS.instagram).toBe(150_000);
    expect(server.DISCOUNT_MIN_LIST_ARS.transferencia).toBe(0);
    expect(server.DISCOUNTS.transferencia).toBe(0.1);
    expect(server.DISCOUNTS.instagram).toBe(0.05);
  });

  it('reparte las cuotas igual en los dos lados', () => {
    for (const areaM2 of AREAS_M2) {
      const { total } = computePrice({ areaM2 });
      for (const instalments of INSTALMENT_OPTIONS) {
        expect(server.instalmentAmountArs(total, instalments)).toBe(
          instalmentAmountArs(total, instalments),
        );
      }
    }
  });

  it('ofrece las mismas cuotas que acepta el servidor', () => {
    // Si divergen, elegir una cuota que el servidor no acepta devuelve un 400 en
    // la cara del cliente justo al momento de pagar.
    expect([...server.INSTALMENT_OPTIONS]).toEqual([...INSTALMENT_OPTIONS]);
    expect(server.INSTALMENT_STEP).toBe(100);
  });

  it('no otorga el descuento por transferencia en el camino de pago online', () => {
    // priceQuote es lo que usan los checkouts: ahí el descuento por transferencia
    // no corresponde, porque se está pagando con MercadoPago.
    const online = server.priceQuote({
      shape: 'rectangular',
      widthCm: 25,
      heightCm: 25,
      payByTransfer: true,
    });
    expect(online!.amountArs).toBe(30_000);
    expect(online!.discountId).toBeNull();

    // En la cotización (que se cierra por WhatsApp) sí se honra.
    const quote = server.priceFromArea(0.0625, { payByTransfer: true });
    expect(quote!.amountArs).toBe(27_000);
    expect(quote!.discountId).toBe('transferencia');
  });

  it('exige el mínimo de compra del código de Instagram también en el servidor', () => {
    // 1 m² = $125.000 de lista: no llega al mínimo, ni con código válido.
    const chica = server.priceQuote(
      { shape: 'rectangular', widthCm: 100, heightCm: 100 },
      ['instagram'],
    );
    expect(chica!.amountArs).toBe(125_000);
    expect(chica!.discountId).toBeNull();

    // 1.2 m² = $150.000 justos: elegible.
    const grande = server.priceQuote(
      { shape: 'rectangular', widthCm: 120, heightCm: 100 },
      ['instagram'],
    );
    expect(grande!.amountArs).toBe(143_000);
    expect(grande!.discountId).toBe('instagram');
  });
});
