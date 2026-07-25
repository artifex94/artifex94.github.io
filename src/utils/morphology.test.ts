import { describe, it, expect } from 'vitest';
import {
  padMask,
  euclideanDistanceTransform,
  dilateFromDistance,
  dilatedAreaPx,
  countMask,
} from './morphology';

/** Máscara con un disco relleno centrado. */
const diskMask = (size: number, radius: number, cx = size / 2, cy = size / 2): Uint8Array => {
  const mask = new Uint8Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= radius * radius) mask[y * size + x] = 1;
    }
  }
  return mask;
};

/** Anillo: disco exterior con un agujero circular concéntrico. */
const ringMask = (size: number, outer: number, inner: number): Uint8Array => {
  const mask = diskMask(size, outer);
  const center = size / 2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x + 0.5 - center;
      const dy = y + 0.5 - center;
      if (dx * dx + dy * dy <= inner * inner) mask[y * size + x] = 0;
    }
  }
  return mask;
};

/** Referencia O(n²): distancia real de cada píxel al encendido más cercano. */
const bruteForceDistanceSquared = (
  mask: Uint8Array,
  width: number,
  height: number,
): Float64Array => {
  const result = new Float64Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let best = Infinity;
      for (let sy = 0; sy < height; sy += 1) {
        for (let sx = 0; sx < width; sx += 1) {
          if (!mask[sy * width + sx]) continue;
          const dx = x - sx;
          const dy = y - sy;
          best = Math.min(best, dx * dx + dy * dy);
        }
      }
      result[y * width + x] = best;
    }
  }
  return result;
};

const makeRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

describe('euclideanDistanceTransform', () => {
  it('coincide con la fuerza bruta en máscaras aleatorias', () => {
    // La formulación de Felzenszwalb es euclídea EXACTA, no una aproximación:
    // si difiere aunque sea en un píxel, el algoritmo está mal implementado.
    const random = makeRandom(31337);
    const size = 32;

    for (let caso = 0; caso < 5; caso += 1) {
      const mask = new Uint8Array(size * size);
      for (let i = 0; i < mask.length; i += 1) mask[i] = random() < 0.05 ? 1 : 0;
      mask[Math.floor(random() * mask.length)] = 1; // que nunca quede vacía

      const fast = euclideanDistanceTransform(mask, size, size);
      const slow = bruteForceDistanceSquared(mask, size, size);

      for (let i = 0; i < fast.length; i += 1) {
        expect(fast[i]).toBeCloseTo(slow[i], 4);
      }
    }
  });

  it('da cero sobre los píxeles encendidos', () => {
    const mask = diskMask(24, 6);
    const distance = euclideanDistanceTransform(mask, 24, 24);
    for (let i = 0; i < mask.length; i += 1) {
      if (mask[i]) expect(distance[i]).toBe(0);
    }
  });

  it('crece con la distancia real, no con la de manhattan', () => {
    // Un solo píxel encendido en el centro de una grilla de 21x21.
    const size = 21;
    const mask = new Uint8Array(size * size);
    mask[10 * size + 10] = 1;
    const distance = euclideanDistanceTransform(mask, size, size);

    // En diagonal, la distancia euclídea al cuadrado es 3²+4² = 25, no (3+4)².
    expect(distance[(10 + 3) * size + (10 + 4)]).toBeCloseTo(25, 6);
  });
});

