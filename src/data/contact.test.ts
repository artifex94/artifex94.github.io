import { describe, it, expect } from 'vitest';
import {
  buildWhatsAppUrl,
  whatsappMessages,
  whatsappTierMessages,
  WHATSAPP_NUMBER,
} from './contact';

describe('buildWhatsAppUrl', () => {
  it('builds a wa.me url with the generic service message when no variant is given', () => {
    const url = buildWhatsAppUrl('desarrollo');
    expect(url).toContain(`https://wa.me/${WHATSAPP_NUMBER}`);
    expect(url).toContain(encodeURIComponent(whatsappMessages.desarrollo));
  });

  it('stays backward compatible: single-arg call equals the explicit no-variant call', () => {
    expect(buildWhatsAppUrl('desarrollo')).toBe(buildWhatsAppUrl('desarrollo', undefined));
  });

  it('uses the tier-specific message when a variant is passed', () => {
    const url = buildWhatsAppUrl('desarrollo', 'contenido');
    expect(url).toContain(encodeURIComponent(whatsappTierMessages.contenido));
    expect(url).not.toContain(encodeURIComponent(whatsappMessages.desarrollo));
  });

  it('exposes a non-empty message for every tier variant', () => {
    for (const variant of ['presencia', 'contenido', 'negocio', 'sistema'] as const) {
      expect(whatsappTierMessages[variant].trim().length).toBeGreaterThan(0);
    }
  });
});
