import { describe, it, expect } from 'vitest';
import { quantizeToPalette, modeFilter, reduceColors, renderPreview } from './quantize';
import { buildPaletteLut, hexToRgb, srgbToLab, type Lab } from './color';

const PALETA_HEX = ['#ffffff', '#000000', '#c25e4c', '#2f6f4e', '#2b4c8c', '#e8c547'];
const paletaLab: Lab[] = PALETA_HEX.map((hex) => srgbToLab(hexToRgb(hex)));
const paletaRgb = PALETA_HEX.map((hex) => hexToRgb(hex));

/** Buffer RGBA de un color liso. */
const solidRgba = (count: number, hex: string): Uint8ClampedArray => {
  const [r, g, b] = hexToRgb(hex);
  const rgba = new Uint8ClampedArray(count * 4);
  for (let i = 0; i < count; i += 1) {
    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;
    rgba[i * 4 + 3] = 255;
  }
  return rgba;
};

describe('quantizeToPalette', () => {
  it('manda cada color al índice de su lana', () => {
    const lut = buildPaletteLut(paletaLab);
    PALETA_HEX.forEach((hex, index) => {
      const indices = quantizeToPalette(solidRgba(4, hex), lut);
      expect(Array.from(indices)).toEqual([index, index, index, index]);
    });
  });

  it('acerca un color intermedio a la lana más parecida', () => {
    const lut = buildPaletteLut(paletaLab);
    // Un terracota apenas corrido tiene que seguir cayendo en terracota.
    const indices = quantizeToPalette(solidRgba(1, '#c46050'), lut);
    expect(indices[0]).toBe(PALETA_HEX.indexOf('#c25e4c'));
  });
});

describe('modeFilter', () => {
  it('borra un píxel suelto que quedó de otro color', () => {
    // Es exactamente el moteado que produce el ruido de una foto.
    const size = 5;
    const indices = new Uint8Array(size * size).fill(2);
    indices[2 * size + 2] = 4;
    const mask = new Uint8Array(size * size).fill(1);

    const filtered = modeFilter(indices, size, size, mask, paletaLab.length);
    expect(filtered[2 * size + 2]).toBe(2);
  });

  it('conserva una región grande de otro color', () => {
    // No tiene que aplanar el diseño, solo el ruido.
    const size = 10;
    const indices = new Uint8Array(size * size).fill(2);
    for (let y = 2; y < 8; y += 1) for (let x = 2; x < 8; x += 1) indices[y * size + x] = 4;
    const mask = new Uint8Array(size * size).fill(1);

    const filtered = modeFilter(indices, size, size, mask, paletaLab.length);
    expect(filtered[5 * size + 5]).toBe(4);
  });

  it('ignora los píxeles fuera de la máscara', () => {
    const size = 4;
    const indices = new Uint8Array(size * size).fill(3);
    const mask = new Uint8Array(size * size);
    mask[0] = 1;

    const filtered = modeFilter(indices, size, size, mask, paletaLab.length);
    expect(filtered[0]).toBe(3);
    expect(filtered[5]).toBe(0);
  });
});

describe('reduceColors', () => {
  const mask = (count: number) => new Uint8Array(count).fill(1);

  it('no toca nada si ya hay menos colores que el tope', () => {
    const indices = Uint8Array.from([0, 1, 2, 0, 1, 2]);
    const result = reduceColors(indices, mask(6), paletaLab, 4);

    expect(Array.from(result.indices)).toEqual([0, 1, 2, 0, 1, 2]);
    expect(result.usedPaletteIndices).toHaveLength(3);
  });

  it('recorta al tope de colores', () => {
    const indices = Uint8Array.from([0, 0, 0, 1, 1, 2, 3, 4, 5]);
    const result = reduceColors(indices, mask(9), paletaLab, 3);

    expect(result.usedPaletteIndices).toHaveLength(3);
    expect(new Set(Array.from(result.indices)).size).toBeLessThanOrEqual(3);
  });

  it('conserva las regiones más grandes', () => {
    const indices = new Uint8Array(100);
    indices.fill(0, 0, 60);
    indices.fill(1, 60, 90);
    indices.fill(2, 90, 99);
    indices[99] = 5;

    const result = reduceColors(indices, mask(100), paletaLab, 2);
    expect(result.usedPaletteIndices).toContain(0);
    expect(result.usedPaletteIndices).toContain(1);
  });

  it('protege una región chica pero por encima del umbral', () => {
    // Los ojos de un personaje ocupan poca superficie y no se pueden perder.
    const indices = new Uint8Array(1000);
    indices.fill(0, 0, 500);
    indices.fill(1, 500, 800);
    indices.fill(2, 800, 950);
    indices.fill(3, 950, 1000); // 5%: por encima del 2% protegido

    const result = reduceColors(indices, mask(1000), paletaLab, 4, 0.02);
    expect(result.usedPaletteIndices).toContain(3);
  });

  it('manda los colores descartados a la lana más parecida', () => {
    // Todo azul suelto tiene que terminar en el azul que sobrevivió, no en un
    // color arbitrario.
    const indices = new Uint8Array(100);
    indices.fill(0, 0, 50); // blanco
    indices.fill(1, 50, 98); // negro
    indices[98] = 4; // azul, minoritario
    indices[99] = 4;

    const result = reduceColors(indices, mask(100), paletaLab, 2);
    expect(result.usedPaletteIndices).toEqual([0, 1]);
    // El azul va al negro, que es perceptualmente más cercano que el blanco.
    expect(result.indices[98]).toBe(1);
  });

  it('no explota con una máscara vacía', () => {
    const indices = new Uint8Array(10);
    const result = reduceColors(indices, new Uint8Array(10), paletaLab, 3);
    expect(result.usedPaletteIndices).toHaveLength(0);
  });
});

describe('renderPreview', () => {
  it('pinta el diseño adentro y el borde alrededor', () => {
    const width = 5;
    const height = 1;
    const silhouette = Uint8Array.from([0, 1, 1, 1, 0]);
    const dilated = Uint8Array.from([1, 1, 1, 1, 1]);
    const indices = Uint8Array.from([0, 2, 2, 2, 0]);

    const rgba = renderPreview({
      indices,
      dilated,
      silhouette,
      paletteRgb: paletaRgb,
      borderRgb: [17, 17, 17],
      width,
      height,
    });

    // Píxel 0: fuera de la silueta pero dentro de la pieza -> borde.
    expect([rgba[0], rgba[1], rgba[2], rgba[3]]).toEqual([17, 17, 17, 255]);
    // Píxel 2: dentro de la silueta -> color de la lana asignada.
    expect([rgba[8], rgba[9], rgba[10]]).toEqual([...paletaRgb[2]]);
  });

  it('deja transparente lo que está fuera de la pieza', () => {
    const rgba = renderPreview({
      indices: Uint8Array.from([0, 0]),
      dilated: Uint8Array.from([0, 1]),
      silhouette: Uint8Array.from([0, 1]),
      paletteRgb: paletaRgb,
      borderRgb: [0, 0, 0],
      width: 2,
      height: 1,
    });

    expect(rgba[3]).toBe(0);
    expect(rgba[7]).toBe(255);
  });

  it('produce un buffer RGBA del tamaño exacto', () => {
    const rgba = renderPreview({
      indices: new Uint8Array(12),
      dilated: new Uint8Array(12).fill(1),
      silhouette: new Uint8Array(12).fill(1),
      paletteRgb: paletaRgb,
      borderRgb: [0, 0, 0],
      width: 4,
      height: 3,
    });

    expect(rgba).toHaveLength(4 * 3 * 4);
  });
});
