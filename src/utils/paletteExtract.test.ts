import { describe, it, expect } from 'vitest';
import { extractDominantColors, type DominantColor } from './paletteExtract';
import { type Rgb } from './color';

/** Arma un RGBA a partir de una lista de colores (uno por píxel), todos opacos. */
const rgbaFrom = (pixels: readonly Rgb[]): Uint8ClampedArray => {
  const rgba = new Uint8ClampedArray(pixels.length * 4);
  pixels.forEach(([r, g, b], i) => {
    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;
    rgba[i * 4 + 3] = 255;
  });
  return rgba;
};

const fullMask = (count: number): Uint8Array => new Uint8Array(count).fill(1);

/** Distancia euclidiana en sRGB: suficiente para verificar cercanía en el test. */
const rgbDist = (a: Rgb, b: Rgb): number =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** ¿Hay algún centroide a menos de `tol` del color esperado? */
const hasNear = (colors: readonly DominantColor[], target: Rgb, tol = 40): boolean =>
  colors.some((c) => rgbDist(c.rgb, target) < tol);

const RED: Rgb = [220, 30, 30];
const GREEN: Rgb = [30, 180, 60];
const BLUE: Rgb = [40, 60, 200];

describe('extractDominantColors', () => {
  it('devuelve vacío si la máscara no tiene ningún píxel', () => {
    const rgba = rgbaFrom([RED, GREEN, BLUE]);
    const mask = new Uint8Array(3); // todo 0
    expect(extractDominantColors(rgba, mask, 3)).toEqual([]);
  });

  it('encuentra los colores del propio diseño (tres bloques)', () => {
    // 5 rojos, 3 verdes, 1 azul → tres colores dominantes.
    const pixels = [RED, RED, RED, RED, RED, GREEN, GREEN, GREEN, BLUE];
    const rgba = rgbaFrom(pixels);
    const colors = extractDominantColors(rgba, fullMask(pixels.length), 3);

    expect(colors).toHaveLength(3);
    expect(hasNear(colors, RED)).toBe(true);
    expect(hasNear(colors, GREEN)).toBe(true);
    expect(hasNear(colors, BLUE)).toBe(true);
  });

  it('ordena los colores por superficie ocupada, de mayor a menor', () => {
    const pixels = [RED, RED, RED, RED, RED, GREEN, GREEN, GREEN, BLUE];
    const rgba = rgbaFrom(pixels);
    const [first] = extractDominantColors(rgba, fullMask(pixels.length), 3);
    // El rojo ocupa más área: tiene que salir primero.
    expect(rgbDist(first.rgb, RED)).toBeLessThan(rgbDist(first.rgb, BLUE));
  });

  it('es determinista: la misma entrada da la misma salida', () => {
    const pixels = [RED, RED, GREEN, GREEN, BLUE, BLUE, RED, GREEN, BLUE];
    const rgba = rgbaFrom(pixels);
    const a = extractDominantColors(rgba, fullMask(pixels.length), 4);
    const b = extractDominantColors(rgba, fullMask(pixels.length), 4);
    expect(a).toEqual(b);
  });

  it('no inventa colores: pide más de los que hay y devuelve solo los presentes', () => {
    const pixels = [RED, RED, GREEN, GREEN, BLUE, BLUE];
    const rgba = rgbaFrom(pixels);
    const colors = extractDominantColors(rgba, fullMask(pixels.length), 6);
    expect(colors.length).toBeLessThanOrEqual(3);
    expect(colors.length).toBeGreaterThan(0);
  });

  it('colapsa un degradé a sus tonos representativos, sin superar k', () => {
    // Rampa de gris de 0 a 255 en 32 pasos.
    const pixels: Rgb[] = Array.from({ length: 32 }, (_, i) => {
      const v = Math.round((i / 31) * 255);
      return [v, v, v] as Rgb;
    });
    const rgba = rgbaFrom(pixels);
    const colors = extractDominantColors(rgba, fullMask(pixels.length), 4);
    expect(colors.length).toBeLessThanOrEqual(4);
    // Tiene que cubrir los extremos: algo oscuro y algo claro.
    const lums = colors.map((c) => c.lab[0]);
    expect(Math.min(...lums)).toBeLessThan(40);
    expect(Math.max(...lums)).toBeGreaterThan(60);
  });
});
