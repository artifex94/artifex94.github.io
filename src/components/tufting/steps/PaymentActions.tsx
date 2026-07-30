import React, { useState } from 'react';
import { CreditCard, Loader2, MessageCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { canPayOnline, createCheckout } from '../../../data/tuftingCheckout';
import { formatARS } from '../../../data/tuftingPricing';
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

// Botones de pago. La forma contorneada no se puede pagar online: el servidor no
// puede recalcular su área sin recibir la máscara de la imagen, así que no puede
// verificar el precio. Esos pedidos se cierran por WhatsApp.
//
// Tampoco se paga online eligiendo transferencia o efectivo: ese 10% existe
// porque no hay comisión de plataforma, así que cobrarlo con tarjeta sería
// regalar el descuento y pagar la comisión encima.
//
// Las cuotas NO viven acá: la web cobra siempre el total, y es la pasarela de
// MercadoPago la que le ofrece al cliente dividirlo en 2 o 3 cuotas con su
// tarjeta, según la configuración de la cuenta. No hay plan de pagos propio.
export const PaymentActions: React.FC<PaymentActionsProps> = ({
  shape,
  dimensions,
  colors,
  payByTransfer,
  discountCode,
  total,
  whatsappUrl,
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const online = canPayOnline(shape);

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      // Solo viajan las medidas crudas: el servidor reprecia todo por su cuenta.
      // Los colores van solo como referencia (el precio no depende de ellos).
      const result = await createCheckout({
        shape: shape as 'circular' | 'rectangular',
        diameterCm: dimensions.diameterCm,
        ovalRatio: dimensions.ovalRatio,
        widthCm: dimensions.widthCm,
        heightCm: dimensions.heightCm,
        woolIds: colors,
        // El servidor lo ignora en este camino (ver _shared/pricing.ts); se
        // manda igual para que la cotización quede registrada tal cual.
        payByTransfer,
        discountCode: discountCode.trim() || undefined,
      });

      window.location.href = result.initPoint;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pude iniciar el pago.');
      setBusy(false);
    }
  };

  const whatsappButton = whatsappUrl && (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 bg-accent text-on-accent px-8 py-4 rounded-full font-bold transition-opacity hover:opacity-90 min-h-11"
    >
      <MessageCircle size={18} aria-hidden="true" />
      Encargarla por WhatsApp
    </a>
  );

  if (!online) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-secondary leading-relaxed">
          Las piezas contorneadas se cierran conversando: te confirmo el diseño, el borde y las
          medidas finales, y te paso el link de pago.
        </p>
        {whatsappButton}
      </div>
    );
  }

  // Eligió transferencia o efectivo: el descuento es para ese medio, así que el
  // pago con tarjeta no va. Se le dice por qué y cómo destildarlo.
  if (payByTransfer) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-secondary leading-relaxed">
          Elegiste transferencia o efectivo, y por eso el 10% off: escribime y te paso los datos
          para transferir. Si preferís pagar con tarjeta ahora mismo, destildá esa opción y el botón
          de pago vuelve.
        </p>
        {whatsappButton}
      </div>
    );
  }

  // Jerarquía a propósito: WhatsApp primero, el pago online como opción.
  // Una pieza artesanal se cierra conversando; que la pantalla no se sienta
  // una pasarela de checkout es pedido explícito del dueño.
  return (
    <div className="flex flex-col gap-6">
      {whatsappButton}

      <p className="text-center text-xs text-secondary uppercase tracking-widest">
        o si preferís, pagala online ahora
      </p>

      <button
        type="button"
        onClick={() => void pay()}
        disabled={busy}
        className={cn(
          'inline-flex items-center justify-center gap-2 border border-accent text-accent px-8 py-4 rounded-full font-bold transition-colors min-h-11',
          busy ? 'opacity-60 cursor-wait' : 'hover:bg-accent hover:text-on-accent',
        )}
      >
        {busy ? (
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        ) : (
          <CreditCard size={18} aria-hidden="true" />
        )}
        Pagar {formatARS(total)}
      </button>

      <p className="text-center text-xs text-secondary">
        Al pagar, MercadoPago te deja elegir si va al contado o en 2 o 3 cuotas con tu tarjeta.
      </p>

      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
};
