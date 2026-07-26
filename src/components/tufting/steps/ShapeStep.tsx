import React from 'react';
import { Check, Lock } from 'lucide-react';
import { cn } from '../../../utils/cn';
import {
  ASPECT_RATIOS,
  MAX_DIMENSION_CM,
  MIN_DIMENSION_CM,
  OVAL_RATIO_MAX,
  SHAPE_OPTIONS,
  describeDimensions,
  validateDimensions,
  type Dimensions,
} from '../../../data/tuftingCalculator';
import { BORDER_WIDTH_CM } from '../../../data/tuftingPricing';
import { wools, woolById } from '../../../data/wools';
import type { CalculatorAction, CalculatorState } from '../../../hooks/useCalculatorState';

interface ShapeStepProps {
  state: CalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
  /** Estado de la medición automática. Solo se usa en la forma contorneada. */
  pipeline: {
    status: 'idle' | 'running' | 'done' | 'error';
    error: string | null;
  };
}

interface DimensionFieldProps {
  id: keyof Dimensions;
  label: string;
  hint?: string;
  value: number | undefined;
  error?: string;
  onChange: (value: number | undefined) => void;
}

const DimensionField: React.FC<DimensionFieldProps> = ({
  id,
  label,
  hint,
  value,
  error,
  onChange,
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-semibold">
      {label}
    </label>
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={MIN_DIMENSION_CM}
        max={MAX_DIMENSION_CM}
        value={value ?? ''}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={error ? true : undefined}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === '' ? undefined : Number(raw));
        }}
        className={cn(
          'w-32 bg-surface border rounded-lg px-3 py-2 min-h-11 text-primary',
          error ? 'border-accent' : 'border-line',
        )}
      />
      <span className="text-secondary text-sm">cm</span>
    </div>
    {hint && !error && (
      <p id={`${id}-hint`} className="text-xs text-secondary">
        {hint}
      </p>
    )}
    {error && (
      <p id={`${id}-error`} role="alert" className="text-xs text-accent">
        {error}
      </p>
    )}
  </div>
);

interface RangeControlProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  describedBy?: string;
  invalid?: boolean;
  onChange: (value: number) => void;
}

