import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { Shape } from '../../../data/tuftingCalculator';

interface PaymentActionsProps {
  shape: Shape;
  payByTransfer: boolean;
  whatsappUrl: string | null;
}

// El camino de WhatsApp del presupuesto. Acá NO hay pago online a propósito: el
// pago aparece recién DESPUÉS de enviar el encargo (en la confirmación del
// OrderForm), cuando el pedido ya quedó registrado en el panel del taller. Antes
// de eso solo existe la conversación.
//
// El pago cobra siempre el TOTAL: las cuotas (2 o 3 con tarjeta) las ofrece la
// pasarela de MercadoPago, no la web.
export const PaymentActions: React.FC<PaymentActionsProps> = ({
  shape,
  payByTransfer,
  whatsappUrl,
}) => {
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

  const detail =
    shape === 'contorneada'
      ? // La contorneada no se paga online nunca: el servidor no puede recalcular
        // su área sin la máscara del diseño, así que no puede verificar el precio.
        'Las piezas contorneadas se cierran conversando: te confirmo el diseño, el borde y las medidas finales, y te paso el link de pago.'
      : payByTransfer
        ? 'Elegiste transferencia o efectivo, y por eso el 10% off: escribime y te paso los datos para transferir.'
        : 'Contame lo que quieras ajustar, o mandá el encargo con el formulario de arriba: el pago online se habilita apenas lo envíes.';

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-secondary leading-relaxed">{detail}</p>
      {whatsappButton}
    </div>
  );
};
