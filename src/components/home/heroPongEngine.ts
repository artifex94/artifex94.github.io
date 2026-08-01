import {
  buildDodgeLut,
  dodgeOffsetAt,
  verticalGate,
  DEFAULT_DODGE_CONFIG,
  type DodgeConfig,
} from '../../utils/heroDodge';
import {
  ceilingSpeed,
  circleRectHit,
  clampPaddleX,
  digitBoxes,
  paddleBounce,
  reflect,
  subStepCount,
  type Ball,
  type Rect,
} from '../../utils/heroPongPhysics';
import {
  applyProgress,
  createHeroPongState,
  reduceHeroPong,
  scoreOf,
  takeProgress,
  takeSummary,
  HERO_PONG_TUNING,
  type GamePhase,
  type HeroPongProgress,
  type HeroPongState,
  type HeroPongSummary,
  type HeroPongTuning,
} from '../../utils/heroPongState';
import { measureNavBottom } from '../../utils/layout';
import type { HeroMetrics } from './measureHero';
import {
  BALL_RADIUS,
  BALL_SIZE,
  DODGE_GATE_PAD,
  DODGE_OVERFLOW,
  HUD_FONT_SIZE,
  HUD_INSET,
  HUD_TOP_GAP,
  LETTER_FALL_GRAVITY,
  LETTER_FALL_START,
  MAX_BOUNCE_ANGLE,
  MAX_SPEED,
  PADDLE_HEIGHT,
  PADDLE_TOP,
  PADDLE_WIDTH,
  SPEED_STEP,
  START_SPEED,
} from './heroPongConfig';

// El motor del hero-pong. Sin React y sin JSX: un solo requestAnimationFrame.
//
// Regla dura del loop: NO se lee el DOM. Toda la geometría se mide una vez (y de
// nuevo solo si hay resize o scroll) y se guarda; por frame únicamente se
// escriben transforms en los spans y se dibuja el canvas. Sin eso, 234 letras
// serían 234 lecturas de layout por frame.

export interface EngineDeps {
  canvas: HTMLCanvasElement;
  /** La franja de juego: define la pista y la línea de la paleta. */
  host: HTMLElement;
  /** Origen de coordenadas de las letras (la sección del hero). */
  origin: HTMLElement;
  metrics: HeroMetrics;
  spans: HTMLSpanElement[];
  tuning?: HeroPongTuning;
  savedProgress?: unknown;
  onProgress?: (progress: HeroPongProgress) => void;
  /** Resumen de la partida perdida. Se dispara ANTES que `onPhase('gameover')`. */
  onSummary?: (summary: HeroPongSummary) => void;
  onPhase?: (phase: GamePhase) => void;
}

export interface Engine {
  start(clientX?: number): void;
  pointerMove(clientX: number): void;
  destroy(): void;
}

interface Geometry {
  /** Bordes de la pista, en coords de viewport. */
  trackLeft: number;
  trackRight: number;
  /** Techo: borde inferior del header. */
  ceiling: number;
  /** Cara superior de la paleta. */
  paddleTop: number;
  /** Origen del bloque de texto, para pasar de coords de letra a viewport. */
  originLeft: number;
  originTop: number;
  width: number;
  height: number;
}

const roundPx = (value: number): number => Math.round(value);

// Sonda de diagnóstico. El juego solo existe en móvil y después de un toque, así
// que no se puede cubrir con la suite de jsdom: `scripts/heropong-check.mjs`
// define esta función antes de cargar la página y así puede inspeccionar la
// posición de la pelota, el esquive y el ciclo desde un Chromium real. Si nadie
// la define (o sea, siempre en producción) queda en `undefined` y el bloque que
// la usa no se ejecuta.
const debugSink = (window as unknown as { __heroPongDebug?: (info: unknown) => void })
  .__heroPongDebug;

