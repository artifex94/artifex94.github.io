import { describe, it, expect } from 'vitest';
import { removeBackground, type RgbaImage } from './backgroundRemoval';

/** Crea una imagen rellena de un color sólido (rgba). */
const solid = (w: number, h: number, [r, g, b, a]: [number, number, number, number]): RgbaImage => {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i += 1) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = a;
  }
  return { data, width: w, height: h };
};

/** Pinta un rectángulo de color opaco. */
const paintRect = (
  img: RgbaImage,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  [r, g, b]: [number, number, number],
): void => {
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const o = (y * img.width + x) * 4;
      img.data[o] = r;
      img.data[o + 1] = g;
      img.data[o + 2] = b;
      img.data[o + 3] = 255;
    }
  }
};

const alphaAt = (img: RgbaImage, x: number, y: number): number =>
  img.data[(y * img.width + x) * 4 + 3];

describe('removeBackground', () => {
  it('vuelve transparente el fondo sólido y deja el diseño intacto', () => {
    const img = solid(20, 20, [255, 255, 255, 255]); // fondo blanco
    paintRect(img, 6, 6, 14, 14, [200, 30, 30]); // motivo central rojo

    const { removed } = removeBackground(img);
    expect(removed).toBe(true);
    // Bordes (fondo) → transparentes
    expect(alphaAt(img, 0, 0)).toBe(0);
    expect(alphaAt(img, 19, 19)).toBe(0);
    // Centro (diseño) → opaco
    expect(alphaAt(img, 10, 10)).toBe(255);
  });

  it('no toca una imagen sin fondo uniforme (todo un color)', () => {
    const img = solid(20, 20, [255, 255, 255, 255]);
    const { removed } = removeBackground(img);
    // Se comería casi todo → se descarta.
    expect(removed).toBe(false);
    expect(alphaAt(img, 0, 0)).toBe(255);
  });

  it('respeta zonas internas del color del fondo rodeadas por el diseño', () => {
    // Fondo blanco, marco rojo grueso, y un "hueco" blanco en el centro que NO
    // toca el borde: no debe borrarse (no está conectado al fondo exterior).
    const img = solid(24, 24, [255, 255, 255, 255]);
    paintRect(img, 4, 4, 20, 20, [200, 30, 30]); // bloque rojo
    paintRect(img, 10, 10, 14, 14, [255, 255, 255]); // hueco blanco interno (opaco)

    const { removed } = removeBackground(img);
    expect(removed).toBe(true);
    expect(alphaAt(img, 0, 0)).toBe(0); // fondo exterior transparente
    expect(alphaAt(img, 12, 12)).toBe(255); // hueco interno intacto (rodeado por rojo)
  });
});
