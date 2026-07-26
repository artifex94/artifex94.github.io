import { describe, it, expect } from 'vitest';
import {
  calculatorReducer,
  initialCalculatorState,
  canAdvance,
  resolveAreaM2,
  type CalculatorState,
} from './useCalculatorState';
import type { ImageHeaderInfo } from '../utils/imageFormat';
import { DEFAULT_BORDER_WOOL_ID, wools } from '../data/wools';

const PNG_CON_ALFA: ImageHeaderInfo = {
  format: 'png',
  width: 1000,
  height: 800,
  hasAlphaChannel: true,
};

const JPEG: ImageHeaderInfo = { format: 'jpeg', hasAlphaChannel: false };

const subirArchivo = (
  info: ImageHeaderInfo,
  state = initialCalculatorState,
  contourable = info.hasAlphaChannel,
): CalculatorState =>
  calculatorReducer(state, {
    type: 'file-accepted',
    fileName: 'diseño.png',
    objectUrl: 'blob:fake',
    info,
    contourable,
  });

describe('subida de archivo', () => {
  it('avanza al paso de forma y marca si se puede contornear', () => {
    const state = subirArchivo(PNG_CON_ALFA);
    expect(state.step).toBe('shape');
    expect(state.upload?.contourable).toBe(true);
  });

  it('marca los archivos sin transparencia como no contorneables', () => {
    expect(subirArchivo(JPEG).upload?.contourable).toBe(false);
  });

  it('usa el alfa real detectado aunque la cabecera no declare PNG con alfa', () => {
    expect(subirArchivo(JPEG, initialCalculatorState, true).upload?.contourable).toBe(true);
  });

  it('descarta todo lo derivado del archivo anterior', () => {
    // Si no se reseteara, quedaría un área medida sobre OTRA imagen.
    let state = subirArchivo(PNG_CON_ALFA);
    state = calculatorReducer(state, { type: 'shape-selected', shape: 'contorneada' });
    state = calculatorReducer(state, { type: 'dimension-changed', field: 'feretCm', value: 80 });
    state = calculatorReducer(state, { type: 'measured', areaM2: 1.2 });

    const conOtroArchivo = subirArchivo(JPEG, state);
    expect(conOtroArchivo.shape).toBeNull();
    expect(conOtroArchivo.measuredAreaM2).toBeNull();
    expect(conOtroArchivo.dimensions).toEqual({});
  });

  it('un rechazo limpia el estado y guarda el motivo', () => {
    const state = calculatorReducer(subirArchivo(PNG_CON_ALFA), {
      type: 'file-rejected',
      message: 'El archivo pesa más de 15 MB.',
    });
    expect(state.upload).toBeNull();
    expect(state.uploadError).toContain('15 MB');
  });
});

describe('elección de forma', () => {
  it('no deja elegir contorneada sin transparencia', () => {
    const state = subirArchivo(JPEG);
    const intento = calculatorReducer(state, { type: 'shape-selected', shape: 'contorneada' });
    expect(intento.shape).toBeNull();
  });

  it('deja elegir contorneada con un PNG con alfa', () => {
    const state = subirArchivo(PNG_CON_ALFA);
    const elegida = calculatorReducer(state, { type: 'shape-selected', shape: 'contorneada' });
    expect(elegida.shape).toBe('contorneada');
  });

  it('cambiar de forma descarta las medidas anteriores', () => {
    // Un diámetro no significa lo mismo que un ancho: arrastrarlo sería un bug.
    let state = subirArchivo(PNG_CON_ALFA);
    state = calculatorReducer(state, { type: 'shape-selected', shape: 'circular' });
    state = calculatorReducer(state, { type: 'dimension-changed', field: 'diameterCm', value: 80 });
    state = calculatorReducer(state, { type: 'shape-selected', shape: 'rectangular' });

    expect(state.dimensions).toEqual({});
  });

  it('reelegir la misma forma no borra nada', () => {
    let state = subirArchivo(PNG_CON_ALFA);
    state = calculatorReducer(state, { type: 'shape-selected', shape: 'circular' });
    state = calculatorReducer(state, { type: 'dimension-changed', field: 'diameterCm', value: 80 });
    const igual = calculatorReducer(state, { type: 'shape-selected', shape: 'circular' });

    expect(igual.dimensions.diameterCm).toBe(80);
  });
});

