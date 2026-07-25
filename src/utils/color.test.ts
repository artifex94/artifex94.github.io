import { describe, it, expect } from 'vitest';
import {
  srgbToLab,
  labToSrgb,
  hexToRgb,
  rgbToHex,
  deltaE2000,
  nearestPaletteIndex,
  buildPaletteLut,
  lookupPaletteIndex,
  type Lab,
  type Rgb,
} from './color';

/**
 * Set de verificación de CIEDE2000 de Sharma, Wu & Dalal (2005).
 *
 * Son los 34 pares que la industria usa para validar una implementación. Están
 * elegidos a propósito para pegarle a las discontinuidades de la fórmula: cruces
 * de tono por 0/360 grados, colores acromáticos donde el tono es indefinido, y
 * la zona de los azules donde actúa el término de rotación. Una implementación
 * que se equivoca en el RT pasa los casos fáciles y falla acá.
 */
const SHARMA_PAIRS: readonly (readonly [Lab, Lab, number])[] = [
  [[50.0, 2.6772, -79.7751], [50.0, 0.0, -82.7485], 2.0425],
  [[50.0, 3.1571, -77.2803], [50.0, 0.0, -82.7485], 2.8615],
  [[50.0, 2.8361, -74.02], [50.0, 0.0, -82.7485], 3.4412],
  [[50.0, -1.3802, -84.2814], [50.0, 0.0, -82.7485], 1.0],
  [[50.0, -1.1848, -84.8006], [50.0, 0.0, -82.7485], 1.0],
  [[50.0, -0.9009, -85.5211], [50.0, 0.0, -82.7485], 1.0],
  [[50.0, 0.0, 0.0], [50.0, -1.0, 2.0], 2.3669],
  [[50.0, -1.0, 2.0], [50.0, 0.0, 0.0], 2.3669],
  [[50.0, 2.49, -0.001], [50.0, -2.49, 0.0009], 7.1792],
  [[50.0, 2.49, -0.001], [50.0, -2.49, 0.001], 7.1792],
  [[50.0, 2.49, -0.001], [50.0, -2.49, 0.0011], 7.2195],
  [[50.0, 2.49, -0.001], [50.0, -2.49, 0.0012], 7.2195],
  [[50.0, -0.001, 2.49], [50.0, 0.0009, -2.49], 4.8045],
  [[50.0, -0.001, 2.49], [50.0, 0.001, -2.49], 4.8045],
  [[50.0, -0.001, 2.49], [50.0, 0.0011, -2.49], 4.7461],
  [[50.0, 2.5, 0.0], [50.0, 0.0, -2.5], 4.3065],
  [[50.0, 2.5, 0.0], [73.0, 25.0, -18.0], 27.1492],
  [[50.0, 2.5, 0.0], [61.0, -5.0, 29.0], 22.8977],
  [[50.0, 2.5, 0.0], [56.0, -27.0, -3.0], 31.903],
  [[50.0, 2.5, 0.0], [58.0, 24.0, 15.0], 19.4535],
  [[50.0, 2.5, 0.0], [50.0, 3.1736, 0.5854], 1.0],
  [[50.0, 2.5, 0.0], [50.0, 3.2972, 0.0], 1.0],
  [[50.0, 2.5, 0.0], [50.0, 1.8634, 0.5757], 1.0],
  [[50.0, 2.5, 0.0], [50.0, 3.2592, 0.335], 1.0],
  [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
  [[63.0109, -31.0961, -5.8663], [62.8187, -29.7946, -4.0864], 1.263],
  [[61.2901, 3.7196, -5.3901], [61.4292, 2.248, -4.962], 1.8731],
  [[35.0831, -44.1164, 3.7933], [35.0232, -40.0716, 1.5901], 1.8645],
  [[22.7233, 20.0904, -46.694], [23.0331, 14.973, -42.5619], 2.0373],
  [[36.4612, 47.858, 18.3852], [36.2715, 50.5065, 21.2231], 1.4146],
  [[90.8027, -2.0831, 1.441], [91.1528, -1.6435, 0.0447], 1.4441],
  [[90.9257, -0.5406, -0.9208], [88.6381, -0.8985, -0.7239], 1.5381],
  [[6.7747, -0.2908, -2.4247], [5.8714, -0.0985, -2.2286], 0.6377],
  [[2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514], 0.9082],
];

/** Generador congruencial lineal: aleatorio pero determinista entre corridas. */
const makeRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

describe('sRGB <-> CIELAB', () => {
  it('mapea el blanco a L=100 sin cromaticidad', () => {
    const [l, a, b] = srgbToLab([255, 255, 255]);
    expect(l).toBeCloseTo(100, 4);
    expect(a).toBeCloseTo(0, 3);
    expect(b).toBeCloseTo(0, 3);
  });

  it('mapea el negro a L=0', () => {
    const [l, a, b] = srgbToLab([0, 0, 0]);
    expect(l).toBeCloseTo(0, 6);
    expect(a).toBeCloseTo(0, 6);
    expect(b).toBeCloseTo(0, 6);
  });

  it('mapea el gris medio #808080 a L≈53.6', () => {
    // Valor de referencia conocido: el 50% en sRGB NO es L=50, justamente
    // porque sRGB está en gamma. Si esto diera 50, la linealización estaría mal.
    const [l, a, b] = srgbToLab([128, 128, 128]);
    expect(l).toBeCloseTo(53.585, 2);
    expect(a).toBeCloseTo(0, 3);
    expect(b).toBeCloseTo(0, 3);
  });

  it('da la vuelta completa rgb -> lab -> rgb sin perder el color', () => {
    const random = makeRandom(20260725);
    for (let i = 0; i < 500; i += 1) {
      const rgb: Rgb = [
        Math.floor(random() * 256),
        Math.floor(random() * 256),
        Math.floor(random() * 256),
      ];
      const roundTrip = labToSrgb(srgbToLab(rgb));
      // Un canal de tolerancia por el redondeo a entero al volver.
      expect(Math.abs(roundTrip[0] - rgb[0])).toBeLessThanOrEqual(1);
      expect(Math.abs(roundTrip[1] - rgb[1])).toBeLessThanOrEqual(1);
      expect(Math.abs(roundTrip[2] - rgb[2])).toBeLessThanOrEqual(1);
    }
  });

  it('recorta al gamut en vez de devolver canales fuera de rango', () => {
    // Un Lab muy saturado cae fuera de lo que sRGB puede representar.
    const rgb = labToSrgb([50, 120, -120]);
    for (const channel of rgb) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(255);
    }
  });
});

