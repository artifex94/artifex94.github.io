import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  readBestScore,
  readGlobalScores,
  readLastInitials,
  saveBestScore,
  writeGlobalScores,
  writeLastInitials,
  type GlobalScore,
} from '../../utils/heroPongHighScores';
import {
  fetchGlobalTop,
  isSubmittable,
  newRunId,
  qualifiesGlobal,
  submitGlobalScore,
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
// El ranking global puede no estar (función fría, sin red): en ese caso se dice,
// y NO se muestran datos locales haciéndolos pasar por el ranking.

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const cycleLetter = (letter: string, delta: number): string =>
  LETTERS[(LETTERS.indexOf(letter) + delta + LETTERS.length) % LETTERS.length];

interface HeroPongGameOverProps {
  summary: HeroPongSummary;
  onClose: () => void;
}

export const HeroPongGameOver: React.FC<HeroPongGameOverProps> = ({ summary, onClose }) => {
  /** `null` = el ranking nunca se pudo consultar. `[]` = está vacío de verdad. */
  const [global, setGlobal] = useState<GlobalScore[] | null>(readGlobalScores);
  const [best, setBest] = useState(readBestScore);
  const [initials, setInitials] = useState<string[]>(() => readLastInitials().split(''));
  const [ownRank, setOwnRank] = useState(-1);
  const [saving, setSaving] = useState(false);

  // Un id por partida, generado en el PRIMER render y no dentro de `confirm`:
  // si se generara al confirmar, dos envíos llevarían ids distintos y el
  // candado de unicidad del servidor no serviría para nada.
  const runIdRef = useRef<string | null>(null);
  if (runIdRef.current == null) runIdRef.current = newRunId();

  // Una vez confirmado, nada de lo que llegue tarde puede tocar la pantalla.
  const submittedRef = useRef(false);

  // La vista se decide SIN esperar al servidor: si arrancara en la tabla y
  // saltara a las iniciales cuando llega la respuesta, lo primero que vería el
  // jugador sería un parpadeo.
  const [view, setView] = useState<'initials' | 'table'>(() => {
    if (!isSubmittable(summary)) return 'table';
    const cached = readGlobalScores();
    const entersGlobal = cached ? qualifiesGlobal(cached, summary.score) : true;
    return entersGlobal || summary.score > readBestScore() ? 'initials' : 'table';
  });

  useEffect(() => {
    let cancelled = false;
    void fetchGlobalTop().then((top) => {
      // `submittedRef` corta el efecto ENTERO, no solo el cambio de vista: esta
      // respuesta salió antes del registro, así que su tabla ya está vieja y
      // pisaría la recién actualizada dejando `ownRank` apuntando a otra fila.
      if (cancelled || submittedRef.current || !top) return;
      setGlobal(top);
      writeGlobalScores(top);
      // Solo puede ABRIR la puerta: si el ranking resulta más flojo de lo que
      // decía el espejo, el jugador gana la chance de registrarse.
      if (isSubmittable(summary) && qualifiesGlobal(top, summary.score)) {
        setView((current) => (current === 'table' ? 'initials' : current));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [summary]);

  const spin = (slot: number, delta: number): void => {
    setInitials((current) => current.map((l, i) => (i === slot ? cycleLetter(l, delta) : l)));
  };

  const confirm = (): void => {
    if (saving || submittedRef.current) return;
    submittedRef.current = true;
    setSaving(true);
    const chosen = initials.join('');
    writeLastInitials(chosen);
    setBest(saveBestScore(summary.score));

    void submitGlobalScore(chosen, summary, runIdRef.current ?? '').then((result) => {
      if (result) {
        setGlobal(result.top);
        writeGlobalScores(result.top);
        setOwnRank(result.rank);
      }
      setSaving(false);
      setView('table');
    });
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
            <div className="mb-2 border-b border-line pb-1 text-[10px] tracking-widest">
              TOP 10 GLOBAL
            </div>
            {global?.length ? (
              global.map((entry, index) => (
                <div
                  key={`${entry.initials}-${entry.score}-${index}`}
                  className={`flex justify-between gap-6${index === ownRank ? ' text-primary' : ''}`}
                >
                  <span>
                    {String(index + 1).padStart(2, ' ')} {entry.initials}
                  </span>
                  <span>{entry.score}</span>
                </div>
              ))
            ) : (
              // Sin filas se DICE. Antes se rellenaba con la tabla local y el
              // jugador veía sus propios scores creyendo que era el ranking.
              <div className="text-[10px]">{global ? 'todavía sin marcas' : 'sin conexión'}</div>
            )}
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
