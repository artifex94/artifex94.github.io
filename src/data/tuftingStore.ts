import { FUNCTIONS_URL } from './tuftingCheckout';

export interface TuftingProduct {
  id: string;
  name: string;
  description: string;
  priceArs: number;
  imageUrl?: string | null;
}

export interface StoreCheckoutRequest {
  productId: string;
  buyer?: { name?: string; email?: string };
}

export interface StoreCheckoutResponse {
  orderId: string;
  initPoint: string;
}

export type StoreCheckoutErrorCode = 'mp_unavailable' | 'no_disponible';

export class StoreCheckoutError extends Error {
  code: StoreCheckoutErrorCode;

  constructor(code: StoreCheckoutErrorCode) {
    super(code);
    this.name = 'StoreCheckoutError';
    this.code = code;
  }
}

const postStore = async <T>(endpoint: string, body: unknown): Promise<T> => {
  const response = await fetch(`${FUNCTIONS_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : 'store_error';

    if (error === 'mp_unavailable' || error === 'no_disponible') {
      throw new StoreCheckoutError(error);
    }

    throw new Error('No pude preparar la compra. Probá de nuevo en un rato.');
  }

  return payload as T;
};

export const listTuftingProducts = async (): Promise<TuftingProduct[]> => {
  const payload = await postStore<{ products: TuftingProduct[] }>('tufting-list-products', {});
  return payload.products;
};

export const createStoreCheckout = (
  request: StoreCheckoutRequest,
): Promise<StoreCheckoutResponse> => postStore<StoreCheckoutResponse>('tufting-store-checkout', request);

export interface CollaborationRequest {
  name: string;
  contact: string;
  proposal: string;
  references?: string;
}

export const sendTuftingCollaboration = (request: CollaborationRequest): Promise<{ ok: true }> =>
  postStore<{ ok: true }>('tufting-collab', request);
