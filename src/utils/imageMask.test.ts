import { describe, it, expect } from 'vitest';
import {
  maskFromAlpha,
  alphaChannel,
  transparentFraction,
  largestComponent,
  boundaryPoints,
  measurePiece,
  ALPHA_THRESHOLD,
} from './imageMask';
import { countMask } from './morphology';

/** Canal alfa de un disco centrado, opaco adentro y transparente afuera. */
const diskAlpha = (size: number, radiusFraction = 0.4): Uint8Array => {
  const alpha = new Uint8Array(size * size);
  const center = size / 2;
  const radius = size * radiusFraction;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x + 0.5 - center;
      const dy = y + 0.5 - center;
      alpha[y * size + x] = dx * dx + dy * dy <= radius * radius ? 255 : 0;
    }
  }
  return alpha;
};

/** Canal alfa de un rectángulo centrado. */
const rectAlpha = (size: number, wFraction: number, hFraction: number): Uint8Array => {
  const alpha = new Uint8Array(size * size);
  const halfW = (size * wFraction) / 2;
  const halfH = (size * hFraction) / 2;
  const center = size / 2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (Math.abs(x + 0.5 - center) <= halfW && Math.abs(y + 0.5 - center) <= halfH) {
        alpha[y * size + x] = 255;
      }
    }
  }
  return alpha;
};

describe('maskFromAlpha', () => {
  it('corta en el umbral de cobertura del 50%', () => {
    const alpha = Uint8Array.from([0, 127, 128, 255]);
    expect(Array.from(maskFromAlpha(alpha))).toEqual([0, 0, 1, 1]);
    expect(ALPHA_THRESHOLD).toBe(128);
  });
});

describe('alphaChannel', () => {
  it('extrae el cuarto byte de cada píxel RGBA', () => {
    const rgba = Uint8ClampedArray.from([10, 20, 30, 40, 50, 60, 70, 80]);
    expect(Array.from(alphaChannel(rgba))).toEqual([40, 80]);
  });
});

describe('transparentFraction', () => {
  it('mide qué parte de la imagen no es opaca', () => {
    expect(transparentFraction(Uint8Array.from([0, 0, 255, 255]))).toBe(0.5);
    expect(transparentFraction(Uint8Array.from([255, 255]))).toBe(0);
    expect(transparentFraction(new Uint8Array([]))).toBe(0);
  });

  it('detecta un PNG que declara alfa pero está todo opaco', () => {
    // Es el caso que, sin esta verificación, haría que la "silueta" sea el
    // rectángulo entero de la imagen.
    const opaco = new Uint8Array(400).fill(255);
    expect(transparentFraction(opaco)).toBe(0);
  });
});

describe('largestComponent', () => {
  it('descarta las motas sueltas y conserva la mancha grande', () => {
    const size = 40;
    const mask = new Uint8Array(size * size);
    // Bloque grande.
    for (let y = 5; y < 25; y += 1) for (let x = 5; x < 25; x += 1) mask[y * size + x] = 1;
    // Mota de un píxel, lejos: ruido de compresión o una firma perdida.
    mask[35 * size + 35] = 1;

    const kept = largestComponent(mask, size, size);
    expect(kept[35 * size + 35]).toBe(0);
    expect(kept[10 * size + 10]).toBe(1);
  });

  it('conserva varias manchas si todas son grandes', () => {
    // Tres letras sueltas son tres piezas, no ruido.
    const size = 60;
    const mask = new Uint8Array(size * size);
    for (const offset of [5, 25, 45]) {
      for (let y = 20; y < 35; y += 1) {
        for (let x = offset; x < offset + 10; x += 1) mask[y * size + x] = 1;
      }
    }

    expect(countMask(largestComponent(mask, size, size))).toBe(countMask(mask));
  });

  it('une lo que se toca en diagonal', () => {
    const size = 10;
    const mask = new Uint8Array(size * size);
    mask[2 * size + 2] = 1;
    mask[3 * size + 3] = 1;

    // Con vecindad de 8 son una sola pieza, así que ninguna es "mota".
    expect(countMask(largestComponent(mask, size, size))).toBe(2);
  });

  it('devuelve una máscara vacía si no hay nada encendido', () => {
    expect(countMask(largestComponent(new Uint8Array(100), 10, 10))).toBe(0);
  });

  it('no desborda la pila con una máscara grande y llena', () => {
    // Con flood fill recursivo esto reventaría: son 250.000 píxeles conexos.
    const size = 500;
    const mask = new Uint8Array(size * size).fill(1);
    expect(countMask(largestComponent(mask, size, size))).toBe(size * size);
  });
});