export function createHeroPongEngine(deps: EngineDeps): Engine {
  const { canvas, host, origin, metrics, spans } = deps;
  const tuning = deps.tuning ?? HERO_PONG_TUNING;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { start: () => {}, pointerMove: () => {}, destroy: () => {} };
  }

  const glyphCount = metrics.glyphs.length;

  // --- Índice de líneas: evita testear 234 letras por frame ---
  const glyphsByLine = new Map<number, number[]>();
  for (let i = 0; i < glyphCount; i += 1) {
    const line = metrics.glyphs[i].line;
    const bucket = glyphsByLine.get(line);
    if (bucket) bucket.push(i);
    else glyphsByLine.set(line, [i]);
  }

  // --- Tabla de esquive, precomputada una vez ---
  const dodgeConfig: DodgeConfig = {
    ...DEFAULT_DODGE_CONFIG,
    track: [0, metrics.width],
    bounds: [-DODGE_OVERFLOW, metrics.width + DODGE_OVERFLOW],
    overflow: DODGE_OVERFLOW,
  };
  const lut = buildDodgeLut(
    metrics.glyphs,
    metrics.lines.map((line) => line.slack),
    dodgeConfig,
  );

  // --- Estado mutable ---
  let state: HeroPongState = applyProgress(createHeroPongState(glyphCount), deps.savedProgress, tuning);
  let ball: Ball = { x: 0, y: 0, vx: 0, vy: 0, r: BALL_RADIUS };
  let speed = START_SPEED;
  let paddleCenter = 0;
  let raf = 0;
  let lastTs = 0;
  let running = false;
  let paused = false;
  let geometryDirty = true;
  /** El texto se re-acomodó: la medición quedó vieja y hay que salir. */
  let staleGeometry = false;
  let lastPhase: GamePhase = state.phase;

  /** Desplazamiento vertical actual de cada letra (solo las que están cayendo). */
  const fallOffset = new Float32Array(glyphCount);
  const fallSpeed = new Float32Array(glyphCount);
  /** Último transform escrito, para no tocar el estilo si no cambió. */
  const lastDx = new Float32Array(glyphCount);
  const lastDy = new Float32Array(glyphCount);
  const hiddenFlags = new Uint8Array(glyphCount);
  let activeLines: number[] = [];

  let geometry: Geometry = {
    trackLeft: 0,
    trackRight: 0,
    ceiling: 0,
    paddleTop: 0,
    originLeft: 0,
    originTop: 0,
    width: 0,
    height: 0,
  };

  // Objeto único de la sonda (ver `debugSink`): se muta en vez de recrearse.
  const debugFrame = {
    ballLocalX: 0,
    ballLocalY: 0,
    speed: START_SPEED,
    state: state as HeroPongState,
    lines: metrics.lines,
    activeLines: [] as number[],
    lastDx,
    lut,
    columns: DEFAULT_DODGE_CONFIG.columns,
    hudDigitRects: (): Rect[] => hudDigitRects(),
  };

  let hudDigitAdvance = 0;
  const hudFont = `${HUD_FONT_SIZE}px ${metrics.blocks[0]?.fontFamily ?? 'monospace'}`;
  // Colores leídos una vez: el loop no puede permitirse un getComputedStyle.
  let inkColor = '#e5e5e5';
  let dimColor = '#8a8a8a';

  const resizeCanvas = (): void => {
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(geometry.width * dpr));
    const height = Math.max(1, Math.round(geometry.height * dpr));
    // Tocar canvas.width resetea el contexto entero, así que solo si cambió:
    // en un scroll cambian los offsets, no el tamaño.
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${geometry.width}px`;
      canvas.style.height = `${geometry.height}px`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = hudFont;
    hudDigitAdvance = ctx.measureText('0').width;
  };

  const readGeometry = (): void => {
    const bandRect = host.getBoundingClientRect();
    const originRect = origin.getBoundingClientRect();
    geometry = {
      trackLeft: bandRect.left,
      trackRight: bandRect.right,
      ceiling: measureNavBottom(),
      paddleTop: bandRect.top + PADDLE_TOP,
      originLeft: originRect.left,
      originTop: originRect.top,
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const style = getComputedStyle(host);
    inkColor = style.getPropertyValue('--color-primary').trim() || inkColor;
    dimColor = style.getPropertyValue('--color-secondary').trim() || dimColor;

    // Si el bloque de texto cambió de ancho, el texto se re-acomodó y las
    // posiciones medidas ya no valen: el overlay quedaría corrido. Se termina
    // la partida antes de mostrar algo mal puesto.
    if (Math.abs(originRect.width - metrics.width) > 1) staleGeometry = true;

    // Las cajas del HUD dependen del techo y del avance del dígito.
    digitRectsCount = -1;

    resizeCanvas();
    geometryDirty = false;
  };

  const resetBall = (): void => {
    speed = START_SPEED;
    paddleCenter = (geometry.trackLeft + geometry.trackRight) / 2;
    ball = {
      x: paddleCenter,
      y: geometry.paddleTop - BALL_RADIUS,
      vx: 0,
      vy: 0,
      r: BALL_RADIUS,
    };
  };

  // --- Cajas de colisión ---

  const glyphRect = (index: number): Rect => {
    const glyph = metrics.glyphs[index];
    return {
      x: geometry.originLeft + glyph.x,
      y: geometry.originTop + glyph.y + fallOffset[index],
      w: glyph.w,
      h: glyph.h,
    };
  };

  const paddleRect = (): Rect => ({
    x: paddleCenter - PADDLE_WIDTH / 2,
    y: geometry.paddleTop,
    w: PADDLE_WIDTH,
    h: PADDLE_HEIGHT,
  });

  // Las cajas de los dígitos solo cambian cuando cambia la cantidad de dígitos
  // (o la geometría), no en cada sub-paso de la física.
  let digitRectsCache: Rect[] = [];
  let digitRectsCount = -1;
  const hudDigitRects = (): Rect[] => {
    if (digitRectsCount !== state.scoreDigits.length) {
      digitRectsCount = state.scoreDigits.length;
      digitRectsCache = digitBoxes(
        HUD_INSET,
        geometry.ceiling + HUD_TOP_GAP - HUD_FONT_SIZE,
        digitRectsCount,
        hudDigitAdvance,
        HUD_FONT_SIZE,
      );
    }
    return digitRectsCache;
  };

  /**
   * Índice de letras sólidas (armadas o cayendo), la lista corta contra la que
   * hay que testear colisiones.
   *
   * Se recalcula solo cuando cambia el array de letras, y eso se detecta por
   * IDENTIDAD: el estado es inmutable, así que `state.letters` cambia de
   * referencia únicamente si alguna letra cambió de fase. Recorrer las 186 en
   * cada sub-paso (tres veces por frame) era trabajo puro al vacío: en juego
   * normal la lista tiene entre cero y un par de elementos.
   */
  let solidIndices: number[] = [];
  let fallingIndices: number[] = [];
  let solidSource: readonly string[] | null = null;
  const refreshSolidIndices = (): void => {
    if (solidSource === state.letters) return;
    solidSource = state.letters;
    solidIndices = [];
    fallingIndices = [];
    for (let i = 0; i < glyphCount; i += 1) {
      const phase = state.letters[i];
      if (phase === 'rigid' || phase === 'falling') solidIndices.push(i);
      if (phase === 'falling') fallingIndices.push(i);
      // Visibilidad y reposo también son consecuencia de la fase, así que se
      // resuelven en la misma pasada: por frame no hay nada que revisar.
      setHidden(i, phase === 'destroyed');
      if (phase === 'rigid' || phase === 'destroyed') writeTransform(i, 0, 0);
      if (phase === 'destroyed') {
        // Una letra golpeada mientras caía tiene que reintentar desde el
        // principio (el borde del header), no desde donde la interceptaron.
        fallOffset[i] = 0;
        fallSpeed[i] = 0;
      }
    }
  };

  /** De las sólidas, las que están a la altura de la pelota. */
  const solidBuffer = new Int32Array(glyphCount);
  let solidCount = 0;
  const collectSolidGlyphsNear = (): void => {
    refreshSolidIndices();
    solidCount = 0;
    const top = ball.y - ball.r;
    const bottom = ball.y + ball.r;
    for (const i of solidIndices) {
      const glyph = metrics.glyphs[i];
      const y = geometry.originTop + glyph.y + fallOffset[i];
      if (y + glyph.h < top || y > bottom) continue;
      solidBuffer[solidCount] = i;
      solidCount += 1;
    }
  };

  // --- Física ---

  const step = (dtSeconds: number): void => {
    ball = { ...ball, x: ball.x + ball.vx * dtSeconds, y: ball.y + ball.vy * dtSeconds };

    // Techo: el único rebote que acelera, y solo cuando el total de golpes
    // alcanza el siguiente número Fibonacci (la velocidad se deriva del contador).
    if (ball.y - ball.r <= geometry.ceiling) {
      ball = { ...ball, y: geometry.ceiling + ball.r, vy: Math.abs(ball.vy) };
      state = reduceHeroPong(state, { t: 'ceilingHit' }, tuning);
      speed = ceilingSpeed(state.ceilingHits, START_SPEED, SPEED_STEP, MAX_SPEED);
      const factor = speed / Math.max(Math.hypot(ball.vx, ball.vy), 0.001);
      ball = { ...ball, vx: ball.vx * factor, vy: ball.vy * factor };
    }

    // Paredes laterales de la pista: rebotan sin acelerar.
    if (ball.x - ball.r <= geometry.trackLeft) {
      ball = { ...ball, x: geometry.trackLeft + ball.r, vx: Math.abs(ball.vx) };
    } else if (ball.x + ball.r >= geometry.trackRight) {
      ball = { ...ball, x: geometry.trackRight - ball.r, vx: -Math.abs(ball.vx) };
    }

    // Paleta.
    const paddle = paddleRect();
    if (ball.vy > 0) {
      const hit = circleRectHit(ball, paddle);
      if (hit) ball = paddleBounce(ball, paddle, MAX_BOUNCE_ANGLE, speed);
    }

    // Letras sólidas: rebote y destrucción en el mismo frame.
    collectSolidGlyphsNear();
    for (let s = 0; s < solidCount; s += 1) {
      const index = solidBuffer[s];
      const hit = circleRectHit(ball, glyphRect(index));
      if (!hit) continue;
      ball = reflect(ball, hit);
      state = reduceHeroPong(state, { t: 'letterHit', index }, tuning);
    }

    // Dígitos del contador, una vez desbloqueados.
    if (state.digitsDestructible) {
      const rects = hudDigitRects();
      for (let i = 0; i < rects.length; i += 1) {
        const hit = circleRectHit(ball, rects[i]);
        if (!hit) continue;
        ball = reflect(ball, hit);
        state = reduceHeroPong(state, { t: 'digitHit', index: i }, tuning);
        break;
      }
    }

    // Pérdida: pasó la cara inferior de la paleta.
    if (ball.y - ball.r > paddle.y + paddle.h) {
      state = reduceHeroPong(state, { t: 'lose' }, tuning);
    }
  };

  // --- Letras ---

  const writeTransform = (index: number, dx: number, dy: number): void => {
    if (lastDx[index] === dx && lastDy[index] === dy) return;
    lastDx[index] = dx;
    lastDy[index] = dy;
    spans[index].style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  };

  const setHidden = (index: number, hidden: boolean): void => {
    const flag = hidden ? 1 : 0;
    if (hiddenFlags[index] === flag) return;
    hiddenFlags[index] = flag;
    spans[index].style.visibility = hidden ? 'hidden' : '';
  };

  const updateLetters = (dtSeconds: number): void => {
    if (!spans.length) return;
    refreshSolidIndices();

    // Caída de las letras que vuelven a su lugar.
    for (const i of fallingIndices) {
      if (state.letters[i] !== 'falling') continue;
      if (fallOffset[i] === 0 && fallSpeed[i] === 0) {
        // Arranca desde el borde del header.
        fallOffset[i] = geometry.ceiling - (geometry.originTop + metrics.glyphs[i].y);
        fallSpeed[i] = LETTER_FALL_START;
      }
      fallSpeed[i] += LETTER_FALL_GRAVITY * dtSeconds;
      fallOffset[i] = Math.min(fallOffset[i] + fallSpeed[i] * dtSeconds, 0);
      if (fallOffset[i] >= 0) {
        fallOffset[i] = 0;
        fallSpeed[i] = 0;
        state = reduceHeroPong(state, { t: 'letterLanded', index: i }, tuning);
      }
    }

    // Esquive: solo las líneas que la pelota está cruzando.
    const ballLocalX = ball.x - geometry.originLeft;
    const ballLocalY = ball.y - geometry.originTop;
    const trackSpan = dodgeConfig.track[1] - dodgeConfig.track[0];
    const t = trackSpan > 0 ? (ballLocalX - dodgeConfig.track[0]) / trackSpan : 0;

    const nextActive: number[] = [];
    for (let lineIndex = 0; lineIndex < metrics.lines.length; lineIndex += 1) {
      const line = metrics.lines[lineIndex];
      const gate = verticalGate(ballLocalY, line.top, line.bottom, ball.r, DODGE_GATE_PAD);
      if (gate <= 0) continue;
      nextActive.push(lineIndex);
      for (const index of glyphsByLine.get(lineIndex) ?? []) {
        if (state.letters[index] !== 'dodging') continue;
        writeTransform(index, gate * dodgeOffsetAt(lut, dodgeConfig.columns, index, t), 0);
      }
    }

    // Devuelve a su lugar las líneas que dejaron de estar activas.
    for (const lineIndex of activeLines) {
      if (nextActive.includes(lineIndex)) continue;
      for (const index of glyphsByLine.get(lineIndex) ?? []) {
        if (state.letters[index] === 'dodging') writeTransform(index, 0, 0);
      }
    }
    activeLines = nextActive;

    // Posición de las que están cayendo (la visibilidad y el reposo ya los
    // resolvió refreshSolidIndices al cambiar de fase).
    refreshSolidIndices();
    for (const i of fallingIndices) writeTransform(i, 0, fallOffset[i]);
  };

  // --- Dibujo ---

  const draw = (): void => {
    ctx.clearRect(0, 0, geometry.width, geometry.height);

    ctx.fillStyle = inkColor;
    // Cuadrada y a píxel entero: la estética Pong no tiene bordes redondeados.
    ctx.fillRect(roundPx(ball.x - BALL_RADIUS), roundPx(ball.y - BALL_RADIUS), BALL_SIZE, BALL_SIZE);
    ctx.fillRect(
      roundPx(paddleCenter - PADDLE_WIDTH / 2),
      roundPx(geometry.paddleTop),
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
    );

    // HUD: dos números, sin etiquetas.
    ctx.fillStyle = dimColor;
    ctx.font = hudFont;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillText(String(scoreOf(state.scoreDigits)), HUD_INSET, geometry.ceiling + HUD_TOP_GAP);
    ctx.textAlign = 'right';
    ctx.fillText(
      String(Math.floor(state.elapsedMs / 1000)),
      geometry.width - HUD_INSET,
      geometry.ceiling + HUD_TOP_GAP,
    );
  };

  // --- Loop ---

  const frame = (ts: number): void => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (paused) {
      lastTs = ts;
      return;
    }
    if (geometryDirty) readGeometry();
    if (staleGeometry) {
      state = reduceHeroPong(state, { t: 'lose' }, tuning);
      lastPhase = state.phase;
      deps.onProgress?.(takeProgress(state));
      deps.onPhase?.(state.phase);
      return;
    }

    // Cap de dt: tras un stall del hilo un dt gigante teletransportaría la pelota.
    const dtMs = Math.min(ts - lastTs, 32);
    lastTs = ts;
    if (dtMs <= 0) return;

    state = reduceHeroPong(state, { t: 'tick', dtMs, rng: Math.random }, tuning);

    const steps = subStepCount(speed, dtMs, BALL_SIZE);
    const dtSeconds = dtMs / 1000 / steps;
    for (let i = 0; i < steps && state.phase === 'playing'; i += 1) step(dtSeconds);

    updateLetters(dtMs / 1000);
    draw();

    if (debugSink) {
      // Se reutiliza el mismo objeto y se pasan referencias en crudo: la sonda
      // no puede allocar ni calcular nada, o mediría al instrumento en vez de
      // al juego. Los agregados los hace quien la consume.
      debugFrame.ballLocalX = ball.x - geometry.originLeft;
      debugFrame.ballLocalY = ball.y - geometry.originTop;
      debugFrame.speed = speed;
      debugFrame.state = state;
      debugFrame.activeLines = activeLines;
      debugSink(debugFrame);
    }

    if (state.phase !== lastPhase) {
      lastPhase = state.phase;
      deps.onProgress?.(takeProgress(state));
      // Solo las derrotas reales llevan resumen: la salida por staleGeometry
      // (arriba) no pasa por acá y no debe registrar score.
      if (state.phase === 'gameover') deps.onSummary?.(takeSummary(state));
      deps.onPhase?.(state.phase);
    }
  };

  // --- Entrada y ciclo de vida ---

  const onScroll = (): void => {
    geometryDirty = true;
  };

  const onVisibility = (): void => {
    paused = document.visibilityState === 'hidden';
    // Irse de la pestaña no puede costar el progreso de la partida en curso.
    if (paused) deps.onProgress?.(takeProgress(state));
  };

  const onPageHide = (): void => {
    deps.onProgress?.(takeProgress(state));
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('pagehide', onPageHide);
  document.addEventListener('visibilitychange', onVisibility);

  const observer =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          (entries) => {
            // Fuera de pantalla el juego se congela, sin perder el progreso.
            paused = !entries[entries.length - 1].isIntersecting;
          },
          { threshold: 0 },
        )
      : null;
  observer?.observe(host);

  return {
    start(clientX?: number) {
      if (running) return;
      readGeometry();
      resetBall();
      if (typeof clientX === 'number') {
        paddleCenter = clampPaddleX(clientX, PADDLE_WIDTH / 2, geometry.trackLeft, geometry.trackRight);
        ball = { ...ball, x: paddleCenter };
      }
      // Arranca hacia arriba, apenas inclinada para que no sea un ida y vuelta
      // perfectamente vertical.
      const angle = (Math.random() - 0.5) * (Math.PI / 6);
      ball = { ...ball, vx: Math.sin(angle) * speed, vy: -Math.cos(angle) * speed };
      state = reduceHeroPong(state, { t: 'start' }, tuning);
      lastPhase = state.phase;
      running = true;
      lastTs = performance.now();
      raf = requestAnimationFrame(frame);
    },

    pointerMove(clientX: number) {
      paddleCenter = clampPaddleX(clientX, PADDLE_WIDTH / 2, geometry.trackLeft, geometry.trackRight);
    },

    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
      deps.onProgress?.(takeProgress(state));
      // Devuelve las letras como estaban: el reposo tiene que quedar intacto.
      for (let i = 0; i < glyphCount; i += 1) {
        spans[i]?.style.removeProperty('transform');
        spans[i]?.style.removeProperty('visibility');
      }
    },
  };
}
