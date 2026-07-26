import { useReducer, type Dispatch } from 'react';
import type { ImageHeaderInfo } from '../utils/imageFormat';
import type { Dimensions, Shape } from '../data/tuftingCalculator';
import {
  areaM2ForShape,
  validateDimensions,
  dimensionsFromAspect,
  DEFAULT_ASPECT_RATIO_ID,
} from '../data/tuftingCalculator';
import type { DiscountId } from '../data/tuftingPricing';
import { DEFAULT_BORDER_WOOL_ID } from '../data/wools';

/** Tono de relleno inicial: un neutro claro (id de un tono de referencia de wools). */
export const DEFAULT_FILL_WOOL_ID = 'blanco-crudo';
/** Tamaño inicial de la pieza (lado mayor del rectángulo / diámetro del círculo), en cm. */
export const DEFAULT_SIZE_CM = 120;
/** Salto de rotación para el rectángulo, en grados. */
export const ROTATION_STEP_DEG = 90;

// Estado de la calculadora, como reducer puro.
//
// Se usa useReducer y no una librería de estado porque el flujo es lineal y
// vive en una sola ruta: meter zustand o xstate acá sería sumar una dependencia
// para diez campos. Lo importante es que el reducer y canAdvance son funciones
// puras, así que se testean sin montar un componente.

export const STEPS = ['upload', 'shape', 'colors', 'quote'] as const;
export type Step = (typeof STEPS)[number];

export interface UploadState {
  fileName: string;
  /** URL temporal para previsualizar. Hay que revocarla al reemplazar el archivo. */
  objectUrl: string;
  info: ImageHeaderInfo;
  /** true si el archivo habilita la forma contorneada (alfa real detectado en píxeles). */
  contourable: boolean;
}

export interface CalculatorState {
  step: Step;
  upload: UploadState | null;
  /** Motivo por el que se rechazó el último archivo, para mostrarlo en la UI. */
  uploadError: string | null;
  shape: Shape | null;
  dimensions: Dimensions;
  /** Área medida sobre la imagen. Solo la usa la forma contorneada. */
  measuredAreaM2: number | null;
  // --- Diseñador de circular/rectangular ---
  /** Proporción del rectángulo (id de ASPECT_RATIOS). */
  aspectRatioId: string;
  /** Tamaño de la pieza: lado mayor del rectángulo / diámetro del círculo, en cm. */
  sizeCm: number;
  /** Ovalado del círculo: 1 = círculo; >1 achata el eje menor. */
  ovalRatio: number;
  /** Rotación de la imagen dentro de la forma, en grados. */
  rotationDeg: number;
  /** Tono de referencia del relleno. */
  fillWoolId: string;
  /** Tono de referencia elegido para el borde perimetral. */
  borderWoolId: string;
  /** Si el borde usa el mismo color que el relleno. */
  borderSameAsFill: boolean;
  /** Borde grueso (true) o normal (false). */
  borderThick: boolean;
  discounts: readonly DiscountId[];
}

export const initialCalculatorState: CalculatorState = {
  step: 'upload',
  upload: null,
  uploadError: null,
  shape: null,
  dimensions: {},
  measuredAreaM2: null,
  aspectRatioId: DEFAULT_ASPECT_RATIO_ID,
  sizeCm: DEFAULT_SIZE_CM,
  ovalRatio: 1,
  rotationDeg: 0,
  fillWoolId: DEFAULT_FILL_WOOL_ID,
  borderWoolId: DEFAULT_BORDER_WOOL_ID,
  borderSameAsFill: false,
  borderThick: false,
  discounts: [],
};

/** Medidas derivadas de los controles del diseñador, para una forma dada. */
const designerDimensions = (
  shape: Shape,
  aspectRatioId: string,
  sizeCm: number,
  ovalRatio: number,
): Dimensions => {
  if (shape === 'rectangular') return dimensionsFromAspect(aspectRatioId, sizeCm);
  if (shape === 'circular') return { diameterCm: sizeCm, ovalRatio };
  return {};
};

export type CalculatorAction =
  | {
      type: 'file-accepted';
      fileName: string;
      objectUrl: string;
      info: ImageHeaderInfo;
      contourable: boolean;
    }
  | { type: 'file-rejected'; message: string }
  | { type: 'shape-selected'; shape: Shape }
  | { type: 'dimension-changed'; field: keyof Dimensions; value: number | undefined }
  | { type: 'measured'; areaM2: number }
  | { type: 'border-selected'; woolId: string }
  | { type: 'aspect-selected'; aspectId: string }
  | { type: 'size-changed'; sizeCm: number }
  | { type: 'oval-changed'; ovalRatio: number }
  | { type: 'rotate-step' }
  | { type: 'rotate-set'; deg: number }
  | { type: 'rotate-reset' }
  | { type: 'fill-selected'; woolId: string }
  | { type: 'border-same-toggled' }
  | { type: 'border-thick-toggled' }
  | { type: 'discount-toggled'; discount: DiscountId }
  | { type: 'go-to-step'; step: Step }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'reset' };

const stepIndex = (step: Step): number => STEPS.indexOf(step);

