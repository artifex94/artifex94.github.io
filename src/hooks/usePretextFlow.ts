import { useEffect, useState, type RefObject } from 'react';
import type { LayoutCursor, PreparedTextWithSegments } from '@chenglou/pretext';
import { loadPretext } from '../utils/pretextLoader';

// Layout "estilo revista" con Pretext: el texto fluye línea por línea, angostándose
// donde un ornamento (el "obstáculo") se interpone y volviendo al ancho completo
// debajo. Pretext mide los glifos en un canvas (sin tocar el DOM) y nos da, por
// llamada, la línea que entra en un ancho dado; nosotros decidimos DÓNDE va.
//
// Todo esto es SOLO cliente: Pretext necesita canvas 2D + Intl.Segmenter, que no
// existen en el prerender por react-dom ni en jsdom. Por eso el componente que lo
// usa SIEMPRE renderiza el texto plano como base (accesible + indexable) y esto
// lo realza encima cuando se puede. Si algo falla, se queda el texto plano.

export interface Obstacle {
  side: 'left' | 'right';
  /** Borde superior del obstáculo, relativo al tope del contenedor de texto. */
  top: number;
  bottom: number;
  width: number;
  /** Aire entre el obstáculo y el texto. */
  gap: number;
  /** Intrusión real (px CSS) de la silueta dentro de la banda LOCAL
      [bandTop, bandBottom) medida desde el TOPE del obstáculo. Si no está,
      el obstáculo se trata como rectángulo lleno. */
  intrusionAt?: (bandTop: number, bandBottom: number) => number;
  /** Un obstáculo anclado al fondo (p. ej. esquinero inferior del panel) se
      reposiciona con la altura final del texto: su posición depende de cuánto
      mide el párrafo, así que se resuelve por punto fijo en el flow. */
  anchor?: 'top' | 'bottom';
  /** Distancia del tope del obstáculo al FONDO del contenedor (solo anchor bottom). */
  offsetFromBottom?: number;
}

export interface LineBox {
  x: number;
  width: number;
}

export interface PositionedLine {
  text: string;
  x: number;
  y: number;
  width: number;
}

/**
 * Ancho y desplazamiento disponibles para una línea dada su posición vertical.
 *
 * Función PURA (sin DOM): cada obstáculo que cruza la banda de la línea reserva
 * su intrusión + gap del lado que le toca; por lado gana la reserva más grande.
 * Es el corazón del "fluir alrededor" y es lo que se testea.
 */
export function insetForLine(
  lineTop: number,
  lineHeight: number,
  containerWidth: number,
  obstacles: readonly Obstacle[],
): LineBox {
  const lineBottom = lineTop + lineHeight;
  let reservedLeft = 0;
  let reservedRight = 0;

  for (const obstacle of obstacles) {
    const overlaps = lineBottom > obstacle.top && lineTop < obstacle.bottom;
    if (!overlaps) continue;

    const intrusion = obstacle.intrusionAt
      ? Math.min(Math.max(obstacle.intrusionAt(lineTop - obstacle.top, lineBottom - obstacle.top), 0), obstacle.width)
      : obstacle.width;
    if (intrusion === 0) continue;

    const reserved = intrusion + obstacle.gap;
    if (obstacle.side === 'left') reservedLeft = Math.max(reservedLeft, reserved);
    else reservedRight = Math.max(reservedRight, reserved);
  }

  const x = Math.min(reservedLeft, containerWidth);
  const width = Math.max(containerWidth - reservedLeft - reservedRight, 0);
  return { x, width };
}

interface UsePretextFlowOptions {
  text: string;
  /** Contenedor posicionado donde se pintan las líneas. */
  containerRef: RefObject<HTMLElement | null>;
  /** Elemento base cuyo font/line-height se copian para medir igual que se ve. */
  measureRef: RefObject<HTMLElement | null>;
  /** Ornamento a esquivar (opcional). */
  obstacleRef?: RefObject<HTMLElement | null>;
  /** Obstáculos adicionales (p. ej. esquineros del panel). El array debe ser
      estable entre renders (useMemo/useRef en el caller) porque es dep del efecto. */
  extraObstacleRefs?: RefObject<HTMLElement | null>[];
  /** Debajo de este ancho no se realza: se deja el texto plano (mobile). */
  minWidth?: number;
  gap?: number;
}