describe('medidas y área', () => {
  it('cambiar la medida declarada invalida el área medida', () => {
    // El feret declarado ES la escala: si cambia, el área en m² ya no vale.
    let state = subirArchivo(PNG_CON_ALFA);
    state = calculatorReducer(state, { type: 'shape-selected', shape: 'contorneada' });
    state = calculatorReducer(state, { type: 'dimension-changed', field: 'feretCm', value: 80 });
    state = calculatorReducer(state, { type: 'measured', areaM2: 1.2 });
    state = calculatorReducer(state, { type: 'dimension-changed', field: 'feretCm', value: 120 });

    expect(state.measuredAreaM2).toBeNull();
  });

  it('resuelve el área por fórmula en las formas simples', () => {
    let state = subirArchivo(JPEG);
    state = calculatorReducer(state, { type: 'shape-selected', shape: 'rectangular' });
    state = calculatorReducer(state, { type: 'dimension-changed', field: 'widthCm', value: 100 });
    state = calculatorReducer(state, { type: 'dimension-changed', field: 'heightCm', value: 200 });

    expect(resolveAreaM2(state)).toBeCloseTo(2, 10);
  });

  it('resuelve el área desde la medición en contorneada', () => {
    let state = subirArchivo(PNG_CON_ALFA);
    state = calculatorReducer(state, { type: 'shape-selected', shape: 'contorneada' });
    state = calculatorReducer(state, { type: 'measured', areaM2: 0.91 });

    expect(resolveAreaM2(state)).toBe(0.91);
  });
});

describe('color del borde', () => {
  it('arranca con el borde por defecto', () => {
    expect(initialCalculatorState.borderWoolId).toBe(DEFAULT_BORDER_WOOL_ID);
  });

  it('elige el color del borde', () => {
    const otro = wools.find((wool) => wool.id !== DEFAULT_BORDER_WOOL_ID)!;
    const state = calculatorReducer(initialCalculatorState, {
      type: 'border-selected',
      woolId: otro.id,
    });
    expect(state.borderWoolId).toBe(otro.id);
  });

  it('el paso de colores nunca queda incompleto (los colores salen del diseño)', () => {
    let state = subirArchivo(JPEG);
    state = calculatorReducer(state, { type: 'shape-selected', shape: 'circular' });
    state = calculatorReducer(state, { type: 'dimension-changed', field: 'diameterCm', value: 80 });
    state = calculatorReducer(state, { type: 'next' });
    expect(state.step).toBe('colors');
    expect(canAdvance(state)).toBe(true);
  });
});

describe('navegación entre pasos', () => {
  it('no avanza sin haber subido un archivo', () => {
    expect(canAdvance(initialCalculatorState)).toBe(false);
    expect(calculatorReducer(initialCalculatorState, { type: 'next' }).step).toBe('upload');
  });

  it('no avanza de forma sin medidas válidas', () => {
    let state = subirArchivo(JPEG);
    state = calculatorReducer(state, { type: 'shape-selected', shape: 'circular' });
    expect(canAdvance(state)).toBe(false);

    state = calculatorReducer(state, { type: 'dimension-changed', field: 'diameterCm', value: 5 });
    expect(canAdvance(state)).toBe(false);

    state = calculatorReducer(state, { type: 'dimension-changed', field: 'diameterCm', value: 80 });
    expect(canAdvance(state)).toBe(true);
  });

  it('no avanza en contorneada hasta que la imagen esté medida', () => {
    let state = subirArchivo(PNG_CON_ALFA);
    state = calculatorReducer(state, { type: 'shape-selected', shape: 'contorneada' });
    state = calculatorReducer(state, { type: 'dimension-changed', field: 'feretCm', value: 80 });
    expect(canAdvance(state)).toBe(false);

    state = calculatorReducer(state, { type: 'measured', areaM2: 0.91 });
    expect(canAdvance(state)).toBe(true);
  });

  it('deja volver atrás siempre', () => {
    let state = subirArchivo(JPEG);
    expect(state.step).toBe('shape');
    state = calculatorReducer(state, { type: 'back' });
    expect(state.step).toBe('upload');
    // Ya en el primero, retroceder no rompe nada.
    expect(calculatorReducer(state, { type: 'back' }).step).toBe('upload');
  });

  it('deja saltar hacia atrás a cualquier paso ya visitado', () => {
    let state = subirArchivo(JPEG);
    state = calculatorReducer(state, { type: 'shape-selected', shape: 'circular' });
    state = calculatorReducer(state, { type: 'dimension-changed', field: 'diameterCm', value: 80 });
    state = calculatorReducer(state, { type: 'next' });
    expect(state.step).toBe('colors');

    expect(calculatorReducer(state, { type: 'go-to-step', step: 'upload' }).step).toBe('upload');
  });

  it('no deja saltear un paso incompleto', () => {
    // Llegar al presupuesto sin medidas mostraría un total inventado.
    const state = subirArchivo(JPEG);
    expect(calculatorReducer(state, { type: 'go-to-step', step: 'quote' }).step).toBe('shape');
  });

  it('reset vuelve al estado inicial', () => {
    const state = subirArchivo(PNG_CON_ALFA);
    expect(calculatorReducer(state, { type: 'reset' })).toEqual(initialCalculatorState);
  });
});