export const calculatorReducer = (
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState => {
  switch (action.type) {
    case 'file-accepted': {
      // Un archivo nuevo invalida todo lo que se derivó del anterior: la forma
      // elegida puede ya no estar disponible y el área medida no corresponde.
      return {
        ...initialCalculatorState,
        step: 'shape',
        upload: {
          fileName: action.fileName,
          objectUrl: action.objectUrl,
          info: action.info,
          contourable: action.contourable,
        },
      };
    }

    case 'file-rejected':
      return { ...initialCalculatorState, uploadError: action.message };

    case 'shape-selected': {
      // No se puede elegir contorneada si el archivo no tiene transparencia.
      if (action.shape === 'contorneada' && !state.upload?.contourable) return state;
      if (action.shape === state.shape) return state;
      // En circular/rectangular el diseñador arranca con medidas válidas derivadas
      // de sus controles; contorneada mide sobre la imagen (dimensiones vacías).
      return {
        ...state,
        shape: action.shape,
        dimensions: designerDimensions(action.shape, state.aspectRatioId, state.sizeCm, state.ovalRatio),
        rotationDeg: 0,
        measuredAreaM2: null,
      };
    }

    case 'dimension-changed':
      return {
        ...state,
        dimensions: { ...state.dimensions, [action.field]: action.value },
        // La medida declarada cambia la escala, así que el área medida caduca.
        measuredAreaM2: action.field === 'feretCm' ? null : state.measuredAreaM2,
      };

    case 'measured':
      return { ...state, measuredAreaM2: action.areaM2 };

    case 'border-selected':
      // En contorneada, el color del borde perimetral (el resto sale del pipeline).
      return { ...state, borderWoolId: action.woolId };

    case 'aspect-selected':
      return {
        ...state,
        aspectRatioId: action.aspectId,
        dimensions: designerDimensions('rectangular', action.aspectId, state.sizeCm, state.ovalRatio),
      };

    case 'size-changed':
      return {
        ...state,
        sizeCm: action.sizeCm,
        dimensions: state.shape
          ? designerDimensions(state.shape, state.aspectRatioId, action.sizeCm, state.ovalRatio)
          : state.dimensions,
      };

    case 'oval-changed':
      return {
        ...state,
        ovalRatio: action.ovalRatio,
        dimensions: designerDimensions('circular', state.aspectRatioId, state.sizeCm, action.ovalRatio),
      };

    case 'rotate-step':
      return { ...state, rotationDeg: (state.rotationDeg + ROTATION_STEP_DEG) % 360 };

    case 'rotate-set':
      return { ...state, rotationDeg: ((action.deg % 360) + 360) % 360 };

    case 'rotate-reset':
      return { ...state, rotationDeg: 0 };

    case 'fill-selected':
      return { ...state, fillWoolId: action.woolId };

    case 'border-same-toggled':
      return { ...state, borderSameAsFill: !state.borderSameAsFill };

    case 'border-thick-toggled':
      return { ...state, borderThick: !state.borderThick };

    case 'discount-toggled': {
      const alreadyPicked = state.discounts.includes(action.discount);
      return {
        ...state,
        discounts: alreadyPicked
          ? state.discounts.filter((id) => id !== action.discount)
          : [...state.discounts, action.discount],
      };
    }

    case 'go-to-step': {
      // Solo se puede saltar hacia atrás, o hacia adelante si el paso actual
      // está completo: si no, se llegaría al presupuesto sin medidas.
      const target = stepIndex(action.step);
      const current = stepIndex(state.step);
      if (target < current) return { ...state, step: action.step };
      if (target === current + 1 && canAdvance(state)) return { ...state, step: action.step };
      return state;
    }

    case 'next': {
      if (!canAdvance(state)) return state;
      const next = STEPS[Math.min(stepIndex(state.step) + 1, STEPS.length - 1)];
      return { ...state, step: next };
    }

    case 'back': {
      const previous = STEPS[Math.max(stepIndex(state.step) - 1, 0)];
      return { ...state, step: previous };
    }

    case 'reset':
      return initialCalculatorState;

    default:
      return state;
  }
};

/** ¿El paso actual está completo? Función pura: la UI la usa para habilitar el botón. */
export const canAdvance = (state: CalculatorState): boolean => {
  switch (state.step) {
    case 'upload':
      return state.upload !== null;

    case 'shape': {
      if (!state.shape) return false;
      if (validateDimensions(state.shape, state.dimensions).length > 0) return false;
      // En contorneada el área la mide el pipeline: sin medición no se sigue.
      if (state.shape === 'contorneada') return state.measuredAreaM2 !== null;
      return true;
    }

    case 'colors':
      // Los colores salen del propio diseño y el borde tiene un default: el paso
      // es una revelación, no un formulario que pueda quedar incompleto.
      return true;

    case 'quote':
      return false;

    default:
      return false;
  }
};

/**
 * Área final de la pieza en m², o null si todavía no se puede calcular.
 *
 * En contorneada sale de medir la imagen (con el borde ya dilatado); en las
 * formas simples sale de la fórmula sobre las medidas que dio el cliente.
 */
export const resolveAreaM2 = (state: CalculatorState): number | null => {
  if (!state.shape) return null;
  if (state.shape === 'contorneada') return state.measuredAreaM2;
  return areaM2ForShape(state.shape, state.dimensions);
};

export const useCalculatorState = (): [CalculatorState, Dispatch<CalculatorAction>] => {
  const [state, dispatch] = useReducer(calculatorReducer, initialCalculatorState);
  return [state, dispatch];
};
