import { describe, it, expect } from 'vitest';
import {
  circleAreaM2,
  rectangleAreaM2,
  areaM2ForShape,
  validateDimensions,
  describeDimensions,
  describeShape,
  SHAPE_OPTIONS,
  MIN_DIMENSION_CM,
  MAX_DIMENSION_CM,
  ASPECT_RATIOS,
  dimensionsFromAspect,
  ellipseAreaM2,
  minorAxisCm,
} from './tuftingCalculator';
import { MAX_QUOTABLE_M2 } from './tuftingPricing';

describe('proporciones y óvalo', () => {
  it('deriva las medidas del rectángulo desde la proporción y el lado mayor', () => {
    expect(dimensionsFromAspect('1:1', 100)).toEqual({ widthCm: 100, heightCm: 100 });
    expect(dimensionsFromAspect('2:1', 100)).toEqual({ widthCm: 100, heightCm: 50 });
    expect(dimensionsFromAspect('4:1', 200)).toEqual({ widthCm: 200, heightCm: 50 });
  });

  it('el lado mayor siempre es sizeCm', () => {
    for (const ratio of ASPECT_RATIOS) {
      const { widthCm, heightCm } = dimensionsFromAspect(ratio.id, 150);
      expect(Math.max(widthCm, heightCm)).toBe(150);
    }
  });

  it('la elipse con ejes iguales es un círculo', () => {
    expect(ellipseAreaM2(120, 120)).toBeCloseTo(circleAreaM2(120), 10);
  });

  it('minorAxisCm achata según el ovalRatio', () => {
    expect(minorAxisCm(100, 1)).toBe(100);
    expect(minorAxisCm(100, 2)).toBe(50);
    expect(minorAxisCm(100, undefined)).toBe(100);
  });

  it('el área circular usa la elipse cuando hay ovalRatio', () => {
    const area = areaM2ForShape('circular', { diameterCm: 100, ovalRatio: 2 });
    expect(area).toBeCloseTo(ellipseAreaM2(100, 50), 10);
  });

  it('rechaza un óvalo cuyo eje menor cae por debajo del mínimo', () => {
    const issues = validateDimensions('circular', { diameterCm: 40, ovalRatio: 2 }); // menor = 20 < 25
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe('áreas', () => {
  it('calcula el área de un círculo', () => {
    // 100 cm de diámetro = 0,5 m de radio = π/4 m².
    expect(circleAreaM2(100)).toBeCloseTo(Math.PI / 4, 10);
    expect(circleAreaM2(200)).toBeCloseTo(Math.PI, 10);
  });

  it('calcula el área de un rectángulo', () => {
    expect(rectangleAreaM2(100, 100)).toBeCloseTo(1, 10);
    expect(rectangleAreaM2(150, 200)).toBeCloseTo(3, 10);
  });

  it('escala con el cuadrado de la medida', () => {
    // Duplicar el diámetro cuadruplica el área: si esto falla, hay un error de
    // unidades escondido en la conversión cm² -> m².
    expect(circleAreaM2(160) / circleAreaM2(80)).toBeCloseTo(4, 10);
  });

  it('resuelve el área según la forma', () => {
    expect(areaM2ForShape('circular', { diameterCm: 100 })).toBeCloseTo(Math.PI / 4, 10);
    expect(areaM2ForShape('rectangular', { widthCm: 100, heightCm: 200 })).toBeCloseTo(2, 10);
  });

  it('devuelve null cuando faltan medidas', () => {
    expect(areaM2ForShape('circular', {})).toBeNull();
    expect(areaM2ForShape('rectangular', { widthCm: 100 })).toBeNull();
  });

  it('devuelve null para contorneada: esa área la mide el pipeline de imagen', () => {
    expect(areaM2ForShape('contorneada', { feretCm: 80 })).toBeNull();
  });
});

describe('validateDimensions', () => {
  it('acepta medidas razonables', () => {
    expect(validateDimensions('circular', { diameterCm: 80 })).toHaveLength(0);
    expect(validateDimensions('rectangular', { widthCm: 120, heightCm: 80 })).toHaveLength(0);
    expect(validateDimensions('contorneada', { feretCm: 90 })).toHaveLength(0);
  });

  it('reclama las medidas que faltan', () => {
    expect(validateDimensions('circular', {})).toHaveLength(1);
    expect(validateDimensions('rectangular', {})).toHaveLength(2);
    expect(validateDimensions('rectangular', { widthCm: 100 })).toHaveLength(1);
  });

  it('rechaza medidas por debajo del mínimo', () => {
    const issues = validateDimensions('circular', { diameterCm: MIN_DIMENSION_CM - 1 });
    expect(issues).toHaveLength(1);
    expect(issues[0].field).toBe('diameterCm');
  });

  it('rechaza medidas por encima del máximo', () => {
    const issues = validateDimensions('circular', { diameterCm: MAX_DIMENSION_CM + 1 });
    expect(issues).toHaveLength(1);
  });

  it('rechaza números que no son números', () => {
    for (const value of [0, -10, NaN, Infinity]) {
      expect(validateDimensions('circular', { diameterCm: value }).length).toBeGreaterThan(0);
    }
  });

  it('atrapa el área total aunque cada lado esté dentro del máximo', () => {
    // 300x300 son 9 m²: cada lado pasa el techo individual pero la pieza no.
    const issues = validateDimensions('rectangular', { widthCm: 300, heightCm: 300 });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain(String(MAX_QUOTABLE_M2));
  });

  it('deja pasar una pieza justo en el máximo de área', () => {
    // 245x245 cm son 6,0025 m²... apenas por encima. 244x244 entra.
    expect(validateDimensions('rectangular', { widthCm: 244, heightCm: 244 })).toHaveLength(0);
  });
});

describe('descripciones legibles', () => {
  it('describe cada forma con sus medidas', () => {
    expect(describeDimensions('circular', { diameterCm: 80 })).toBe('80 cm de diámetro');
    expect(describeDimensions('rectangular', { widthCm: 120, heightCm: 80 })).toBe('120 x 80 cm');
    expect(describeDimensions('contorneada', { feretCm: 90 })).toContain('90 cm');
    expect(describeDimensions('contorneada', { feretCm: 90 })).toContain('borde');
  });

  it('degrada con gracia si faltan medidas', () => {
    expect(describeDimensions('circular', {})).toBe('medidas a confirmar');
  });

  it('nombra las formas', () => {
    expect(describeShape('contorneada')).toBe('Contorneada');
    expect(describeShape('circular')).toBe('Circular');
  });
});

describe('SHAPE_OPTIONS', () => {
  it('marca solo la contorneada como dependiente de la transparencia', () => {
    const requierenAlfa = SHAPE_OPTIONS.filter((option) => option.requiresAlpha);
    expect(requierenAlfa).toHaveLength(1);
    expect(requierenAlfa[0].id).toBe('contorneada');
  });

  it('usa ids únicos', () => {
    const ids = SHAPE_OPTIONS.map((option) => option.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
