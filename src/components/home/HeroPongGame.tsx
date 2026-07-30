import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HeroGlyphLayer } from './HeroGlyphLayer';
import { measureHero, type HeroBlockInput, type HeroMetrics } from './measureHero';
import { createHeroPongEngine, type Engine } from './heroPongEngine';
import {
  HERO_PONG_TUNING,
  HERO_PONG_TURBO,
  type GamePhase,
  type HeroPongProgress,
} from '../../utils/heroPongState';

// La partida. Este módulo entra por import() dinámico: nada de acá pesa en la
// carga inicial del home ni existe en desktop.
//
// Reparto: React monta el canvas y la capa de letras (tres renders en toda la
// partida), y el engine hace el resto sin volver a pasar por React.

const PROGRESS_KEY = 'artifex_hero_pong';

const readProgress = (): unknown => {
  try {
    const raw = sessionStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

const writeProgress = (progress: HeroPongProgress): void => {
  try {
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    /* sessionStorage lleno o bloqueado: el progreso simplemente no persiste */
  }
};

/** `?heropong=turbo` comprime los tiempos del ciclo para poder verificarlo. */
const isTurbo = (): boolean => {
  try {
    return new URLSearchParams(window.location.search).get('heropong') === 'turbo';
  } catch {
    return false;
  }
};

interface HeroPongGameProps {
  /** La franja: define la pista y la línea de la paleta. */
  host: HTMLElement;
  /** La sección del hero: origen de coordenadas de las letras. */
  origin: HTMLElement;
  blocks: readonly HeroBlockInput[];
  /** Posición del dedo que inició la partida. */
  startX: number | null;
  onEngine: (engine: Engine | null) => void;
  onFinish: () => void;
}

export const HeroPongGame: React.FC<HeroPongGameProps> = ({
  host,
  origin,
  blocks,
  startX,
  onEngine,
  onFinish,
}) => {
  const [metrics, setMetrics] = useState<HeroMetrics | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  // En un ref para que el efecto de medición no dependa de la identidad del
  // callback (y no vuelva a medir si el padre re-renderiza).
  const finishRef = useRef(onFinish);
  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  // Medición: una sola pasada, antes de que exista el engine.
  useEffect(() => {
    let cancelled = false;
    void measureHero(origin, blocks).then((result) => {
      if (cancelled) return;
      // Sin medición confiable no hay juego: se sale y el hero queda intacto.
      if (!result) finishRef.current();
      else setMetrics(result);
    });
    return () => {
      cancelled = true;
    };
  }, [origin, blocks]);

  const handleSpans = React.useCallback(
    (spans: HTMLSpanElement[]) => {
      const canvas = canvasRef.current;
      if (!canvas || !metrics || engineRef.current) return;

      const engine = createHeroPongEngine({
        canvas,
        host,
        origin,
        metrics,
        spans,
        tuning: isTurbo() ? HERO_PONG_TURBO : HERO_PONG_TUNING,
        savedProgress: readProgress(),
        onProgress: writeProgress,
        onPhase: (phase: GamePhase) => {
          if (phase === 'gameover') finishRef.current();
        },
      });
      engineRef.current = engine;
      onEngine(engine);
      engine.start(startX ?? undefined);
    },
    [metrics, host, origin, startX, onEngine],
  );

  useEffect(
    () => () => {
      engineRef.current?.destroy();
      engineRef.current = null;
      onEngine(null);
    },
    [onEngine],
  );

  return (
    <>
      {createPortal(
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          // z-40 deja la pelota DEBAJO del header (z-50): rebota en su borde y
          // no lo tapa. pointer-events-none: el dedo lo maneja la franja.
          className="pointer-events-none fixed inset-0 z-40"
        />,
        document.body,
      )}
      {metrics && createPortal(<HeroGlyphLayer metrics={metrics} onSpans={handleSpans} />, origin)}
    </>
  );
};
