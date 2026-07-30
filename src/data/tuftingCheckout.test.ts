import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  canPayOnline,
  createCheckout,
  ONLINE_PAYABLE_SHAPES,
  FUNCTIONS_URL,
} from './tuftingCheckout';

const mockFetch = (response: unknown, ok = true) => {
  const spy = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(response),
  });
  vi.stubGlobal('fetch', spy);
  return spy;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('canPayOnline', () => {
  it('deja pagar online las formas que el servidor puede verificar', () => {
    expect(canPayOnline('circular')).toBe(true);
    expect(canPayOnline('rectangular')).toBe(true);
  });

  it('NO deja pagar online una pieza contorneada', () => {
    // Su área sale de medir una imagen: el servidor no la puede recalcular sin
    // recibir la máscara, así que no puede confiar en el precio.
    expect(canPayOnline('contorneada')).toBe(false);
    expect(ONLINE_PAYABLE_SHAPES).not.toContain('contorneada');
  });

  it('maneja el caso sin forma elegida', () => {
    expect(canPayOnline(null)).toBe(false);
  });
});

describe('createCheckout', () => {
  it('llama a la edge function y devuelve el punto de pago', async () => {
    const spy = mockFetch({ quoteId: 'abc', initPoint: 'https://mp/checkout' });

    const result = await createCheckout({ shape: 'circular', diameterCm: 80 });

    expect(spy).toHaveBeenCalledWith(
      `${FUNCTIONS_URL}/tufting-create-preference`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.initPoint).toBe('https://mp/checkout');
  });

  it('NUNCA manda un monto ni un área', async () => {
    // Es la regla central del diseño: el servidor reprecia todo desde las
    // medidas crudas. Si acá se filtrara un total o un área, alcanzaría con
    // editarlos en DevTools para comprar una alfombra a cualquier precio.
    const spy = mockFetch({ quoteId: 'abc', initPoint: 'https://mp/checkout' });

    await createCheckout({ shape: 'rectangular', widthCm: 100, heightCm: 200 });

    const body = JSON.parse(spy.mock.calls[0][1].body as string);
    expect(body).not.toHaveProperty('amount');
    expect(body).not.toHaveProperty('amountArs');
    expect(body).not.toHaveProperty('total');
    expect(body).not.toHaveProperty('areaM2');
    expect(body).toMatchObject({ shape: 'rectangular', widthCm: 100, heightCm: 200 });
  });

  it('propaga el mensaje de error del servidor', async () => {
    mockFetch({ error: 'Ese código no es válido o ya se usó.' }, false);

    await expect(createCheckout({ shape: 'circular', diameterCm: 80 })).rejects.toThrow(
      /no es válido/i,
    );
  });

  it('da un mensaje legible si el servidor no devuelve JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: () => Promise.reject(new Error('boom')) }),
    );

    await expect(createCheckout({ shape: 'circular', diameterCm: 80 })).rejects.toThrow(
      /probá de nuevo/i,
    );
  });
});

// createSubscription ya no existe: la web cobra el total con Checkout Pro y las
// cuotas (2 o 3 con tarjeta) las ofrece la propia pasarela de MercadoPago.
