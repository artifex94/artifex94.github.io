import { describe, it, expect } from 'vitest';
import {
  wools,
  availableWools,
  woolById,
  DEFAULT_BORDER_WOOL_ID,
  MAX_WOOLS_PER_PIECE,
} from './wools';
import { deltaE2000, hexToRgb, rgbToHex, srgbToLab } from '../utils/color';

describe('paleta de lanas', () => {
  it('usa ids únicos', () => {
    // Los ids se guardan en los pedidos: un duplicado corrompe el histórico.
    const ids = wools.map((wool) => wool.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('usa códigos de proveedor únicos', () => {
    const codes = wools.map((wool) => wool.code);
    expect(new Set(codes).size).toBe(codes.length);
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
    // Sin extremos, un diseño en blanco y negro se cuantiza a grises sucios.
    const luminancias = wools.map((wool) => wool.lab[0]);
    expect(Math.min(...luminancias)).toBeLessThan(25);
    expect(Math.max(...luminancias)).toBeGreaterThan(90);
  });

  it('no tiene dos lanas visualmente indistinguibles', () => {
    // Dos lanas a menos de 5 ΔE compiten por los mismos píxeles sin aportar
    // nada al diseño, y encima obligan a comprar dos conos casi iguales.
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

describe('helpers de paleta', () => {
  it('availableWools filtra las discontinuadas', () => {
    const disponibles = availableWools();
    expect(disponibles.length).toBeGreaterThan(0);
    expect(disponibles.every((wool) => wool.available)).toBe(true);
  });

  it('woolById encuentra por id y devuelve undefined si no existe', () => {
    expect(woolById(wools[0].id)).toEqual(wools[0]);
    expect(woolById('no-existe')).toBeUndefined();
  });

  it('la lana de borde por defecto existe y está disponible', () => {
    const borde = woolById(DEFAULT_BORDER_WOOL_ID);
    expect(borde).toBeDefined();
    expect(borde?.available).toBe(true);
  });

  it('el tope de lanas por pieza es alcanzable con el stock actual', () => {
    expect(MAX_WOOLS_PER_PIECE).toBeGreaterThan(1);
    expect(availableWools().length).toBeGreaterThanOrEqual(MAX_WOOLS_PER_PIECE);
  });
});
