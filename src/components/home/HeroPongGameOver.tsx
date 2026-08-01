import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  insertScore,
  localBestScore,
  qualifies,
  readGlobalScores,
  readHighScores,
  readLastInitials,
  writeGlobalScores,
  writeHighScores,
  writeLastInitials,
  type HighScoreEntry,
} from '../../utils/heroPongHighScores';
import {
  fetchGlobalTop,
  qualifiesGlobal,
  submitGlobalScore,
  type GlobalScore,
} from '../../utils/heroPongLeaderboard';
import type { HeroPongSummary } from '../../utils/heroPongState';

// Pantalla de fin de partida: el top 10 global, tu mejor marca y, si el score
// entra, las iniciales.
//
// Vive en el chunk del juego y aparece recién cuando el engine ya murió: es DOM
// estático sobre un portal fixed, así que no desplaza nada del layout. Misma
// capa que usaba el canvas (z-40, debajo del header) y misma paleta: primary
// para lo propio, secondary para el resto, mono 12px, sin bordes redondeados.
// El acento naranja aparece SOLO en la marca propia, que es lo único que el
// jugador tiene que poder encontrar de un vistazo.
//
// El ranking global puede no estar (función fría, sin red, sin desplegar): en
// ese caso todo cae a la tabla local sin ningún estado de error a la vista, que
// es exactamente lo que el juego era antes de tener ranking.

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const cycleLetter = (letter: string, delta: number): string =>
  LETTERS[(LETTERS.indexOf(letter) + delta + LETTERS.length) % LETTERS.length];

const toRows = (entries: readonly { initials: string; score: number }[]) =>
  entries.map((entry) => ({ initials: entry.initials, score: entry.score }));

interface HeroPongGameOverProps {
  summary: HeroPongSummary;
  onClose: () => void;
}

export const HeroPongGameOver: React.FC<HeroPongGameOverProps> = ({ summary, onClose }) => {
  const [local, setLocal] = useState<HighScoreEntry[]>(readHighScores);
  /** `null` hasta saber si hay ranking; el espejo del storage evita la espera. */
  const [global, setGlobal] = useState<GlobalScore[] | null>(() => {
    const cached = readGlobalScores();
    return cached.length ? toRows(cached) : null;
  });
  const [best, setBest] = useState(localBestScore);
  // La vista se decide SIN esperar al servidor: si arrancara en la tabla y
  // saltara a las iniciales cuando llega la respuesta, lo primero que ve el
  // jugador sería un parpadeo. Alcanza con lo que ya está en el navegador —
  // la tabla local y el espejo del ranking— y el efecto de abajo solo puede
  // ASCENDER a iniciales, nunca sacarlas de la pantalla.
  const [view, setView] = useState<'initials' | 'table'>(() => {
    const cached = readGlobalScores();
    const entersGlobal = cached.length ? qualifiesGlobal(toRows(cached), summary.score) : false;
    return entersGlobal || qualifies(readHighScores(), summary.score) ? 'initials' : 'table';
  });
  // Ya vienen puestas las últimas que usó: en un reintento se toca OK y listo.
  const [initials, setInitials] = useState<string[]>(() => readLastInitials().split(''));
  const [ownRank, setOwnRank] = useState(-1);
  const [saving, setSaving] = useState(false);

  // Se pregunta el ranking al abrir: la partida ya terminó y el engine murió,
  // así que la espera no le saca frames a nadie.
  useEffect(() => {
    let cancelled = false;
    void fetchGlobalTop().then((top) => {
      if (cancelled || !top) return;
      setGlobal(top);
      writeGlobalScores(top);
      // Solo puede abrir la puerta: si el ranking resulta más flojo de lo que
      // decía el espejo, el jugador gana la chance de registrarse. Nunca al
      // revés, que sería arrancarle la pantalla de las manos.
      if (qualifiesGlobal(top, summary.score)) setView((current) => (current === 'table' ? 'initials' : current));
    });
    return () => {
      cancelled = true;
    };
  }, [summary.score]);

  const spin = (slot: number, delta: number): void => {
    setInitials((current) => current.map((l, i) => (i === slot ? cycleLetter(l, delta) : l)));
  };

  const confirm = (): void => {
    if (saving) return;
    setSaving(true);
    const chosen = initials.join('');
    writeLastInitials(chosen);

    // La marca local se guarda siempre y al instante: es del navegador y no
    // depende de nadie.
    const { list: nextLocal } = insertScore(local, {
      initials: chosen,
      score: summary.score,
      ts: Date.now(),
    });
    writeHighScores(nextLocal);
    setLocal(nextLocal);
    setBest(nextLocal[0]?.score ?? 0);

    // Al global se manda la traza entera; el servidor decide qué score acepta.
    void submitGlobalScore(chosen, summary).then((result) => {
      if (result) {
        setGlobal(result.top);
        writeGlobalScores(result.top);
        setOwnRank(result.rank);
      }
      setSaving(false);
      setView('table');
    });
  };

  const rows = global ?? toRows(local);

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
              <button
                type="button"
                className="border border-secondary px-4 py-1"
                disabled={saving}
                onClick={confirm}
              >
                {saving ? '···' : 'OK'}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 min-w-40">
            {rows.map((entry, index) => (
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
            {best > 0 && (
              <div
                data-hero-pong="local-best"
                className="mt-2 flex justify-between gap-6 border-t border-line pt-2 text-accent"
              >
                <span>TU MEJOR</span>
                <span>{best}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