describe('dilateFromDistance', () => {
  it('dilatar un disco de radio R por r da un disco de radio R+r', () => {
    const size = 120;
    const mask = diskMask(size, 20);
    const distance = euclideanDistanceTransform(mask, size, size);
    const dilated = dilateFromDistance(distance, 10);

    const areaEsperada = Math.PI * 30 * 30;
    expect(countMask(dilated) / areaEsperada).toBeCloseTo(1, 1);
  });

  it('con radio cero devuelve la máscara original', () => {
    const size = 40;
    const mask = diskMask(size, 12);
    const distance = euclideanDistanceTransform(mask, size, size);
    const dilated = dilateFromDistance(distance, 0);

    expect(Array.from(dilated)).toEqual(Array.from(mask));
  });

  it('un agujero más chico que el doble del borde desaparece', () => {
    // Es la propiedad que hace innecesario programar el manejo de agujeros: si
    // el borde no entra en el hueco, el hueco no se puede fabricar.
    const size = 140;
    const mask = ringMask(size, 50, 8);
    const distance = euclideanDistanceTransform(mask, size, size);

    // El agujero tiene radio 8: un borde de radio 10 (> 8) lo tapa por completo.
    const dilated = dilateFromDistance(distance, 10);
    const centro = Math.floor(size / 2);
    expect(dilated[centro * size + centro]).toBe(1);
  });

  it('un agujero más grande que el doble del borde sobrevive, encogido', () => {
    const size = 160;
    const mask = ringMask(size, 60, 25);
    const distance = euclideanDistanceTransform(mask, size, size);
    const dilated = dilateFromDistance(distance, 8);

    const centro = Math.floor(size / 2);
    // El centro sigue vacío...
    expect(dilated[centro * size + centro]).toBe(0);
    // ...pero el agujero encogió: lo que antes estaba a 20 px del centro
    // (dentro del hueco de radio 25) ahora quedó cubierto por el borde.
    expect(dilated[centro * size + centro + 20]).toBe(1);
  });
});

describe('padMask', () => {
  it('preserva el contenido, corrido por el margen', () => {
    const mask = Uint8Array.from([1, 0, 0, 1]);
    const padded = padMask(mask, 2, 2, 1);

    expect(padded.width).toBe(4);
    expect(padded.height).toBe(4);
    expect(padded.mask[1 * 4 + 1]).toBe(1);
    expect(padded.mask[2 * 4 + 2]).toBe(1);
    expect(padded.mask[0]).toBe(0);
  });

  it('evita que se recorte el borde de un diseño pegado al filo', () => {
    // Este es el bug clásico de morfología: sin margen, la mitad del borde de
    // una pieza que toca el filo de la imagen se pierde y el área sale menor.
    const size = 40;
    const radius = 10;
    // Disco centrado justo en el borde izquierdo.
    const mask = diskMask(size, radius, 0, size / 2);

    const sinMargen = dilateFromDistance(
      euclideanDistanceTransform(mask, size, size),
      6,
    );

    const pad = 8;
    const padded = padMask(mask, size, size, pad);
    const conMargen = dilateFromDistance(
      euclideanDistanceTransform(padded.mask, padded.width, padded.height),
      6,
    );

    // Con margen se conserva la parte del borde que caía fuera de la imagen.
    expect(countMask(conMargen)).toBeGreaterThan(countMask(sinMargen));
  });
});

describe('dilatedAreaPx', () => {
  it('mide el área de un disco dilatado dentro del 1%', () => {
    const size = 200;
    const mask = diskMask(size, 40);
    const distance = euclideanDistanceTransform(mask, size, size);

    const area = dilatedAreaPx(distance, mask, 20);
    const esperada = Math.PI * 60 * 60;
    expect(Math.abs(area - esperada) / esperada).toBeLessThan(0.01);
  });

  it('con radio cero devuelve exactamente el área de la silueta', () => {
    // Regresión: cuando la cobertura subpíxel se aplicaba también adentro, la
    // transformada valía 0 en todo el interior y el área salía a la mitad.
    const size = 100;
    const mask = diskMask(size, 30);
    const distance = euclideanDistanceTransform(mask, size, size);

    expect(dilatedAreaPx(distance, mask, 0)).toBe(countMask(mask));
  });

  it('a partir de un radio de un par de píxeles ya converge al área real', () => {
    const size = 200;
    const mask = diskMask(size, 40);
    const distance = euclideanDistanceTransform(mask, size, size);

    for (const radius of [3, 8, 20]) {
      const esperada = Math.PI * (40 + radius) ** 2;
      expect(Math.abs(dilatedAreaPx(distance, mask, radius) - esperada) / esperada).toBeLessThan(0.02);
    }
  });

  it('crece de forma monótona con el radio', () => {
    const size = 120;
    const mask = diskMask(size, 20);
    const distance = euclideanDistanceTransform(mask, size, size);
    const areas = [0, 5, 10, 15].map((r) => dilatedAreaPx(distance, mask, r));
    expect(areas).toEqual([...areas].sort((a, b) => a - b));
  });
});
