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
  const { borderWoolId } = state;
  const hasColors = detectedColors.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-2">Tu diseño en lana</h2>
        <p className="text-secondary text-sm leading-relaxed">
          La alfombra se teje en <strong className="text-primary">colores planos</strong>: la lana no
          hace degradés ni detalle fino, así que tu diseño se lleva a las regiones sólidas que se ven
          en el bastidor.
        </p>
      </div>

      {hasColors ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Los colores que salen de tu diseño</p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 list-none p-0">
            {detectedColors.map((color, index) => {
              const hex = rgbToHex(color.rgb);
              return (
                <li
                  key={`${hex}-${index}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-line bg-surface"
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
            Son aproximados: cada color es el tono de lana más cercano al de tu diseño.
          </p>
        </div>
      ) : (
        <p className="text-sm text-secondary leading-relaxed">
          Los colores salen de tu propio diseño. La previsualización en lana se arma para la forma
          contorneada; en circular o rectangular se teje tu diseño tal cual, en colores planos.
        </p>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold mb-1">
          Color del borde
          <span className="text-secondary font-normal"> · {woolById(borderWoolId)?.name}</span>
        </legend>
        <ul className="grid grid-cols-4 sm:grid-cols-6 gap-2 list-none p-0">
          {wools.map((wool) => {
            const selected = wool.id === borderWoolId;
            return (
              <li key={wool.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={`Borde ${wool.name}`}
                  title={wool.name}
                  onClick={() => dispatch({ type: 'border-selected', woolId: wool.id })}
                  className={cn(
                    'relative w-full aspect-square rounded-lg border-2 transition-transform min-h-11',
                    selected ? 'border-accent scale-105' : 'border-line hover:border-accent',
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
    </div>
  );
};
