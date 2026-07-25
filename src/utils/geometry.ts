// Geometría del contorno: envolvente convexa y diámetro de Feret.
//
// El diámetro de Feret es la distancia entre los dos puntos más separados de la
// silueta. Es lo que le da escala al presupuesto: el cliente dice cuánto mide
// esa distancia en la realidad y de ahí sale cuántos cm² tiene cada píxel.
//
// Funciones puras sobre typed arrays: sin canvas, sin DOM, testeables en jsdom.

/** Puntos intercalados [x0, y0, x1, y1, ...]. */
export type PointList = Int32Array;

export interface FeretResult {
  /** Distancia entre los dos puntos más separados, en píxeles. */
  distance: number;
  /** Extremo A del diámetro. */
  ax: number;
  ay: number;
  /** Extremo B del diámetro. */
  bx: number;
  by: number;
}

/**
 * Producto cruz de (a - o) x (b - o).
 *
 * Positivo si o->a->b gira a la izquierda, negativo si gira a la derecha, cero
 * si los tres puntos son colineales.
 */
const cross = (
  ox: number,
  oy: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number => (ax - ox) * (by - oy) - (ay - oy) * (bx - ox);

/**
 * Envolvente convexa por monotone chain (Andrew), O(n log n).
 *
 * Devuelve los vértices en sentido antihorario, sin repetir el primero al final.
 * Los puntos colineales se descartan: solo quedan los vértices reales.
 */
export const convexHull = (points: PointList): PointList => {
  const count = points.length >>> 1;
  if (count < 3) return points.slice();

  // Se ordenan índices en vez de mover los pares de coordenadas.
  const order = new Int32Array(count);
  for (let i = 0; i < count; i += 1) order[i] = i;

  const sorted = Array.from(order).sort((i, j) => {
    const dx = points[i * 2] - points[j * 2];
    return dx !== 0 ? dx : points[i * 2 + 1] - points[j * 2 + 1];
  });

  const hull = new Int32Array(count * 2);
  let size = 0;

  /**
   * `floor` es la cantidad de vértices que esta cadena no puede tocar. En la
   * cadena inferior son los 2 primeros; en la superior, TODA la cadena inferior.
   * Sin ese piso, la cadena de arriba se come vértices de la de abajo y el hull
   * sale más chico que el real.
   */
  const buildChain = (indices: readonly number[], floor: number): void => {
    for (const index of indices) {
      const x = points[index * 2];
      const y = points[index * 2 + 1];
      // Se descartan los vértices que dejaron de ser convexos (y los colineales,
      // por el <= 0) al agregar este punto.
      while (
        size > floor &&
        cross(hull[(size - 2) * 2], hull[(size - 2) * 2 + 1], hull[(size - 1) * 2], hull[(size - 1) * 2 + 1], x, y) <= 0
      ) {
        size -= 1;
      }
      hull[size * 2] = x;
      hull[size * 2 + 1] = y;
      size += 1;
    }
  };

  buildChain(sorted, 1);
  const lowerChainSize = size;
  buildChain(sorted.slice(0, -1).reverse(), lowerChainSize);

  // El último punto de cada cadena es el primero de la otra: se descarta uno.
  const total = size - 1;
  if (total < 3) {
    // Todos los puntos eran colineales: el "hull" son los dos extremos.
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return Int32Array.from([
      points[first * 2],
      points[first * 2 + 1],
      points[last * 2],
      points[last * 2 + 1],
    ]);
  }

  return hull.slice(0, total * 2);
};

/**
 * Diámetro de Feret: la mayor distancia entre dos puntos del conjunto.
 *
 * Los dos puntos más separados de cualquier conjunto son SIEMPRE vértices de su
 * envolvente convexa, así que reducir al hull primero no pierde exactitud: el
 * resultado es idéntico al de comparar todos contra todos.
 *
 * Sobre el hull se comparan todos los pares. Podría usarse rotating calipers
 * para bajar de O(h²) a O(h), pero no vale la pena: el hull de una silueta real
 * tiene entre 20 y 200 vértices, así que son a lo sumo 40.000 comparaciones de
 * enteros. La reducción que importa ya la hizo el hull, que baja de ~30.000
 * puntos de contorno (900 millones de pares) a un puñado. Comparar todos los
 * pares del hull es exacto y mucho más difícil de equivocar.
 */
export const feretDiameter = (points: PointList): FeretResult | null => {
  const count = points.length >>> 1;
  if (count === 0) return null;
  if (count === 1) {
    return { distance: 0, ax: points[0], ay: points[1], bx: points[0], by: points[1] };
  }

  const hull = convexHull(points);
  const hullCount = hull.length >>> 1;

  let best = -1;
  let ax = hull[0];
  let ay = hull[1];
  let bx = hull[0];
  let by = hull[1];

  // Se compara la distancia AL CUADRADO: evita miles de raíces cuadradas y
  // mantiene todo en enteros, sin error de punto flotante.
  for (let i = 0; i < hullCount; i += 1) {
    const xi = hull[i * 2];
    const yi = hull[i * 2 + 1];
    for (let j = i + 1; j < hullCount; j += 1) {
      const dx = hull[j * 2] - xi;
      const dy = hull[j * 2 + 1] - yi;
      const squared = dx * dx + dy * dy;
      if (squared > best) {
        best = squared;
        ax = xi;
        ay = yi;
        bx = hull[j * 2];
        by = hull[j * 2 + 1];
      }
    }
  }

  return { distance: Math.sqrt(best), ax, ay, bx, by };
};
