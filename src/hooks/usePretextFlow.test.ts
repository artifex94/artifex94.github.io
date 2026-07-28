import { describe, expect, it } from 'vitest';
import { insetForLine, type Obstacle } from './usePretextFlow';

// Solo se testea la lógica PURA de "fluir alrededor". La medición con Pretext es
// solo-cliente (canvas + Intl.Segmenter) y su fallback se cubre en el test de
// render de MagazineText (jsdom no tiene canvas ⇒ queda el texto plano).

describe('insetForLine', () => {
  const CONTAINER = 600;
  const LINE_H = 24;

  it('sin obstáculo usa todo el ancho', () => {
    expect(insetForLine(0, LINE_H, CONTAINER, null)).toEqual({ x: 0, width: CONTAINER });
    expect(insetForLine(500, LINE_H, CONTAINER, null)).toEqual({ x: 0, width: CONTAINER });
  });

  const right: Obstacle = { side: 'right', top: 0, bottom: 96, width: 200, gap: 20 };

  it('angosta las líneas que cruzan el obstáculo (lado derecho: x=0)', () => {
    const box = insetForLine(0, LINE_H, CONTAINER, right);
    expect(box.x).toBe(0);
    expect(box.width).toBe(CONTAINER - (200 + 20)); // 380
  });

  it('vuelve al ancho completo debajo del obstáculo', () => {
    const box = insetForLine(120, LINE_H, CONTAINER, right); // 120 > bottom 96
    expect(box).toEqual({ x: 0, width: CONTAINER });
  });

  it('reserva del lado izquierdo desplaza el texto (x = ancho reservado)', () => {
    const left: Obstacle = { side: 'left', top: 0, bottom: 96, width: 180, gap: 20 };
    const box = insetForLine(0, LINE_H, CONTAINER, left);
    expect(box.x).toBe(200);
    expect(box.width).toBe(CONTAINER - 200);
  });

  it('detecta el solapamiento por el borde inferior de la línea', () => {
    // Línea que empieza justo antes del obstáculo pero lo cruza con su alto.
    const obstacle: Obstacle = { side: 'right', top: 20, bottom: 100, width: 200, gap: 20 };
    expect(insetForLine(0, LINE_H, CONTAINER, obstacle).width).toBe(380); // 0..24 cruza top=20
    expect(insetForLine(100, LINE_H, CONTAINER, obstacle).width).toBe(CONTAINER); // arranca en bottom
  });

  it('nunca devuelve ancho negativo si el obstáculo es más ancho que el contenedor', () => {
    const huge: Obstacle = { side: 'right', top: 0, bottom: 96, width: 900, gap: 20 };
    const box = insetForLine(0, LINE_H, CONTAINER, huge);
    expect(box.width).toBe(0);
    expect(box.x).toBe(0);
  });

  describe('con silueta (intrusionAt)', () => {
    it('reserva solo la intrusión real de esa banda, no la caja completa', () => {
      const contoured: Obstacle = {
        side: 'right',
        top: 0,
        bottom: 96,
        width: 200,
        gap: 20,
        intrusionAt: () => 80,
      };
      const box = insetForLine(0, LINE_H, CONTAINER, contoured);
      expect(box.width).toBe(CONTAINER - (80 + 20));
    });

    it('banda transparente dentro de la caja ⇒ ancho completo, sin gap', () => {
      const contoured: Obstacle = {
        side: 'right',
        top: 0,
        bottom: 96,
        width: 200,
        gap: 20,
        intrusionAt: () => 0,
      };
      expect(insetForLine(0, LINE_H, CONTAINER, contoured)).toEqual({ x: 0, width: CONTAINER });
    });

    it('acota la intrusión al ancho de la caja y nunca es negativa', () => {
      const overflowing: Obstacle = {
        side: 'left',
        top: 0,
        bottom: 96,
        width: 180,
        gap: 20,
        intrusionAt: () => 999,
      };
      expect(insetForLine(0, LINE_H, CONTAINER, overflowing)).toEqual({ x: 200, width: CONTAINER - 200 });

      const negative: Obstacle = { ...overflowing, intrusionAt: () => -50 };
      expect(insetForLine(0, LINE_H, CONTAINER, negative)).toEqual({ x: 0, width: CONTAINER });
    });
  });
});