describe('hex', () => {
  it('parsea la forma larga y la corta', () => {
    expect(hexToRgb('#c25e4c')).toEqual([194, 94, 76]);
    expect(hexToRgb('c25e4c')).toEqual([194, 94, 76]);
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
  });

  it('da la vuelta completa hex -> rgb -> hex', () => {
    for (const hex of ['#000000', '#ffffff', '#c25e4c', '#f5efe6', '#2b2320']) {
      expect(rgbToHex(hexToRgb(hex))).toBe(hex);
    }
  });

  it('rechaza formatos inválidos', () => {
    for (const bad of ['#12345', 'nope', '', '#gggggg']) {
      expect(() => hexToRgb(bad)).toThrow();
    }
  });
});

describe('deltaE2000', () => {
  it('coincide con los 34 pares de referencia de Sharma et al.', () => {
    for (const [lab1, lab2, expected] of SHARMA_PAIRS) {
      expect(deltaE2000(lab1, lab2), `par ${JSON.stringify(lab1)} vs ${JSON.stringify(lab2)}`)
        .toBeCloseTo(expected, 4);
    }
  });

  it('da cero entre un color y sí mismo', () => {
    for (const [lab1] of SHARMA_PAIRS) {
      expect(deltaE2000(lab1, lab1)).toBeCloseTo(0, 10);
    }
  });

  it('es simétrica', () => {
    for (const [lab1, lab2] of SHARMA_PAIRS) {
      expect(deltaE2000(lab1, lab2)).toBeCloseTo(deltaE2000(lab2, lab1), 10);
    }
  });

  it('nunca devuelve NaN, ni siquiera con acromáticos puros', () => {
    // El tono es indefinido cuando C=0: si el manejo del caso está mal, sale NaN.
    const casos: readonly Lab[] = [
      [0, 0, 0],
      [100, 0, 0],
      [50, 0, 0],
      [53.585, 0, 0],
    ];
    for (const uno of casos) {
      for (const otro of casos) {
        expect(Number.isNaN(deltaE2000(uno, otro))).toBe(false);
      }
    }
  });
});