interface FlowResult {
  lines: PositionedLine[] | null;
  height: number;
  enhanced: boolean;
}

const canEnhance = (container: HTMLElement | null, minWidth: number): boolean => {
  if (typeof window === 'undefined') return false;
  const segmenter = (Intl as unknown as { Segmenter?: unknown }).Segmenter;
  if (typeof segmenter !== 'function') return false;
  try {
    if (!document.createElement('canvas').getContext('2d')) return false;
  } catch {
    return false;
  }
  return !!container && container.clientWidth >= minWidth;
};

const readFont = (el: HTMLElement): { font: string; lineHeight: number } => {
  const cs = getComputedStyle(el);
  const font = cs.font || `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  let lineHeight = parseFloat(cs.lineHeight);
  if (!Number.isFinite(lineHeight)) lineHeight = parseFloat(cs.fontSize) * 1.5 || 24;
  return { font, lineHeight };
};

// Silueta de una imagen con transparencia: primer y último píxel opaco por fila.
// Se calcula una sola vez por `src` (canvas fuera del DOM) y permite que el texto
// siga el contorno real del ornamento en vez de su caja rectangular.
interface AlphaProfile {
  width: number;
  height: number;
  /** minX === width ⇒ fila completamente transparente. */
  minX: Int32Array;
  maxX: Int32Array;
}

const ALPHA_OPAQUE = 24;
const profileCache = new Map<string, Promise<AlphaProfile | null>>();

const buildAlphaProfile = async (img: HTMLImageElement): Promise<AlphaProfile | null> => {
  try {
    if (!img.complete) await img.decode();
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) return null;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, width, height);
    const minX = new Int32Array(height).fill(width);
    const maxX = new Int32Array(height).fill(-1);
    for (let row = 0; row < height; row += 1) {
      const offset = row * width * 4;
      for (let x = 0; x < width; x += 1) {
        if (data[offset + x * 4 + 3] >= ALPHA_OPAQUE) {
          minX[row] = x;
          break;
        }
      }
      if (minX[row] === width) continue;
      for (let x = width - 1; x >= 0; x -= 1) {
        if (data[offset + x * 4 + 3] >= ALPHA_OPAQUE) {
          maxX[row] = x;
          break;
        }
      }
    }
    return { width, height, minX, maxX };
  } catch {
    // Imagen no decodificable o canvas tainted (CORS): sin silueta, el obstáculo
    // queda rectangular como siempre.
    return null;
  }
};

const alphaProfileFor = (img: HTMLImageElement): Promise<AlphaProfile | null> => {
  const src = img.currentSrc || img.src;
  if (!src) return Promise.resolve(null);
  let promise = profileCache.get(src);
  if (!promise) {
    promise = buildAlphaProfile(img);
    profileCache.set(src, promise);
  }
  return promise;
};

interface Silhouette {
  profile: AlphaProfile;
  /** Tamaño de layout (px CSS) con el que se mapea el perfil. */
  width: number;
  height: number;
  /** Espejados visuales del elemento (p. ej. esquineros con -scale-x-100). */
  flipX: boolean;
  flipY: boolean;
}

// Resuelve la silueta de un obstáculo: sirve un <img> directo o un <image> de
// SVG (assets TuftReveal); en este último caso el bitmap se carga aparte por su
// href. Devuelve null si no hay imagen o no se puede muestrear.
const silhouetteFor = async (obstacleEl: HTMLElement): Promise<Silhouette | null> => {
  const rect = obstacleEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const imgEl = obstacleEl.matches('img')
    ? (obstacleEl as HTMLImageElement)
    : obstacleEl.querySelector('img');
  const svgImage = imgEl ? null : obstacleEl.querySelector('svg image');
  const visual: Element | null = imgEl ?? svgImage?.closest('svg') ?? null;

  let bitmap: HTMLImageElement | null = imgEl;
  if (!bitmap && svgImage) {
    const href = svgImage.getAttribute('href') ?? svgImage.getAttribute('xlink:href');
    if (!href) return null;
    bitmap = new Image();
    bitmap.src = href;
  }
  if (!bitmap) return null;

  const profile = await alphaProfileFor(bitmap);
  if (!profile) return null;

  // El transform del elemento visual (matrix a,b,c,d) revela espejados.
  let flipX = false;
  let flipY = false;
  if (visual) {
    const transform = getComputedStyle(visual).transform;
    const match = /matrix\(([-\d.e]+), [-\d.e]+, [-\d.e]+, ([-\d.e]+)/.exec(transform);
    if (match) {
      flipX = parseFloat(match[1]) < 0;
      flipY = parseFloat(match[2]) < 0;
    }
  }

  const width = imgEl ? imgEl.offsetWidth || rect.width : rect.width;
  const height = imgEl
    ? imgEl.offsetHeight || (width * profile.height) / profile.width
    : rect.height;

  return { profile, width, height, flipX, flipY };
};

const measureObstacle = (
  container: HTMLElement,
  obstacleEl: HTMLElement | null,
  gap: number,
  silhouette?: Silhouette | null,
): Obstacle | null => {
  if (!obstacleEl) return null;
  const c = container.getBoundingClientRect();
  const o = obstacleEl.getBoundingClientRect();
  if (o.width <= 0 || o.height <= 0) return null;
  const top = o.top - c.top;
  const centerX = o.left + o.width / 2 - c.left;
  const centerY = top + o.height / 2;
  const anchoredBottom = c.height > 0 && centerY > c.height / 2;
  const obstacle: Obstacle = {
    side: centerX > c.width / 2 ? 'right' : 'left',
    top,
    bottom: top + o.height,
    width: o.width,
    gap,
    anchor: anchoredBottom ? 'bottom' : 'top',
    offsetFromBottom: anchoredBottom ? c.height - top : undefined,
  };

  if (silhouette && silhouette.width > 0 && silhouette.height > 0) {
    const { profile, flipX, flipY } = silhouette;
    const scaleX = silhouette.width / profile.width;
    const rowsPerCssPx = profile.height / silhouette.height;
    obstacle.intrusionAt = (bandTop, bandBottom) => {
      let first = Math.max(0, Math.floor(bandTop * rowsPerCssPx));
      let last = Math.min(profile.height - 1, Math.ceil(bandBottom * rowsPerCssPx) - 1);
      if (last < first) return 0;
      if (flipY) {
        const f = profile.height - 1 - last;
        last = profile.height - 1 - first;
        first = f;
      }
      let min = profile.width;
      let max = -1;
      for (let row = first; row <= last; row += 1) {
        if (profile.minX[row] < min) min = profile.minX[row];
        if (profile.maxX[row] > max) max = profile.maxX[row];
      }
      if (max < 0) return 0;
      if (flipX) {
        const mirroredMin = profile.width - 1 - max;
        const mirroredMax = profile.width - 1 - min;
        min = mirroredMin;
        max = mirroredMax;
      }
      return obstacle.side === 'right' ? obstacle.width - min * scaleX : (max + 1) * scaleX;
    };
  }

  return obstacle;
};

const flow = (
  pretext: typeof import('@chenglou/pretext'),
  prepared: PreparedTextWithSegments,
  containerWidth: number,
  lineHeight: number,
  obstacles: readonly Obstacle[],
): PositionedLine[] => {
  const lines: PositionedLine[] = [];
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = 0;

  // Cota dura: un texto de marketing nunca llega a cientos de líneas; evita un
  // bucle infinito si algo no avanza.
  for (let guard = 0; guard < 400; guard += 1) {
    const { x, width } = insetForLine(y, lineHeight, containerWidth, obstacles);
    const line = pretext.layoutNextLine(prepared, cursor, Math.max(width, 1));
    if (!line) break;
    lines.push({ text: line.text, x, y, width });
    // Sin progreso ⇒ cortar (defensa extra).
    if (
      line.end.segmentIndex === cursor.segmentIndex &&
      line.end.graphemeIndex === cursor.graphemeIndex
    ) {
      break;
    }
    cursor = line.end;
    y += lineHeight;
  }
  return lines;
};

// Los obstáculos anclados al fondo dependen de la altura final del texto (su
// posición absoluta sigue al panel, y el panel sigue al párrafo). Se resuelve
// por punto fijo: maquetar, reposicionarlos con la altura resultante y repetir
// hasta converger. Evita el ping-pongo del ResizeObserver (texto que a veces
// pisaba el esquinero inferior).
const flowStable = (
  pretext: typeof import('@chenglou/pretext'),
  prepared: PreparedTextWithSegments,
  containerWidth: number,
  lineHeight: number,
  obstacles: readonly Obstacle[],
  initialHeight: number,
): PositionedLine[] => {
  const hasBottomAnchored = obstacles.some((o) => o.anchor === 'bottom');
  let height = initialHeight;
  let lines: PositionedLine[] = [];
  const iterations = hasBottomAnchored ? 4 : 1;
  for (let i = 0; i < iterations; i += 1) {
    const positioned = obstacles.map((o) => {
      if (o.anchor !== 'bottom' || o.offsetFromBottom === undefined) return o;
      const boxHeight = o.bottom - o.top;
      const top = height - o.offsetFromBottom;
      return { ...o, top, bottom: top + boxHeight };
    });
    lines = flow(pretext, prepared, containerWidth, lineHeight, positioned);
    const newHeight = lines.length ? lines[lines.length - 1].y + lineHeight : 0;
    if (Math.abs(newHeight - height) < 1) break;
    height = newHeight;
  }
  return lines;
};

export function usePretextFlow({
  text,
  containerRef,
  measureRef,
  obstacleRef,
  extraObstacleRefs,
  minWidth = 640,
  gap = 22,
}: UsePretextFlowOptions): FlowResult {
  const [result, setResult] = useState<FlowResult>({ lines: null, height: 0, enhanced: false });

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;

    const fallback = () => setResult({ lines: null, height: 0, enhanced: false });

    if (!container || !measure || !canEnhance(container, minWidth)) {
      fallback();
      return;
    }

    let cancelled = false;

    const recompute = async () => {
      try {
        if (!canEnhance(container, minWidth)) {
          if (!cancelled) fallback();
          return;
        }
        const pretext = await loadPretext();
        if (cancelled) return;
        const { font, lineHeight } = readFont(measure);
        const prepared = pretext.prepareWithSegments(text, font);
        const obstacleEls = [obstacleRef?.current ?? null, ...(extraObstacleRefs ?? []).map((ref) => ref.current)]
          .filter((el): el is HTMLElement => el !== null);
        const obstacles: Obstacle[] = [];
        for (const el of obstacleEls) {
          const silhouette = await silhouetteFor(el).catch(() => null);
          if (cancelled) return;
          const obstacle = measureObstacle(container, el, gap, silhouette);
          if (obstacle) obstacles.push(obstacle);
        }
        const lines = flowStable(pretext, prepared, container.clientWidth, lineHeight, obstacles, container.clientHeight);
        if (cancelled) return;
        if (lines.length === 0) {
          fallback();
          return;
        }
        const height = lines[lines.length - 1].y + lineHeight;
        setResult({ lines, height, enhanced: true });
      } catch {
        // Cualquier problema de Pretext ⇒ texto plano. Nunca rompemos la página.
        if (!cancelled) fallback();
      }
    };

    void recompute();

    // Re-medir cuando cambia el ancho del contenedor o el tamaño del ornamento
    // (fuentes que cargan tarde, rotación, resize).
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => void recompute());
    };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    ro?.observe(container);
    if (obstacleRef?.current) ro?.observe(obstacleRef.current);
    for (const ref of extraObstacleRefs ?? []) {
      if (ref.current) ro?.observe(ref.current);
    }
    window.addEventListener('resize', schedule);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [text, minWidth, gap, containerRef, measureRef, obstacleRef, extraObstacleRefs]);

  return result;
}
