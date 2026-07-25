// Contacto centralizado: única fuente de verdad para email y WhatsApp.
// Todos los CTAs del sitio (mailto y wa.me) se construyen desde acá.

// Formato internacional SIN '+' ni guiones (549 + área + número, sin el 15).
// Si se vacía, los botones de WhatsApp desaparecen y el sitio degrada a email.
export const WHATSAPP_NUMBER = '5493436431987';

export const CONTACT_EMAIL = 'dev@artifex.click';

export type ServiceKey = 'desarrollo' | 'fotografia' | 'tufting' | 'demo' | 'general';

export const whatsappMessages: Record<ServiceKey, string> = {
  desarrollo:
    'Hola Ramiro! Vi tu página en artifex.click y quiero consultarte por el desarrollo de un sitio web para mi negocio.',
  demo:
    'Hola Ramiro, vi el demo y me interesa un sitio similar para mi negocio.',
  fotografia:
    'Hola Ramiro! Vi tu página de fotografía en artifex.click y quiero consultarte por una sesión.',
  tufting:
    'Hola Ramiro! Vi tus piezas de tufting en artifex.click y quiero hacerte una consulta.',
  general:
    'Hola Ramiro! Te escribo desde artifex.click, quiero hacerte una consulta.',
};

// Tier-specific WhatsApp intros for the desarrollo pricing options. Passing a
// variant to buildWhatsAppUrl swaps the generic message for one that names the
// chosen plan, so the chat opens with the right context.
export type TierVariant = 'presencia' | 'contenido' | 'negocio' | 'sistema';

export const whatsappTierMessages: Record<TierVariant, string> = {
  presencia:
    'Hola Ramiro! Vi tu página y me interesa el plan Esencial ($200.000). Quiero contarte sobre mi negocio.',
  contenido:
    'Hola Ramiro! Vi tu página y me interesa el plan Contenido ($400.000). Quiero contarte sobre mi negocio.',
  negocio:
    'Hola Ramiro! Vi tu página y me interesa el plan Tienda ($600.000). Quiero contarte sobre mi negocio.',
  sistema:
    'Hola Ramiro! Vi tu página y me interesa un Sistema Web a Medida. Quiero contarte qué necesito.',
};

export const buildWhatsAppUrl = (service: ServiceKey, variant?: TierVariant): string | null => {
  if (!WHATSAPP_NUMBER) return null;
  const message = variant ? whatsappTierMessages[variant] : whatsappMessages[service];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const buildMailto = (subject: string): string =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

/**
 * Resumen de un presupuesto de tufting, ya formateado para leer.
 *
 * Los montos llegan como string porque el formateo de moneda vive en
 * tuftingPricing: acá solo se arma el texto del mensaje.
 */
export interface TuftingQuoteMessage {
  /** Forma elegida, en palabras: "Contorneada", "Circular", "Rectangular". */
  shape: string;
  /** Medidas en palabras: "80 cm de diámetro". */
  dimensions: string;
  /** Área de la pieza en m², con dos decimales. */
  areaM2: string;
  /** Total a pagar, ya formateado en pesos. */
  total: string;
  /** Precio sin descuento, si se aplicó alguno. */
  listTotal?: string;
  /** Nombre del descuento aplicado, si hubo. */
  discountLabel?: string;
  /** Lanas elegidas, por nombre. */
  wools?: readonly string[];
}

/**
 * Arma el link de WhatsApp con el presupuesto ya calculado adentro.
 *
 * Es la única función de este módulo que interpola datos: el resto usa mensajes
 * fijos por servicio. Se mantienen separadas a propósito, así los CTAs de
 * siempre no dependen de que alguien arme un objeto.
 */
export const buildQuoteWhatsAppUrl = (quote: TuftingQuoteMessage): string | null => {
  if (!WHATSAPP_NUMBER) return null;

  const lines = [
    'Hola Ramiro! Armé un presupuesto en artifex.click y quiero encargarlo:',
    '',
    `Pieza: ${quote.shape}`,
    `Medidas: ${quote.dimensions}`,
    `Superficie: ${quote.areaM2} m2`,
  ];

  if (quote.wools?.length) {
    lines.push(`Colores: ${quote.wools.join(', ')}`);
  }

  lines.push('');

  if (quote.discountLabel && quote.listTotal) {
    lines.push(`Precio de lista: ${quote.listTotal}`);
    lines.push(`Con ${quote.discountLabel}: ${quote.total}`);
  } else {
    lines.push(`Total: ${quote.total}`);
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
};
