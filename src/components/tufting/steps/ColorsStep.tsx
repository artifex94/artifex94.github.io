import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { availableWools, MAX_WOOLS_PER_PIECE } from '../../../data/wools';
import type { CalculatorAction, CalculatorState } from '../../../hooks/useCalculatorState';

interface ColorsStepProps {
  state: CalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
}

export const ColorsStep: React.FC<ColorsStepProps> = ({ state, dispatch }) => {
  const wools = availableWools();
  const { woolIds } = state;
  const full = woolIds.length >= MAX_WOOLS_PER_PIECE;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-2">Elegí los colores</h2>
        <p className="text-secondary text-sm leading-relaxed">
          Estas son las lanas que tengo. Podés elegir hasta {MAX_WOOLS_PER_PIECE}: cada color es un
          cono distinto que hay que cargar en la pistola.
        </p>
      </div>

      <p className="text-sm" aria-live="polite">
        <span className="font-semibold">{woolIds.length}</span> de {MAX_WOOLS_PER_PIECE} elegidos
      </p>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 list-none p-0">
        {wools.map((wool) => {
          const selected = woolIds.includes(wool.id);
          const blocked = full && !selected;

          return (
            <li key={wool.id}>
              <button
                type="button"
                disabled={blocked}
                aria-pressed={selected}
                onClick={() => dispatch({ type: 'wool-toggled', woolId: wool.id })}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left min-h-11',
                  selected ? 'border-accent bg-accent/5' : 'border-line bg-surface',
                  blocked ? 'opacity-40 cursor-not-allowed' : 'hover:border-accent',
                )}
              >
                <span
                  className="w-8 h-8 rounded-full border border-line shrink-0"
                  style={{ backgroundColor: wool.hex }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium min-w-0 truncate">{wool.name}</span>
                {selected && <Check size={16} className="text-accent ml-auto shrink-0" aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>

      {full && (
        <p className="text-xs text-secondary">
          Llegaste al máximo. Sacá uno para elegir otro.
        </p>
      )}
    </div>
  );
};
