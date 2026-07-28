import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { rgbToHex } from '../../../utils/color';
import { wools, woolById } from '../../../data/wools';
import type { DetectedColor } from '../../../utils/tuftingPipeline';
import type { CalculatorAction, CalculatorState } from '../../../hooks/useCalculatorState';

interface ColorsStepProps {
  state: CalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
  /** Colores del diseño ya llevados a lana. Vacío hasta que el pipeline corre. */
  detectedColors: readonly DetectedColor[];
}

// La previsualización en lana vive en el bastidor (panel izquierdo). Este paso no
// es un formulario para elegir de un inventario: REVELA los colores que la lana
// logra con el diseño y deja elegir el único color que sí es una decisión — el
// del borde.
export const ColorsStep: React.FC<ColorsStepProps> = ({ state, dispatch, detectedColors }) => {
  const { borderWoolId, borderSameAsFill, borderThick, shape } = state;
  const hasColors = detectedColors.length > 0;
  // Solo circular/rectangular tienen relleno; en contorneada el borde siempre
  // se elige a mano.
  const hasFill = shape === 'circular' || shape === 'rectangular';
  const borderLocked = hasFill && borderSameAsFill;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-2">Tu diseño, dicho en lana</h2>
        <p className="text-secondary text-sm leading-relaxed">
          La lana habla en <strong className="text-primary">colores planos</strong>: no hace degradés ni
          detalle fino. Tu diseño se traduce a las regiones sólidas que ves en el bastidor.
        </p>
      </div>

      {hasColors ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Las lanas que tu diseño trajo consigo</p>
          <ul className="grid grid-cols-2 gap-2 list-none p-0 sm:grid-cols-3 sm:gap-3">
            {detectedColors.map((color, index) => {
              const hex = rgbToHex(color.rgb);
              return (
                <li
                  key={`${hex}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,248,240,0.78))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                >
                  <span
                    className="w-8 h-8 rounded-full border border-line shrink-0"
                    style={{ backgroundColor: hex }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium min-w-0 truncate">{color.name}</span>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-secondary">
            Son aproximados: cada uno es el tono de lana más cercano al tuyo. Una traducción fiel, no idéntica.
          </p>
        </div>
      ) : (
        <p className="text-sm text-secondary leading-relaxed">
          Los colores nacen de tu propio diseño. La previsualización en lana se arma para la forma
          contorneada; en circular o rectangular tu diseño se teje tal cual, en colores planos.
        </p>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold mb-1">
          Color del borde
          <span className="text-secondary font-normal">
            {' '}· {borderLocked ? 'igual al relleno' : woolById(borderWoolId)?.name}
          </span>
        </legend>

        {hasFill && (
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,248,240,0.75))] p-3 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
            <input
              type="checkbox"
              checked={borderSameAsFill}
              onChange={() => dispatch({ type: 'border-same-toggled' })}
              className="accent-current"
            />
            Mismo color que el relleno
          </label>
        )}

        <ul className="grid grid-cols-4 sm:grid-cols-6 gap-2 list-none p-0">
          {wools.map((wool) => {
            const selected = !borderLocked && wool.id === borderWoolId;
            return (
              <li key={wool.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={`Borde ${wool.name}`}
                  title={wool.name}
                  disabled={borderLocked}
                  onClick={() => dispatch({ type: 'border-selected', woolId: wool.id })}
                  className={cn(
                    'relative w-full aspect-square rounded-lg border-2 transition-transform min-h-11',
                    selected ? 'border-accent scale-105' : 'border-line hover:border-accent',
                    borderLocked && 'cursor-not-allowed opacity-45 hover:border-line',
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

        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,248,240,0.75))] p-3 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <input
            type="checkbox"
            checked={borderThick}
            onChange={() => dispatch({ type: 'border-thick-toggled' })}
            className="accent-current"
          />
          Borde grueso
        </label>
      </fieldset>
    </div>
  );
};
