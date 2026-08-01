import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import * as framer from 'framer-motion';
import { renderWithProviders } from '../test/render';
import { mockMobileViewport } from '../test/media';
import { Home } from './Home';

// Con prefers-reduced-motion el hero-pong no debe existir: una pelota rebotando
// es movimiento, y ahí el home tiene que quedar exactamente como está.
//
// Se espía useReducedMotion sobre el stub global de framer-motion
// (src/test/setup.ts) en vez de re-mockear el módulo con importActual: el
// framer real necesita IntersectionObserver, que jsdom no tiene, y Home monta
// componentes que lo usan (Typewriter con useInView).
describe('Home con movimiento reducido', () => {
  beforeEach(() => {
    sessionStorage.setItem('artifex_system_init', 'true');
    vi.spyOn(framer, 'useReducedMotion').mockReturnValue(true);
    // Viewport móvil: el otro gate del juego, para que el único motivo por el
    // que no aparece sea el movimiento reducido.
    mockMobileViewport();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no monta la franja de juego ni aunque el viewport sea móvil', () => {
    const { container } = renderWithProviders(<Home />);
    const hero = container.querySelector('section')!;
    expect(hero.querySelector('[data-hero-pong]')).toBeNull();
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('deja el hero intacto', () => {
    renderWithProviders(<Home />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Un taller, tres oficios.');
  });
});
