import React from 'react';
import { Lock, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import {
  SHAPE_OPTIONS,
  validateDimensions,
  MIN_DIMENSION_CM,
  MAX_DIMENSION_CM,
  type Dimensions,
} from '../../../data/tuftingCalculator';
import { BORDER_WIDTH_CM } from '../../../data/tuftingPricing';
import type { CalculatorAction, CalculatorState } from '../../../hooks/useCalculatorState';

interface ShapeStepProps {
  state: CalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
  /** Estado de la medición automática. Solo se usa en la forma contorneada. */
  pipeline: {
    status: 'idle' | 'running' | 'done' | 'error';
    error: string | null;
    result: { areaM2: number; finalFeretCm: number; warnings: readonly string[] } | null;
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

      {shape === 'circular' && (
        <DimensionField
          id="diameterCm"
          label="Diámetro"
          value={dimensions.diameterCm}
          error={errorFor('diameterCm')}
          onChange={setDimension('diameterCm')}
        />
      )}

      {shape === 'rectangular' && (
        <div className="flex flex-wrap gap-6">
          <DimensionField
            id="widthCm"
            label="Ancho"
            value={dimensions.widthCm}
            error={errorFor('widthCm')}
            onChange={setDimension('widthCm')}
          />
          <DimensionField
            id="heightCm"
            label="Alto"
            value={dimensions.heightCm}
            error={errorFor('heightCm')}
            onChange={setDimension('heightCm')}
          />
        </div>
      )}

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

          {pipeline.status === 'running' && (
            <p className="flex items-center gap-2 text-sm text-secondary" aria-live="polite">
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              Midiendo tu diseño…
            </p>
          )}

          {pipeline.status === 'error' && pipeline.error && (
            <p role="alert" className="text-sm text-accent">
              {pipeline.error}
            </p>
          )}

          {pipeline.status === 'done' && pipeline.result && (
            <div className="bg-surface border border-line rounded-xl p-4 text-sm" aria-live="polite">
              <p className="font-semibold mb-1">
                Terminada mide {Math.round(pipeline.result.finalFeretCm)} cm en su punto más largo
              </p>
              <p className="text-secondary">
                Superficie con borde: {pipeline.result.areaM2.toFixed(2)} m²
              </p>
              {pipeline.result.warnings.map((warning) => (
                <p key={warning} className="flex items-start gap-2 text-accent mt-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {warning}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
