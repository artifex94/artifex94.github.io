import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import * as framer from 'framer-motion';
import { HeroPongBand } from './HeroPongBand';
import { mockMobileViewport } from '../../test/media';
import { GLOBAL_SCORES_KEY } from '../../utils/heroPongHighScores';
import { marqueeCopies, MARQUEE_CHAR_WIDTH, MARQUEE_COVER_WIDTH } from './heroPongConfig';

// El ticker del top-10 vive en localStorage, así que estos tests van aparte de
// Home.test.tsx: ahí el contrato es "primera visita = franja intacta", y sembrar
// scores lo contaminaría.
//
// El movimiento reducido se espía sobre el stub global de framer-motion
// (src/test/setup.ts), igual que en Home.reduced.test.tsx: re-mockear el módulo
// con importActual traería el framer real, que necesita IntersectionObserver.

/** Siembra el espejo del ranking global, que es lo que el ticker muestra. */
const seedScores = (count: number): void => {
  localStorage.setItem(
    GLOBAL_SCORES_KEY,
    JSON.stringify(
      Array.from({ length: count }, (_, i) => ({ initials: 'ABC', score: (count - i) * 100 })),
    ),
  );
};

const renderBand = () => {
  const originRef = createRef<HTMLElement>();
  return render(<HeroPongBand originRef={originRef} blockRefs={[]} ready />);
};

describe('ticker del top-10 en la franja', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    mockMobileViewport();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('no existe si nadie jugó nunca', () => {
    const { container } = renderBand();
    const band = container.querySelector('[data-hero-pong="band"]')!;
    expect(band).not.toBeNull();
    expect(band.querySelector('[data-hero-pong="marquee"]')).toBeNull();
    // El reposo de siempre: paleta y pelota, nada más.
    expect(band.children.length).toBe(2);
  });

  it('aparece con los scores guardados sin tocar la geometría de la franja', () => {
    seedScores(10);
    const { container } = renderBand();
    const band = container.querySelector('[data-hero-pong="band"]') as HTMLElement;
    const marquee = band.querySelector('[data-hero-pong="marquee"]') as HTMLElement;

    expect(marquee).not.toBeNull();
    expect(marquee.textContent).toContain('TOP 10 GLOBAL');
    expect(marquee.textContent).toContain('1 ABC 1000');
    // No puede robarle el toque a la franja, que es la que arranca la partida.
    expect(marquee.className).toContain('pointer-events-none');
    expect(marquee.style.top).toBe('46px');
    // La franja sigue midiendo exactamente el gap-16 que ya existía.
    expect(band.style.height).toBe('64px');
  });

  it('repite la secuencia lo suficiente con un solo score', () => {
    seedScores(1);
    const { container } = renderBand();
    const track = container.querySelector('.hero-marquee-track')!;
    const text = track.children[0].textContent ?? '';

    // El track es la secuencia DUPLICADA, y la mitad tiene que ser más ancha
    // que cualquier franja posible o se ve un hueco al final de cada vuelta.
    expect(track.children.length).toBe(marqueeCopies(text.length) * 2);
    expect(marqueeCopies(text.length) * text.length * MARQUEE_CHAR_WIDTH).toBeGreaterThanOrEqual(
      MARQUEE_COVER_WIDTH,
    );
    expect((track as HTMLElement).style.animationDuration).not.toBe('');
  });

  it('no monta nada con prefers-reduced-motion, ni siquiera con scores', () => {
    seedScores(10);
    vi.spyOn(framer, 'useReducedMotion').mockReturnValue(true);

    const { container } = renderBand();
    expect(container.querySelector('[data-hero-pong="band"]')).toBeNull();
    expect(container.querySelector('[data-hero-pong="marquee"]')).toBeNull();
  });
});
