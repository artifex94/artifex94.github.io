import React, { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { Engine } from './heroPongEngine';
import type { HeroBlockInput } from './measureHero';
import type { HeroPongSummary } from '../../utils/heroPongState';
import {
  BALL_SIZE,
  BAND_HEIGHT,
  MARQUEE_FONT_SIZE,
  MARQUEE_HEIGHT,
  MARQUEE_TOP,
  marqueeCopies,
  marqueeDuration,
  PADDLE_HEIGHT,
  PADDLE_TOP,
  PADDLE_WIDTH,
} from './heroPongConfig';
import { useHighScoresMarquee } from '../../hooks/useHighScoresMarquee';

// La franja del hero-pong: una paleta y una pelota, nada más.
//
// Vive DENTRO de la <section> del hero, posicionada en absoluto sobre el
// `gap-16` que el home ya deja vacío entre el hero y las cards. Es la única
// forma de agregarla sin correr nada: un hermano más en el flex-col sumaría
// otro gap de 64px y empujaría toda la página.
//
// Solo móvil, y nunca con prefers-reduced-motion: una pelota rebotando es
// movimiento, y ahí el sitio tiene que quedar exactamente como está.
//
// En reposo son dos <div> y nada más: sin canvas, sin rAF, sin listeners y sin
// el chunk del juego descargado. Todo eso aparece con el primer toque.
//
// La excepción es el ticker del top-10, que desfila debajo de la paleta como el
// "attract mode" de una recreativa. Solo existe si alguien ya jugó y registró un
// score: para quien llega por primera vez no hay ni un nodo de más. Es una
// animación en loop, así que su escape de WCAG 2.2.2 es prefers-reduced-motion,
// que acá no la pausa: directamente no monta la franja entera.

/** Solo tipo: no genera ningún import en runtime. */
type GameModule = typeof import('./HeroPongGame');

let gameModule: Promise<GameModule> | null = null;
const loadGame = (): Promise<GameModule> => {
  if (!gameModule) gameModule = import('./HeroPongGame');
  return gameModule;
};

/** La medición vive en el chunk del juego; se pide aparte solo para precalentarla. */
const loadMeasure = () => import('./measureHero');

/** Nodos y posición inicial, resueltos en el toque que arranca la partida. */
interface GameSetup {
  host: HTMLElement;
  origin: HTMLElement;
  blocks: HeroBlockInput[];
  startX: number;
}

interface HeroPongBandProps {
  /** La sección del hero: origen de coordenadas de las letras. */
  originRef: React.RefObject<HTMLElement | null>;
  /** Bloques de texto que aportan letras jugables. */
  blockRefs: readonly React.RefObject<HTMLElement | null>[];
  /** El juego no arranca hasta que el título terminó de tipearse. */
  ready: boolean;
}

export const HeroPongBand: React.FC<HeroPongBandProps> = ({ originRef, blockRefs, ready }) => {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const [engine, setEngine] = useState<Engine | null>(null);
  /** El chunk del juego, con la partida y la pantalla de fin: llegan juntos. */
  const [game, setGame] = useState<GameModule | null>(null);
  const [setup, setSetup] = useState<GameSetup | null>(null);
  /** Resumen de la última derrota real: mientras exista, se muestra el top-10. */
  const [summary, setSummary] = useState<HeroPongSummary | null>(null);
  const marquee = useHighScoresMarquee();

  const enabled = isMobile && !reduceMotion && ready;
  const playing = setup !== null;

  // Precalentado en tiempo muerto: el chunk del juego, Pretext y la medición del
  // texto (~150ms) salen del camino crítico, así el toque arranca al instante.
  // Se saltea entero en conexiones malas o con ahorro de datos: ahí no vale
  // gastar datos de alguien que quizá no juegue.
  useEffect(() => {
    if (!enabled) return;
    const connection = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    if (connection?.saveData) return;
    if (connection?.effectiveType && /2g/.test(connection.effectiveType)) return;

    const idle = (
      window as unknown as {
        requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    if (!idle) return;

    let cancelled = false;
    idle(
      () => {
        void Promise.all([loadGame(), loadMeasure()]).then(([, measure]) => {
          if (cancelled) return;
          const origin = originRef.current;
          if (!origin) return;
          const blocks = blockRefs
            .map((ref) => ref.current)
            .filter((element): element is HTMLElement => !!element)
            .map((element) => ({ element }));
          if (blocks.length) void measure.warmMeasureHero(origin, blocks);
        });
      },
      { timeout: 6000 },
    );

    return () => {
      cancelled = true;
    };
  }, [enabled, originRef, blockRefs]);

  const handleFinish = useCallback((result: HeroPongSummary | null) => {
    setSetup(null);
    if (result) setSummary(result);
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Con el top-10 abierto la franja no arranca partidas: primero se cierra.
      if (summary) return;

      const host = event.currentTarget;
      host.setPointerCapture(event.pointerId);

      if (playing) {
        engine?.pointerMove(event.clientX);
        return;
      }

      // Los refs se leen acá, en el evento: ya están montados y no es render.
      const origin = originRef.current;
      if (!origin) return;
      const blocks = blockRefs
        .map((ref) => ref.current)
        .filter((element): element is HTMLElement => !!element)
        .map((element) => ({ element }));
      if (!blocks.length) return;

      setSetup({ host, origin, blocks, startX: event.clientX });
      void loadGame().then(setGame);
    },
    [playing, engine, originRef, blockRefs, summary],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      engine?.pointerMove(event.clientX);
    },
    [engine],
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  if (!enabled) return null;

  const copies = marqueeCopies(marquee.length);

  return (
    <div
      aria-hidden="true"
      // Identidad estable para las verificaciones locales (scripts/heropong-*):
      // depender de la posición en el DOM se rompe con cualquier nodo
      // decorativo nuevo, como el cursor del Typewriter.
      data-hero-pong="band"
      // md:hidden además del gate por JS: si el viewport cruza el breakpoint
      // antes de que corra el efecto, el CSS ya la esconde.
      className="md:hidden absolute left-0 right-0 top-full select-none"
      style={{
        height: BAND_HEIGHT,
        // En reposo el scroll vertical sigue funcionando sobre la franja; en
        // partida se toma el gesto completo para arrastrar la paleta.
        touchAction: playing ? 'none' : 'pan-y',
        overscrollBehavior: 'contain',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Reposo: la paleta y la pelota en el gris del texto secundario, para que
          se lean como un detalle del blueprint y no como un juego. */}
      {!playing && (
        <>
          <div
            className="absolute bg-secondary"
            style={{
              width: PADDLE_WIDTH,
              height: PADDLE_HEIGHT,
              top: PADDLE_TOP,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
          <div
            className="absolute bg-secondary"
            style={{
              width: BALL_SIZE,
              height: BALL_SIZE,
              top: PADDLE_TOP - BALL_SIZE,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </>
      )}

      {/* El top-10 desfilando debajo de la paleta. pointer-events-none lo saca
          del hit-test: el toque lo sigue recibiendo la franja, que es la que
          arranca la partida y la que define el touch-action. */}
      {!playing && !summary && copies > 0 && (
        <div
          data-hero-pong="marquee"
          className="hero-marquee pointer-events-none absolute left-0 right-0 text-secondary/60"
          style={{
            top: MARQUEE_TOP,
            height: MARQUEE_HEIGHT,
            fontSize: MARQUEE_FONT_SIZE,
            lineHeight: `${MARQUEE_HEIGHT}px`,
          }}
        >
          <div
            className="hero-marquee-track"
            style={{ animationDuration: `${marqueeDuration(marquee.length)}s` }}
          >
            {Array.from({ length: copies * 2 }, (_, i) => (
              // whitespace-pre: la secuencia termina en ' · ' y HTML colapsaría
              // ese espacio justo en la junta entre copias.
              <div key={i} className="whitespace-pre">
                {marquee}
              </div>
            ))}
          </div>
        </div>
      )}

      {setup && game && (
        <game.HeroPongGame
          host={setup.host}
          origin={setup.origin}
          blocks={setup.blocks}
          startX={setup.startX}
          onEngine={setEngine}
          onFinish={handleFinish}
        />
      )}

      {summary && game && (
        <game.HeroPongGameOver summary={summary} onClose={() => setSummary(null)} />
      )}
    </div>
  );
};
