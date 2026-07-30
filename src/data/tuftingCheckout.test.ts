import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  canPayOnline,
  createOrder,
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

// createCheckout (pago directo desde el presupuesto) ya no existe: el pago
// online aparece recién después de enviar el encargo, cobrando la orden que ya
// quedó registrada en el panel. Las reglas que cubrían sus tests viven ahora
// sobre createOrder, que es el único camino.
describe('createOrder', () => {
  const encargo = {
    shape: 'rectangular' as const,
    widthCm: 100,
    heightCm: 200,
    contact: { name: 'Clienta', email: 'c@example.com' },
  };

  it('llama a la edge function del encargo', async () => {
    const spy = mockFetch({ orderId: 'abc' });

    await createOrder(encargo);

    expect(spy).toHaveBeenCalledWith(
      `${FUNCTIONS_URL}/tufting-create-order`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('NUNCA manda un monto en las formas que se pagan online', async () => {
    // Es la regla central del diseño: el servidor reprecia todo desde las
    // medidas crudas. Si acá se filtrara un total, alcanzaría con editarlo en
    // DevTools para comprar una alfombra a cualquier precio. (La contorneada sí
    // declara su área, pero esa forma no se paga online: es solo estimación.)
    const spy = mockFetch({ orderId: 'abc' });

    await createOrder(encargo);

    const body = JSON.parse(spy.mock.calls[0][1].body as string);
    expect(body).not.toHaveProperty('amount');
    expect(body).not.toHaveProperty('amountArs');
    expect(body).not.toHaveProperty('total');
    expect(body).toMatchObject({ shape: 'rectangular', widthCm: 100, heightCm: 200 });
  });

  it('propaga el mensaje de error del servidor', async () => {
    mockFetch({ error: 'Ese código no es válido o ya se usó.' }, false);

    await expect(createOrder(encargo)).rejects.toThrow(/no es válido/i);
  });

  it('da un mensaje legible si el servidor no devuelve JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: () => Promise.reject(new Error('boom')) }),
    );

    await expect(createOrder(encargo)).rejects.toThrow(/no pude enviar el encargo/i);
  });
});

// createSubscription ya no existe: la web cobra el total con Checkout Pro y las
// cuotas (2 o 3 con tarjeta) las ofrece la propia pasarela de MercadoPago.
