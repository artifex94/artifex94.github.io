// Contacto centralizado: única fuente de verdad para email y WhatsApp.
// Todos los CTAs del sitio (mailto y wa.me) se construyen desde acá.

// TODO: completar con el número real en formato internacional SIN '+' ni guiones.
// Argentina: 549 + código de área + número (sin el 15). Ej: '5492611234567'.
// Mientras esté vacío, los botones de WhatsApp no se muestran (el sitio degrada a email).
export const WHATSAPP_NUMBER = '';

export const CONTACT_EMAIL = 'dev@artifex.click';

export type ServiceKey = 'desarrollo' | 'fotografia' | 'tufting' | 'general';

export const whatsappMessages: Record<ServiceKey, string> = {
  desarrollo:
    'Hola Ramiro! Vi tu página en artifex.click y quiero consultarte por el desarrollo de una tienda online.',
  fotografia:
    'Hola Ramiro! Vi tu página de fotografía en artifex.click y quiero consultarte por una sesión.',
  tufting:
    'Hola Ramiro! Vi tus piezas de tufting en artifex.click y quiero hacerte una consulta.',
  general:
    'Hola Ramiro! Te escribo desde artifex.click, quiero hacerte una consulta.',
};

export const buildWhatsAppUrl = (service: ServiceKey): string | null => {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessages[service])}`;
};

export const buildMailto = (subject: string): string =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