describe('boundaryPoints', () => {
  it('devuelve solo el contorno, no el relleno', () => {
    const size = 20;
    const mask = new Uint8Array(size * size);
    for (let y = 5; y < 15; y += 1) for (let x = 5; x < 15; x += 1) mask[y * size + x] = 1;

    const contour = boundaryPoints(mask, size, size);
    // Un cuadrado de 10x10 tiene 100 píxeles pero solo 36 de contorno.
    expect(contour.length >>> 1).toBe(36);
  });

  it('trata el filo de la imagen como contorno', () => {
    const size = 10;
    const mask = new Uint8Array(size * size).fill(1);
    // Si no se considerara el filo, una máscara llena no tendría contorno.
    expect(boundaryPoints(mask, size, size).length).toBeGreaterThan(0);
  });
});

describe('measurePiece', () => {
  it('mide el área de un disco conocido', () => {
    const size = 400;
    const alpha = diskAlpha(size, 0.4); // diámetro = 0.8 * size
    // El Feret del disco es su diámetro. Se declara que mide 80 cm.
    const result = measurePiece({ alpha, width: size, height: size, feretCm: 80, borderCm: 0.001 });

    expect(result).not.toBeNull();
    // Área del círculo de 80 cm de diámetro = π * 0.4² m² ≈ 0.5027 m².
    expect(result!.areaM2).toBeCloseTo(Math.PI * 0.4 * 0.4, 2);
  });

  it('el borde suma área, y suma más cuanto más perímetro hay', () => {
    const size = 300;
    const cuadrado = measurePiece({
      alpha: rectAlpha(size, 0.6, 0.6),
      width: size,
      height: size,
      feretCm: 100,
      borderCm: 3,
    });

    expect(cuadrado!.areaM2).toBeGreaterThan(cuadrado!.areaWithoutBorderM2);
  });

  it('mide lo mismo sin importar la resolución de la imagen', () => {
    // Esta es LA propiedad que justifica reducir toda imagen a 1024 px: la
    // medición es un ratio (área / feret²), así que la resolución se cancela.
    // Si esto fallara, el precio dependería del tamaño del archivo subido.
    const chica = measurePiece({
      alpha: diskAlpha(256, 0.4),
      width: 256,
      height: 256,
      feretCm: 80,
      borderCm: 3,
    });
    const grande = measurePiece({
      alpha: diskAlpha(1024, 0.4),
      width: 1024,
      height: 1024,
      feretCm: 80,
      borderCm: 3,
    });

    const diferencia = Math.abs(chica!.areaM2 - grande!.areaM2) / grande!.areaM2;
    expect(diferencia).toBeLessThan(0.01);
  });

  it('informa cuánto va a medir la pieza terminada, con borde', () => {
    const result = measurePiece({
      alpha: diskAlpha(300, 0.4),
      width: 300,
      height: 300,
      feretCm: 80,
      borderCm: 3,
    });

    // El borde se agrega de los dos lados: 80 + 3 + 3.
    expect(result!.finalFeretCm).toBe(86);
  });

  it('avisa cuando el diseño toca el filo de la imagen', () => {
    const size = 200;
    const alpha = new Uint8Array(size * size).fill(255);
    const result = measurePiece({ alpha, width: size, height: size, feretCm: 80, borderCm: 3 });

    expect(result!.warnings.join(' ')).toMatch(/filo|cortado/i);
  });

  it('avisa cuando la imagen casi no tiene transparencia', () => {
    const size = 200;
    const alpha = new Uint8Array(size * size).fill(255);
    const result = measurePiece({ alpha, width: size, height: size, feretCm: 80, borderCm: 3 });

    expect(result!.warnings.join(' ')).toMatch(/transparencia/i);
  });

  it('no avisa nada raro con un diseño bien recortado y con margen', () => {
    const result = measurePiece({
      alpha: diskAlpha(400, 0.35),
      width: 400,
      height: 400,
      feretCm: 80,
      borderCm: 3,
    });

    expect(result!.warnings).toHaveLength(0);
  });

  it('devuelve null si la imagen está completamente vacía', () => {
    const size = 100;
    const result = measurePiece({
      alpha: new Uint8Array(size * size),
      width: size,
      height: size,
      feretCm: 80,
      borderCm: 3,
    });

    expect(result).toBeNull();
  });

  it('la escala resultante es coherente con la medida declarada', () => {
    const size = 400;
    const result = measurePiece({
      alpha: diskAlpha(size, 0.4),
      width: size,
      height: size,
      feretCm: 80,
      borderCm: 3,
    });

    // cmPerPx * feretPx tiene que devolver los cm declarados.
    expect(result!.cmPerPx * result!.feretPx).toBeCloseTo(80, 6);
  });
});