describe('asignación a paleta', () => {
  // Paleta de prueba: no es la real, solo tiene que estar bien repartida.
  const PALETA_HEX = [
    '#ffffff',
    '#000000',
    '#c25e4c',
    '#2f6f4e',
    '#2b4c8c',
    '#e8c547',
    '#f5efe6',
    '#7a4a86',
  ];
  const paletaLab: Lab[] = PALETA_HEX.map((hex) => srgbToLab(hexToRgb(hex)));

  it('elige el color exacto cuando el pixel ES un color de la paleta', () => {
    PALETA_HEX.forEach((hex, index) => {
      expect(nearestPaletteIndex(srgbToLab(hexToRgb(hex)), paletaLab)).toBe(index);
    });
  });

  it('cuando la tabla difiere del cálculo exacto, la penalización es imperceptible', () => {
    // Lo que importa NO es la tasa de coincidencia exacta: es cuánto peor se ve
    // el color cuando la tabla elige distinto. Un píxel que cae justo en la
    // frontera entre dos lanas está a la misma distancia de ambas, así que
    // elegir "la otra" no empeora nada perceptualmente.
    //
    // La unidad de referencia es el JND (just noticeable difference): un ΔE de
    // 1.0 es el umbral donde un observador entrenado recién nota la diferencia.
    const lut = buildPaletteLut(paletaLab);
    const random = makeRandom(987654321);
    const MUESTRAS = 3000;

    const penalizaciones: number[] = [];
    let coincidencias = 0;

    for (let i = 0; i < MUESTRAS; i += 1) {
      const r = Math.floor(random() * 256);
      const g = Math.floor(random() * 256);
      const b = Math.floor(random() * 256);
      const lab = srgbToLab([r, g, b]);

      const optimo = nearestPaletteIndex(lab, paletaLab);
      const deTabla = lookupPaletteIndex(lut, r, g, b);
      if (deTabla === optimo) coincidencias += 1;

      penalizaciones.push(
        deltaE2000(lab, paletaLab[deTabla]) - deltaE2000(lab, paletaLab[optimo]),
      );
    }

    penalizaciones.sort((x, y) => x - y);
    const percentil = (p: number) => penalizaciones[Math.floor(penalizaciones.length * p)];
    const media = penalizaciones.reduce((sum, v) => sum + v, 0) / penalizaciones.length;

    // La inmensa mayoría de los píxeles cae en el color óptimo, y los que no,
    // caen en uno indistinguible: ambos umbrales están MUY por debajo del JND.
    expect(coincidencias / MUESTRAS).toBeGreaterThan(0.95);
    expect(media).toBeLessThan(0.1);
    expect(percentil(0.99)).toBeLessThan(1);
  });

  it('deja como mucho un puñado de píxeles con desvío perceptible', () => {
    // Con celdas de 8 unidades sRGB, un píxel en una zona oscura y saturada
    // puede caer en una lana visiblemente distinta. Es raro y aislado, pero no
    // es cero, y conviene que quede medido y acotado en vez de ignorado.
    const lut = buildPaletteLut(paletaLab);
    const random = makeRandom(555000111);
    const MUESTRAS = 3000;
    let perceptibles = 0;

    for (let i = 0; i < MUESTRAS; i += 1) {
      const r = Math.floor(random() * 256);
      const g = Math.floor(random() * 256);
      const b = Math.floor(random() * 256);
      const lab = srgbToLab([r, g, b]);

      const optimo = nearestPaletteIndex(lab, paletaLab);
      const deTabla = lookupPaletteIndex(lut, r, g, b);
      if (deTabla === optimo) continue;

      const penalizacion = deltaE2000(lab, paletaLab[deTabla]) - deltaE2000(lab, paletaLab[optimo]);
      if (penalizacion > 1) perceptibles += 1;
    }

    expect(perceptibles / MUESTRAS).toBeLessThan(0.01);
  });

  it('resuelve los extremos exactos: negro y blanco puros', () => {
    const lut = buildPaletteLut(paletaLab);
    expect(lookupPaletteIndex(lut, 0, 0, 0)).toBe(PALETA_HEX.indexOf('#000000'));
    expect(lookupPaletteIndex(lut, 255, 255, 255)).toBe(PALETA_HEX.indexOf('#ffffff'));
  });

  it('cubre la tabla entera con índices válidos', () => {
    const lut = buildPaletteLut(paletaLab);
    expect(lut).toHaveLength(32 ** 3);
    for (const index of lut) {
      expect(index).toBeLessThan(paletaLab.length);
    }
  });

  it('rechaza una paleta vacía en vez de devolver basura', () => {
    expect(() => buildPaletteLut([])).toThrow();
  });
});
