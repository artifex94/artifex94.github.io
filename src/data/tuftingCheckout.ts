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
  /** Circular ovalado: eje menor = diámetro / ovalRatio (1 = círculo). */
  ovalRatio?: number;
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

const post = async <T>(
  endpoint: string,
  body: unknown,
  fallbackError = 'No pude iniciar el pago. Probá de nuevo en un rato.',
): Promise<T> => {
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
        : fallbackError;
    throw new Error(message);
  }

  return payload as T;
};

/**
 * Pago único con Checkout Pro.
 *
 * La web cobra siempre el TOTAL: las cuotas (2 o 3 con tarjeta) las ofrece la
 * propia pasarela de MercadoPago según la configuración de la cuenta. No hay
 * plan de pagos propio del sitio.
 */
export const createCheckout = (request: CheckoutRequest): Promise<CheckoutResponse> =>
  post<CheckoutResponse>('tufting-create-preference', request);

// ---- Encargo (todas las formas, con o sin pago online) --------------------
//
// Un encargo captura el diseño, las medidas y el contacto y los deja en el panel
// admin (+ aviso por email). Sirve para las tres formas — sobre todo la
// contorneada, que no se paga online. El precio SIEMPRE lo recalcula el servidor.

/** Tipos de imagen que el bucket de diseños acepta. */
export type DesignImageType = 'image/png' | 'image/jpeg' | 'image/webp';

interface UploadUrlResponse {
  /** Path del archivo dentro del bucket privado. Es lo que se manda al encargo. */
  path: string;
  token: string;
  /** URL firmada de subida (un solo uso). */
  signedUrl: string;
}

export interface OrderRequest {
  shape: Shape;
  diameterCm?: number;
  widthCm?: number;
  heightCm?: number;
  /** Solo para contorneada: área declarada por el cliente (el server la usa de estimación). */
  areaM2?: number;
  ovalRatio?: number;
  colors?: readonly string[];
  /** Nombre del color de borde elegido en el bastidor. */
  borderColor?: string;
  /** Borde grueso (true) o normal (false). */
  borderThick?: boolean;
  /** Rotación del diseño dentro de la forma, en grados. */
  rotationDeg?: number;
  designImagePath?: string;
  referenceImagePath?: string;
  customerNote?: string;
  contact: { name: string; email: string; phone?: string };
  payByTransfer?: boolean;
  discountCode?: string;
}

export interface OrderResponse {
  orderId: string;
}

/** Pide una URL firmada para subir el diseño al bucket privado. */
export const getDesignUploadUrl = (contentType: DesignImageType): Promise<UploadUrlResponse> =>
  post<UploadUrlResponse>(
    'tufting-design-upload-url',
    { contentType },
    'No pude preparar la subida del diseño. Probá de nuevo.',
  );

/** Sube el diseño directo a Storage con la URL firmada (no pasa por la function). */
export const uploadDesign = async (signedUrl: string, file: Blob): Promise<void> => {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!response.ok) {
    throw new Error('No pude subir la imagen del diseño. Probá de nuevo.');
  }
};

/** Crea el encargo: guarda todo en el panel y dispara el aviso por email. */
export const createOrder = (request: OrderRequest): Promise<OrderResponse> =>
  post<OrderResponse>(
    'tufting-create-order',
    request,
    'No pude enviar el encargo. Probá de nuevo en un rato.',
  );

// ---- Pago del encargo (solo total; la seña en cuotas va por suscripción) ---

/** Cuánto del total se paga como seña. */
// Solo 'full': la seña del 50% se eliminó a propósito (el servidor rechaza
// 'half') porque Checkout Pro permite dividir cualquier pago único en cuotas, así
// que "señar la mitad" podía terminar en la mitad EN CUOTAS. La web cobra el
// total, y las cuotas las ofrece la pasarela de MercadoPago.
export type DepositPortion = 'full';

export interface OrderDepositResponse {
  orderId: string;
  /** URL de checkout de MercadoPago a la que redirigir. */
  initPoint: string;
}

/** Error del pago de seña que el UI puede distinguir (ej. MP no configurado). */
export class DepositError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.name = 'DepositError';
    this.code = code;
  }
}

/**
 * Genera el checkout de la seña de un encargo ya creado. El monto (total o
 * mitad) lo calcula el servidor a partir de la orden; el cliente solo elige.
 */
export const payOrderDeposit = async (
  orderId: string,
  portion: DepositPortion,
): Promise<OrderDepositResponse> => {
  const response = await fetch(`${FUNCTIONS_URL}/tufting-order-deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, portion }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const code =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : 'deposit_error';
    throw new DepositError(code);
  }
  return payload as OrderDepositResponse;
};
