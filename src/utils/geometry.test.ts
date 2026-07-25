import { describe, it, expect } from 'vitest';
import { convexHull, feretDiameter, type PointList } from './geometry';

const points = (...pairs: readonly [number, number][]): PointList =>
  Int32Array.from(pairs.flat());

/** Generador determinista, para que un fallo se pueda reproducir. */
const makeRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

/**
 * Oráculo: compara TODOS los pares, sin envolvente convexa.
 *
 * Es la referencia contra la que se prueba que reducir al hull no pierde
 * exactitud. Es O(n²), inservible en producción pero perfecto para un test.
 */
const feretByBruteForce = (list: PointList): number => {
  const count = list.length >>> 1;
  let best = 0;
  for (let i = 0; i < count; i += 1) {
    for (let j = i + 1; j < count; j += 1) {
      const dx = list[j * 2] - list[i * 2];
      const dy = list[j * 2 + 1] - list[i * 2 + 1];
      best = Math.max(best, dx * dx + dy * dy);
    }
  }
  return Math.sqrt(best);
};

/** Puntos del contorno de un círculo rasterizado. */
const circleOutline = (radius: number, cx = radius, cy = radius): PointList => {
  const pairs: [number, number][] = [];
  const steps = Math.max(64, Math.round(radius * 8));
  for (let i = 0; i < steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    pairs.push([Math.round(cx + radius * Math.cos(angle)), Math.round(cy + radius * Math.sin(angle))]);
  }
  return points(...pairs);
};

describe('convexHull', () => {
  it('reduce un cuadrado relleno a sus cuatro esquinas', () => {
    const pairs: [number, number][] = [];
    for (let y = 0; y <= 10; y += 1) for (let x = 0; x <= 10; x += 1) pairs.push([x, y]);

    const hull = convexHull(points(...pairs));
    expect(hull.length >>> 1).toBe(4);
  });

  it('descarta los puntos colineales de un lado', () => {
    // Los puntos del medio de cada lado no son vértices reales.
    const hull = convexHull(
      points([0, 0], [5, 0], [10, 0], [10, 5], [10, 10], [5, 10], [0, 10], [0, 5]),
    );
    expect(hull.length >>> 1).toBe(4);
  });

  it('devuelve los extremos cuando todos los puntos son colineales', () => {
    const hull = convexHull(points([0, 0], [1, 1], [2, 2], [3, 3], [4, 4]));
    expect(hull.length >>> 1).toBe(2);
  });

  it('sobrevive a casos degenerados', () => {
    expect(convexHull(points()).length).toBe(0);
    expect(convexHull(points([5, 5])).length >>> 1).toBe(1);
    expect(convexHull(points([1, 1], [4, 4])).length >>> 1).toBe(2);
    // Todos los puntos iguales.
    expect(convexHull(points([2, 2], [2, 2], [2, 2])).length >>> 1).toBeLessThanOrEqual(3);
  });

  it('deja todos los puntos dentro o sobre la envolvente', () => {
    const random = makeRandom(4242);
    const pairs: [number, number][] = [];
    for (let i = 0; i < 300; i += 1) {
      pairs.push([Math.round(random() * 200), Math.round(random() * 200)]);
    }
    const list = points(...pairs);
    const hull = convexHull(list);
    const hullCount = hull.length >>> 1;

    // Recorriendo el hull en orden, ningún punto puede quedar a la derecha.
    for (let i = 0; i < list.length; i += 2) {
      const px = list[i];
      const py = list[i + 1];
      for (let h = 0; h < hullCount; h += 1) {
        const ax = hull[h * 2];
        const ay = hull[h * 2 + 1];
        const next = (h + 1) % hullCount;
        const bx = hull[next * 2];
        const by = hull[next * 2 + 1];
        const cross = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
        expect(cross).toBeGreaterThanOrEqual(-1e-9);
      }
    }
  });
});

describe('feretDiameter', () => {
  it('coincide exactamente con comparar todos los pares', () => {
    // Esta es la justificación de usar el hull: si difiere, el atajo está mal.
    const random = makeRandom(20260725);
    for (let caso = 0; caso < 25; caso += 1) {
      const pairs: [number, number][] = [];
      const count = 5 + Math.floor(random() * 60);
      for (let i = 0; i < count; i += 1) {
        pairs.push([Math.round(random() * 500), Math.round(random() * 500)]);
      }
      const list = points(...pairs);
      expect(feretDiameter(list)?.distance).toBeCloseTo(feretByBruteForce(list), 9);
    }
  });

  it('mide el diámetro de un círculo', () => {
    // Rasterizar redondea cada punto a la grilla, así que los extremos quedan
    // hasta ~0.7 px afuera del círculo ideal y el diámetro medido se pasa un
    // poco. Con 200 px de diámetro, 2 px es 1%: irrelevante para un presupuesto.
    const feret = feretDiameter(circleOutline(100));
    expect(Math.abs((feret?.distance ?? 0) - 200)).toBeLessThan(2);
  });

  it('mide la diagonal de un rectángulo', () => {
    const feret = feretDiameter(points([0, 0], [300, 0], [300, 400], [0, 400]));
    expect(feret?.distance).toBeCloseTo(500, 6);
  });

  it('mide el largo de una línea de un píxel de ancho', () => {
    const pairs: [number, number][] = [];
    for (let x = 0; x <= 150; x += 1) pairs.push([x, 10]);
    expect(feretDiameter(points(...pairs))?.distance).toBeCloseTo(150, 6);
  });

  it('es invariante a la rotación', () => {
    // El diámetro de un círculo no cambia si se lo gira: si cambiara, habría un
    // sesgo hacia los ejes escondido en el algoritmo.
    const base = feretDiameter(circleOutline(120))?.distance ?? 0;

    for (const grados of [15, 30, 45, 60]) {
      const radianes = (grados * Math.PI) / 180;
      const source = circleOutline(120);
      const rotated: [number, number][] = [];
      for (let i = 0; i < source.length; i += 2) {
        const x = source[i] - 120;
        const y = source[i + 1] - 120;
        rotated.push([
          Math.round(x * Math.cos(radianes) - y * Math.sin(radianes)) + 200,
          Math.round(x * Math.sin(radianes) + y * Math.cos(radianes)) + 200,
        ]);
      }
      // La tolerancia absorbe el redondeo a la grilla, que es lo único que puede
      // cambiar acá: el algoritmo en sí no tiene preferencia por ningún eje.
      expect(Math.abs((feretDiameter(points(...rotated))?.distance ?? 0) - base)).toBeLessThan(2);
    }
  });

  it('devuelve los dos extremos que producen la distancia', () => {
    const feret = feretDiameter(points([0, 0], [10, 0], [100, 100], [5, 5]));
    expect(feret).not.toBeNull();
    const distancia = Math.hypot(feret!.bx - feret!.ax, feret!.by - feret!.ay);
    expect(distancia).toBeCloseTo(feret!.distance, 9);
  });

  it('maneja el conjunto vacío y el punto único', () => {
    expect(feretDiameter(points())).toBeNull();
    expect(feretDiameter(points([7, 3]))?.distance).toBe(0);
  });
});
