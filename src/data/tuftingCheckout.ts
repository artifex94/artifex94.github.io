import type { Shape } from './tuftingCalculator';

// Cliente de las edge functions de pago.
//
// El sitio es estático: no puede hablar con MercadoPago directamente porque eso
// requiere un token privado que quedaría a la vista en el bundle. Estas
// funciones corren en Supabase y son las que tienen la credencial.
//
// IMPORTANTE: acá NO se manda ningún monto, ni siquiera el área. Se mandan las
// medidas crudas y el servidor recalcula el precio con sus propias constantes.
// Un área falsificada abarataría el precio igual de bien que un total
// falsificado, así que ninguno de los dos viaja.

const DEFAULT_FUNCTIONS_URL = 'https://erjyzhefwndkumadlpzr.supabase.co/functions/v1';

/**
 * Base de las edge functions.
 *
 * Se puede sobreescribir con VITE_SUPABASE_FUNCTIONS_URL en el build. Ojo: todo
 * lo que empieza con VITE_ termina en el bundle y es público por definición —
 * ahí solo puede ir la URL, nunca una credencial.
 */
export const FUNCTIONS_URL =
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ?? DEFAULT_FUNCTIONS_URL;

/**
 * Formas que se pueden pagar online.
 *
 * La contorneada queda afuera a propósito: su área sale de medir una imagen, y
 * el servidor no puede reproducir esa medición sin recibir también la máscara.
 * Como no la puede verificar, no la vende: esos presupuestos se cierran por
 * WhatsApp con un link de pago hecho a mano.
 */
export const ONLINE_PAYABLE_SHAPES: readonly Shape[] = ['circular', 'rectangular'];

export const canPayOnline = (shape: Shape | null): boolean =>
  shape !== null && ONLINE_PAYABLE_SHAPES.includes(shape);

export interface CheckoutRequest {
  shape: Shape;
  diameterCm?: number;
  widthCm?: number;
  heightCm?: number;
  woolIds?: readonly string[];
  discountCode?: string;
  payByTransfer?: boolean;
  contact?: { name?: string; email?: string; phone?: string };
}

export interface CheckoutResponse {
  quoteId: string;
  initPoint: string;
}

export interface SubscriptionRequest extends Omit<CheckoutRequest, 'discountCode' | 'payByTransfer'> {
  instalments: number;
  payerEmail: string;
}

export interface SubscriptionResponse extends CheckoutResponse {
  depositArs: number;
  monthlyArs: number;
  instalments: number;
}

const post = async <T>(endpoint: string, body: unknown): Promise<T> => {
  const response = await fetch(`${FUNCTIONS_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : 'No pude iniciar el pago. Probá de nuevo en un rato.';
    throw new Error(message);
  }

  return payload as T;
};

/** Pago único con Checkout Pro. */
export const createCheckout = (request: CheckoutRequest): Promise<CheckoutResponse> =>
  post<CheckoutResponse>('tufting-create-preference', request);

/** Cuotas con débito automático. Sin descuento aplicable. */
export const createSubscription = (
  request: SubscriptionRequest,
): Promise<SubscriptionResponse> =>
  post<SubscriptionResponse>('tufting-create-subscription', request);