const RangeControl: React.FC<RangeControlProps> = ({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  describedBy,
  invalid,
  onChange,
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <output htmlFor={id} aria-live="polite" className="text-sm font-mono text-secondary">
        {value.toLocaleString('es-AR', { maximumFractionDigits: 1 })}
        {unit}
      </output>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-describedby={describedBy}
      aria-invalid={invalid ? true : undefined}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full min-h-11 accent-[var(--color-accent)]"
    />
    <div className="flex justify-between text-[11px] text-secondary" aria-hidden="true">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

interface SwatchPaletteProps {
  id: string;
  label: string;
  selectedWoolId: string;
  disabled?: boolean;
  onSelect: (woolId: string) => void;
}

const SwatchPalette: React.FC<SwatchPaletteProps> = ({
  id,
  label,
  selectedWoolId,
  disabled = false,
  onSelect,
}) => (
  <fieldset className={cn('flex flex-col gap-3', disabled && 'opacity-45')} disabled={disabled}>
    <legend className="text-sm font-semibold mb-1">
      {label}
      <span className="text-secondary font-normal"> · {woolById(selectedWoolId)?.name}</span>
    </legend>
    <ul className="grid grid-cols-4 sm:grid-cols-6 gap-2 list-none p-0">
      {wools.map((wool) => {
        const selected = wool.id === selectedWoolId;
        return (
          <li key={`${id}-${wool.id}`}>
            <button
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              aria-label={`${label}: ${wool.name}`}
              title={wool.name}
              onClick={() => onSelect(wool.id)}
              className={cn(
                'relative w-full aspect-square rounded-lg border-2 transition-transform min-h-11',
                selected ? 'border-accent scale-105' : 'border-line hover:border-accent',
                disabled && 'cursor-not-allowed hover:border-line',
              )}
              style={{ backgroundColor: wool.hex }}
            >
              {selected && (
                <Check
                  size={16}
                  className="absolute inset-0 m-auto text-white drop-shadow"
                  aria-hidden="true"
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  </fieldset>
);

const DesignerControls: React.FC<{
  state: CalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
  issues: readonly { message: string }[];
}> = ({ state, dispatch, issues }) => {
  const { shape, dimensions } = state;
  if (shape !== 'circular' && shape !== 'rectangular') return null;

  return (
    <div className="flex flex-col gap-6">
      {shape === 'rectangular' && (
        <div className="flex flex-col gap-5 rounded-2xl border border-line bg-surface/70 p-4">
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-semibold mb-1">Proporción</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ratio) => {
                const selected = ratio.id === state.aspectRatioId;
                return (
                  <button
                    key={ratio.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => dispatch({ type: 'aspect-selected', aspectId: ratio.id })}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-left text-sm font-semibold min-h-11 transition-colors',
                      selected ? 'border-accent bg-accent/5 text-accent' : 'border-line hover:border-accent',
                    )}
                  >
                    {ratio.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <RangeControl
            id="rect-size"
            label="Tamaño del lado mayor"
            value={state.sizeCm}
            min={MIN_DIMENSION_CM}
            max={MAX_DIMENSION_CM}
            unit=" cm"
            invalid={issues.length > 0}
            describedBy={issues.length > 0 ? 'shape-dimension-errors' : 'shape-result'}
            onChange={(sizeCm) => dispatch({ type: 'size-changed', sizeCm })}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'rotate-step' })}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold min-h-11 hover:border-accent hover:text-accent"
            >
              Rotar 90°
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'rotate-reset' })}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold min-h-11 hover:border-accent hover:text-accent"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {shape === 'circular' && (
        <div className="flex flex-col gap-5 rounded-2xl border border-line bg-surface/70 p-4">
          <RangeControl
            id="circle-size"
            label="Diámetro"
            value={state.sizeCm}
            min={MIN_DIMENSION_CM}
            max={MAX_DIMENSION_CM}
            unit=" cm"
            invalid={issues.length > 0}
            describedBy={issues.length > 0 ? 'shape-dimension-errors' : 'shape-result'}
            onChange={(sizeCm) => dispatch({ type: 'size-changed', sizeCm })}
          />
          <RangeControl
            id="circle-oval"
            label="Ovalado"
            value={state.ovalRatio}
            min={1}
            max={OVAL_RATIO_MAX}
            step={0.1}
            invalid={issues.length > 0}
            describedBy={issues.length > 0 ? 'shape-dimension-errors' : 'shape-result'}
            onChange={(ovalRatio) => dispatch({ type: 'oval-changed', ovalRatio })}
          />
          <RangeControl
            id="circle-rotation"
            label="Rotación del diseño"
            value={state.rotationDeg}
            min={0}
            max={360}
            unit="°"
            onChange={(deg) => dispatch({ type: 'rotate-set', deg })}
          />
        </div>
      )}

      {issues.length > 0 && (
        <div id="shape-dimension-errors" role="alert" className="rounded-xl border border-accent/35 bg-accent/5 p-3 text-sm text-accent">
          {issues.map((issue) => (
            <p key={issue.message}>{issue.message}</p>
          ))}
        </div>
      )}

      <p id="shape-result" className="rounded-xl border border-line bg-base p-3 text-sm">
        Medida resultante:{' '}
        <strong className="font-semibold">{describeDimensions(shape, dimensions)}</strong>
      </p>

      <SwatchPalette
        id="fill"
        label="Color de relleno"
        selectedWoolId={state.fillWoolId}
        onSelect={(woolId) => dispatch({ type: 'fill-selected', woolId })}
      />

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 text-sm font-semibold min-h-11 cursor-pointer">
          <input
            type="checkbox"
            checked={state.borderSameAsFill}
            onChange={() => dispatch({ type: 'border-same-toggled' })}
            className="accent-current"
          />
          Mismo color que el relleno
        </label>
        <SwatchPalette
          id="border"
          label="Color de borde"
          selectedWoolId={state.borderWoolId}
          disabled={state.borderSameAsFill}
          onSelect={(woolId) => dispatch({ type: 'border-selected', woolId })}
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 text-sm font-semibold min-h-11 cursor-pointer">
        <input
          type="checkbox"
          checked={state.borderThick}
          onChange={() => dispatch({ type: 'border-thick-toggled' })}
          className="accent-current"
        />
        Borde grueso
      </label>
    </div>
  );
};

export const ShapeStep: React.FC<ShapeStepProps> = ({ state, dispatch, pipeline }) => {
  const { shape, dimensions, upload } = state;
  const issues = shape ? validateDimensions(shape, dimensions) : [];
  const errorFor = (field: keyof Dimensions): string | undefined =>
    issues.find((issue) => issue.field === field)?.message;

  const setDimension = (field: keyof Dimensions) => (value: number | undefined) =>
    dispatch({ type: 'dimension-changed', field, value });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-2">Elegí la forma</h2>
        <p className="text-secondary text-sm">
          Las medidas son las de la alfombra terminada, con el borde incluido.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SHAPE_OPTIONS.map((option) => {
          const blocked = option.requiresAlpha && !upload?.contourable;
          const selected = shape === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={blocked}
              aria-pressed={selected}
              onClick={() => dispatch({ type: 'shape-selected', shape: option.id })}
              className={cn(
                'text-left p-5 rounded-2xl border transition-colors min-h-11',
                selected ? 'border-accent bg-accent/5' : 'border-line bg-surface',
                blocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent',
              )}
            >
              <span className="flex items-center gap-2 font-display font-semibold mb-1">
                {blocked && <Lock size={14} aria-hidden="true" />}
                {option.name}
              </span>
              <span className="block text-sm text-secondary leading-relaxed">{option.desc}</span>
              {blocked && (
                <span className="block text-xs text-accent mt-2">
                  Necesita un PNG con fondo transparente.
                </span>
              )}
            </button>
          );
        })}
      </div>

      <DesignerControls state={state} dispatch={dispatch} issues={issues} />

      {shape === 'contorneada' && (
        <div className="flex flex-col gap-4">
          <DimensionField
            id="feretCm"
            label="Medida más larga del diseño"
            hint={`De punta a punta, sin contar el borde. Le sumo ${BORDER_WIDTH_CM} cm de borde alrededor.`}
            value={dimensions.feretCm}
            error={errorFor('feretCm')}
            onChange={setDimension('feretCm')}
          />

          {/* La medición en sí se ve en el bastidor: la cinta métrica sobre la
              imagen y la ficha con el área. Acá solo queda el error, que es lo
              único accionable desde este formulario. */}
          {pipeline.status === 'error' && pipeline.error && (
            <p role="alert" className="text-sm text-accent">
              {pipeline.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
