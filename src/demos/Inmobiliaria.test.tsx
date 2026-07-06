import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../test/render';
import { Inmobiliaria } from './Inmobiliaria';

// Las demos /business/* son piezas de venta, no contenido indexable:
// deben emitir noindex y su canonical propio.
describe('Inmobiliaria demo (noindex)', () => {
  it('marks the demo as noindex and sets its own canonical', () => {
    renderWithProviders(<Inmobiliaria />);
    expect(
      document.head.querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).toBe('noindex, follow');
    expect(
      document.head.querySelector('meta[property="og:url"]')?.getAttribute('content'),
    ).toBe('https://artifex.click/business/inmobiliarias');
  });
});
