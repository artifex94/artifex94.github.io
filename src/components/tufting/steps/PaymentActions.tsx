import React, { useState } from 'react';
import { CreditCard, CalendarClock, Loader2, MessageCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import {
  canPayOnline,
  createCheckout,
  createSubscription,
} from '../../../data/tuftingCheckout';
import { formatARS, INSTALLMENT_DEPOSIT_RATE } from '../../../data/tuftingPricing';
import type { Dimensions, Shape } from '../../../data/tuftingCalculator';

interface PaymentActionsProps {
  shape: Shape;
  dimensions: Dimensions;
  /** Colores detectados en el diseño, por nombre. */
  colors: readonly string[];
  payByTransfer: boolean;
  discountCode: string;
  total: number;
  whatsappUrl: string | null;
}

const INSTALMENT_OPTIONS = [3, 6, 12];

// Botones de pago. La forma contorneada no se puede pagar online: el servidor no
// puede recalcular su área sin recibir la máscara de la imagen, así que no puede
// verificar el precio. Esos pedidos se cierran por WhatsApp.
export const PaymentActions: React.FC<PaymentActionsProps> = ({
  shape,
  dimensions,
  colors,
  payByTransfer,
  discountCode,
  total,
  whatsappUrl,
}) => {
  const [busy, setBusy] = useState<'checkout' | 'subscription' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [instalments, setInstalments] = useState(3);

  const online = canPayOnline(shape);
  const deposit = Math.ceil((total * INSTALLMENT_DEPOSIT_RATE) / 1000) * 1000;

  // Solo viajan las medidas crudas: el servidor reprecia todo por su cuenta. Los
  // colores van solo como referencia (el precio no depende de ellos).
  const basePayload = {
    shape: shape as 'circular' | 'rectangular',
    diameterCm: dimensions.diameterCm,
    ovalRatio: dimensions.ovalRatio,
    widthCm: dimensions.widthCm,
    heightCm: dimensions.heightCm,
    woolIds: colors,
  };

  const go = async (kind: 'checkout' | 'subscription') => {
    setBusy(kind);
    setError(null);
    try {
      const result =
        kind === 'checkout'
          ? await createCheckout({
              ...basePayload,
              payByTransfer,
              discountCode: discountCode.trim() || undefined,
            })
          : await createSubscription({ ...basePayload, instalments, payerEmail: email });

      window.location.href = result.initPoint;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pude iniciar el pago.');
      setBusy(null);
    }
  };

  if (!online) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-secondary leading-relaxed">
          Las piezas contorneadas las cierro a mano: te confirmo el diseño, el borde y las medidas
          finales, y te paso el link de pago.
        </p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-accent text-on-accent px-8 py-4 rounded-full font-bold transition-opacity hover:opacity-90 min-h-11"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Encargarlo por WhatsApp
          </a>
        )}
      </div>
    );
  }

  // Jerarquía a propósito: WhatsApp primero, el pago online como opción.
  // Una pieza artesanal se cierra conversando; que la pantalla no se sienta
  // una pasarela de checkout es pedido explícito del dueño.
  return (
    <div className="flex flex-col gap-6">
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-accent text-on-accent px-8 py-4 rounded-full font-bold transition-opacity hover:opacity-90 min-h-11"
        >
          <MessageCircle size={18} aria-hidden="true" />
          Encargarla por WhatsApp
        </a>
      )}

      <p className="text-center text-xs text-secondary uppercase tracking-widest">
        o si preferís, pagala online ahora
      </p>

      <button
        type="button"
        onClick={() => go('checkout')}
        disabled={busy !== null}
        className={cn(
          'inline-flex items-center justify-center gap-2 border border-accent text-accent px-8 py-4 rounded-full font-bold transition-colors min-h-11',
          busy ? 'opacity-60 cursor-wait' : 'hover:bg-accent hover:text-on-accent',
        )}
      >
        {busy === 'checkout' ? (
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        ) : (
          <CreditCard size={18} aria-hidden="true" />
        )}
        Pagar {formatARS(total)}
      </button>

      <details className="border border-line rounded-xl bg-surface">
        <summary className="flex items-center gap-2 p-4 cursor-pointer font-semibold min-h-11">
          <CalendarClock size={16} aria-hidden="true" />
          Pagarlo en cuotas
        </summary>

        <div className="flex flex-col gap-4 p-4 pt-0">
          <p className="text-sm text-secondary leading-relaxed">
            Se debita solo, mes a mes. Arranca con un anticipo de{' '}
            <strong className="text-primary">{formatARS(deposit)}</strong>, que cubre los
            materiales: la pieza se teje a tu medida y no se puede revender.
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="instalments" className="text-sm font-semibold">
              Cantidad de cuotas
            </label>
            <select
              id="instalments"
              value={instalments}
              onChange={(event) => setInstalments(Number(event.target.value))}
              className="bg-base border border-line rounded-lg px-3 py-2 min-h-11 text-primary"
            >
              {INSTALMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} cuotas
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="payer-email" className="text-sm font-semibold">
              Tu email
            </label>
            <input
              id="payer-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vos@email.com"
              className="bg-base border border-line rounded-lg px-3 py-2 min-h-11 text-primary"
            />
          </div>

          <button
            type="button"
            onClick={() => go('subscription')}
            disabled={busy !== null || !email.includes('@')}
            className={cn(
              'inline-flex items-center justify-center gap-2 border border-accent text-accent px-6 py-3 rounded-full font-bold transition-colors min-h-11',
              busy !== null || !email.includes('@')
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-accent hover:text-on-accent',
            )}
          >
            {busy === 'subscription' && (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            )}
            Activar débito automático
          </button>

          <p className="text-xs text-secondary">
            Las cuotas no llevan descuento.
          </p>
        </div>
      </details>

      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
};
