import { describe, it, expect } from 'vitest';
import {
  wools,
  woolById,
  DEFAULT_BORDER_WOOL_ID,
  MAX_WOOLS_PER_PIECE,
  CHROMA_CEILING,
  MATTE_SCALE,
  woolToneLab,
  toWoolTone,
  nameForTone,
} from './wools';
import { deltaE2000, hexToRgb, rgbToHex, srgbToLab } from '../utils/color';

describe('tonos de referencia', () => {
  it('usa ids únicos', () => {
    const ids = wools.map((wool) => wool.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('deriva rgb y lab del hex, sin escribirlos a mano', () => {
    for (const wool of wools) {
      expect(wool.rgb).toEqual(hexToRgb(wool.hex));
      expect(wool.lab).toEqual(srgbToLab(wool.rgb));
    }
  });

  it('acepta solo hex de seis dígitos en minúscula', () => {
    for (const wool of wools) {
      expect(wool.hex, `${wool.id} tiene un hex mal formado`).toMatch(/^#[0-9a-f]{6}$/);
      // Round-trip: garantiza que el hex sobrevive el parseo sin perder precisión.
      expect(rgbToHex(wool.rgb)).toBe(wool.hex);
    }
  });

  it('tiene al menos un blanco y un negro para cubrir los extremos', () => {
    // Sin extremos, un diseño en blanco y negro se nombraría con grises sucios.
    const luminancias = wools.map((wool) => wool.lab[0]);
    expect(Math.min(...luminancias)).toBeLessThan(25);
    expect(Math.max(...luminancias)).toBeGreaterThan(90);
  });

  it('no tiene dos tonos visualmente indistinguibles', () => {
    // Dos nombres a menos de 5 ΔE describirían el mismo color: nombrar se vuelve
    // ambiguo y elegir el borde, confuso.
    for (let i = 0; i < wools.length; i += 1) {
      for (let j = i + 1; j < wools.length; j += 1) {
        const distancia = deltaE2000(wools[i].lab, wools[j].lab);
        expect(
          distancia,
          `"${wools[i].name}" y "${wools[j].name}" son casi el mismo color (ΔE ${distancia.toFixed(1)})`,
        ).toBeGreaterThan(5);
      }
    }
  });
});

describe('helpers de referencia', () => {
  it('woolById encuentra por id y devuelve undefined si no existe', () => {
    expect(woolById(wools[0].id)).toEqual(wools[0]);
    expect(woolById('no-existe')).toBeUndefined();
  });

  it('el color de borde por defecto existe', () => {
    expect(woolById(DEFAULT_BORDER_WOOL_ID)).toBeDefined();
  });

  it('el tope de colores por pieza es razonable', () => {
    expect(MAX_WOOLS_PER_PIECE).toBeGreaterThan(1);
  });
});

describe('toWoolTone / woolToneLab (realismo de la lana)', () => {
  it('deja intactos los acromáticos: blanco, negro y gris', () => {
    for (const hex of ['#ffffff', '#000000', '#808080']) {
      const rgb = hexToRgb(hex);
      const lab = srgbToLab(rgb);
      // El croma de un gris puro es ~0, así que no se toca.
      expect(woolToneLab(lab)).toEqual(lab);
    }
  });

  it('apaga un color neón preservando el tono', () => {
    const rgb = hexToRgb('#39ff14'); // verde fluor
    const originalLab = srgbToLab(rgb);
    const { lab } = toWoolTone(rgb);

    const originalChroma = Math.hypot(originalLab[1], originalLab[2]);
    const woolChroma = Math.hypot(lab[1], lab[2]);
    // Baja el croma de forma notable...
    expect(woolChroma).toBeLessThan(originalChroma);
    // ...y no supera el techo apagado.
    expect(woolChroma).toBeLessThanOrEqual(CHROMA_CEILING * MATTE_SCALE + 1e-6);

    // El tono (ángulo a/b) se mantiene: sigue siendo verde, no vira a otro color.
    const originalHue = Math.atan2(originalLab[2], originalLab[1]);
    const woolHue = Math.atan2(lab[2], lab[1]);
    expect(Math.abs(originalHue - woolHue)).toBeLessThan(1e-6);
  });

  it('un color ya dentro de gama solo se apaga por el factor mate', () => {
    // Un color de croma moderado (por debajo del techo) no se recorta: solo baja
    // por MATTE_SCALE.
    const lab = srgbToLab(hexToRgb('#8fb4d9')); // celeste suave
    const chroma = Math.hypot(lab[1], lab[2]);
    expect(chroma).toBeLessThan(CHROMA_CEILING);
    const result = woolToneLab(lab);
    const resultChroma = Math.hypot(result[1], result[2]);
    expect(resultChroma).toBeCloseTo(chroma * MATTE_SCALE, 5);
  });
});

describe('nameForTone', () => {
  it('nombra un color con el tono de referencia más cercano', () => {
    expect(nameForTone(srgbToLab(hexToRgb('#1a1a1a')))).toBe('Negro');
    expect(nameForTone(srgbToLab(hexToRgb('#c25e4c')))).toBe('Terracota');
    // Un terracota apenas corrido sigue siendo Terracota.
    expect(nameForTone(srgbToLab(hexToRgb('#c46050')))).toBe('Terracota');
  });
});
