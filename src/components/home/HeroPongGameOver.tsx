import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  insertScore,
  qualifies,
  readHighScores,
  writeHighScores,
} from '../../utils/heroPongHighScores';
import type { HeroPongSummary } from '../../utils/heroPongState';

// Pantalla de fin de partida: el top-10 y, si el score entra, las iniciales.
//
// Vive en el chunk del juego y aparece recién cuando el engine ya murió: es DOM
// estático sobre un portal fixed, así que no desplaza nada del layout. Misma
// capa que usaba el canvas (z-40, debajo del header) y misma paleta: primary
// para lo propio, secondary para el resto, mono 12px, sin bordes redondeados.

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const cycleLetter = (letter: string, delta: number): string =>
  LETTERS[(LETTERS.indexOf(letter) + delta + LETTERS.length) % LETTERS.length];

interface HeroPongGameOverProps {
  summary: HeroPongSummary;
  onClose: () => void;
}

export const HeroPongGameOver: React.FC<HeroPongGameOverProps> = ({ summary, onClose }) => {
  const [list, setList] = useState(readHighScores);
  const [view, setView] = useState<'initials' | 'table'>(() =>
    qualifies(list, summary.score) ? 'initials' : 'table',
  );
  const [initials, setInitials] = useState<string[]>(['A', 'A', 'A']);
  const [ownRank, setOwnRank] = useState(-1);

  const spin = (slot: number, delta: number): void => {
    setInitials((current) => current.map((l, i) => (i === slot ? cycleLetter(l, delta) : l)));
  };

  const confirm = (): void => {
    const { list: next, rank } = insertScore(list, {
      initials: initials.join(''),
      score: summary.score,
      ts: Date.now(),
    });
    writeHighScores(next);
    setList(next);
    setOwnRank(rank);
    setView('table');
  };

  return createPortal(
    <div
      role="dialog"
      aria-label="Fin de la partida"
      data-hero-pong="gameover"
      className="md:hidden fixed inset-0 z-40 flex items-center justify-center bg-base/95 font-mono text-[12px] text-secondary"
      style={{ touchAction: 'none' }}
      // En la tabla cualquier toque cierra; con las iniciales abiertas, tocar
      // afuera del panel sale sin registrar (el panel corta la propagación).
      onClick={onClose}
    >
      <div
        className="border border-secondary px-6 py-5"
        onClick={view === 'initials' ? (event) => event.stopPropagation() : undefined}
      >
        <div className="text-center text-primary">{summary.score}</div>

        {view === 'initials' ? (
          <>
            <div className="mt-4 flex justify-center gap-3">
              {initials.map((letter, slot) => (
                <div key={slot} className="flex flex-col items-center">
                  <button
                    type="button"
                    aria-label={`Letra ${slot + 1} siguiente`}
                    className="px-2 leading-none"
                    onClick={() => spin(slot, 1)}
                  >
                    ▲
                  </button>
                  <div className="w-6 border-b border-secondary py-1 text-center text-primary">
                    {letter}
                  </div>
                  <button
                    type="button"
                    aria-label={`Letra ${slot + 1} anterior`}
                    className="px-2 leading-none"
                    onClick={() => spin(slot, -1)}
                  >
                    ▼
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button type="button" className="border border-secondary px-4 py-1" onClick={confirm}>
                OK
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 min-w-40">
            {list.map((entry, index) => (
              <div
                key={`${entry.initials}-${entry.score}-${index}`}
                className={`flex justify-between gap-6${index === ownRank ? ' text-primary' : ''}`}
              >
                <span>
                  {String(index + 1).padStart(2, ' ')} {entry.initials}
                </span>
                <span>{entry.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
