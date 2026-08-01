import { describe, it, expect } from 'vitest';
import {
  marqueeCopies,
  marqueeDuration,
  BAND_HEIGHT,
  MARQUEE_CHAR_WIDTH,
  MARQUEE_COVER_WIDTH,
  MARQUEE_HEIGHT,
  MARQUEE_SPEED,
  MARQUEE_TOP,
  PADDLE_HEIGHT,
  PADDLE_TOP,
} from './heroPongConfig';

describe('geometría del ticker', () => {
  it('entra en la franja sin pisar la paleta', () => {
    expect(MARQUEE_TOP).toBeGreaterThanOrEqual(PADDLE_TOP + PADDLE_HEIGHT);
    expect(MARQUEE_TOP + MARQUEE_HEIGHT).toBeLessThanOrEqual(BAND_HEIGHT);
  });
});

describe('marqueeCopies', () => {
  it('sin texto no hay copias', () => {
    expect(marqueeCopies(0)).toBe(0);
  });

  it('media vuelta siempre cubre el ancho máximo de la franja', () => {
    // La invariante que evita el hueco al final de cada vuelta.
    for (let length = 10; length <= 400; length += 1) {
      expect(marqueeCopies(length) * length * MARQUEE_CHAR_WIDTH).toBeGreaterThanOrEqual(
        MARQUEE_COVER_WIDTH,
      );
    }
  });

  it('el caso real de un solo score se repite lo suficiente', () => {
    // 'TOP 10 · 1 BAA 240 · ' son 21 caracteres: el caso más angosto posible.
    expect(marqueeCopies(21)).toBeGreaterThanOrEqual(6);
  });
});

describe('marqueeDuration', () => {
  it('mantiene la velocidad en px/s con uno o con diez scores', () => {
    for (const length of [21, 60, 133, 400]) {
      const traveled = marqueeCopies(length) * length * MARQUEE_CHAR_WIDTH;
      expect(traveled / marqueeDuration(length)).toBeCloseTo(MARQUEE_SPEED);
    }
  });

  it('nunca es instantánea con texto real', () => {
    expect(marqueeDuration(21)).toBeGreaterThan(1);
  });
});
