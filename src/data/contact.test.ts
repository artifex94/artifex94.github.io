import { describe, it, expect } from 'vitest';
import {
  buildWhatsAppUrl,
  buildQuoteWhatsAppUrl,
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

describe('buildQuoteWhatsAppUrl', () => {
  const base = {
    shape: 'Circular',
    dimensions: '80 cm de diámetro',
    areaM2: '0.50',
    total: '$67.000',
  };

  const decodeText = (url: string | null): string =>
    decodeURIComponent(url?.split('?text=')[1] ?? '');

  it('interpolates the measurements and the total into the message', () => {
    const text = decodeText(buildQuoteWhatsAppUrl(base));
    expect(text).toContain('Circular');
    expect(text).toContain('80 cm de diámetro');
    expect(text).toContain('0.50');
    expect(text).toContain('$67.000');
  });

  it('shows the list price next to the final one when a discount applied', () => {
    const text = decodeText(
      buildQuoteWhatsAppUrl({ ...base, listTotal: '$79.000', discountLabel: 'transferencia' }),
    );
    expect(text).toContain('$79.000');
    expect(text).toContain('transferencia');
    expect(text).toContain('$67.000');
  });

  it('omits the discount block when there is none', () => {
    const text = decodeText(buildQuoteWhatsAppUrl(base));
    expect(text).toContain('Total:');
    expect(text).not.toContain('Precio de lista');
  });

  it('lists the chosen wools, and omits the line when there are none', () => {
    expect(decodeText(buildQuoteWhatsAppUrl({ ...base, wools: ['Terracota', 'Crema'] }))).toContain(
      'Terracota, Crema',
    );
    expect(decodeText(buildQuoteWhatsAppUrl({ ...base, wools: [] }))).not.toContain('Colores:');
  });

  it('includes the border colour, and omits the line when there is none', () => {
    expect(decodeText(buildQuoteWhatsAppUrl({ ...base, border: 'Negro' }))).toContain('Borde: Negro');
    expect(decodeText(buildQuoteWhatsAppUrl(base))).not.toContain('Borde:');
  });

  it('percent-encodes the payload so the link stays valid', () => {
    const payload = buildQuoteWhatsAppUrl(base)?.split('?text=')[1] ?? '';
    expect(payload).not.toContain(' ');
    expect(payload).not.toContain('\n');
  });

  it('does not disturb the fixed-message API', () => {
    // Both builders target the same number but must not share message state.
    expect(buildWhatsAppUrl('tufting')).toContain(encodeURIComponent(whatsappMessages.tufting));
    expect(decodeText(buildQuoteWhatsAppUrl(base))).not.toContain(whatsappMessages.tufting);
  });
});
