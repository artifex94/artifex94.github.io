import { useEffect, useState, type RefObject } from 'react';
import type { LayoutCursor, PreparedTextWithSegments } from '@chenglou/pretext';

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
  /** Intrusión real (px CSS) de la silueta del obstáculo dentro de la banda
      [lineTop, lineBottom), medida desde el borde que enfrenta al texto. Si no
      está, el obstáculo se trata como rectángulo lleno. */
  intrusionAt?: (lineTop: number, lineBottom: number) => number;
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
 * Función PURA (sin DOM): si la línea cruza la banda del obstáculo, se reserva su
 * ancho + gap del lado correspondiente; si no, ocupa todo el ancho. Es el corazón
 * del "fluir alrededor" y es lo que se testea.
 */
export function insetForLine(
  lineTop: number,
  lineHeight: number,
  containerWidth: number,
  obstacle: Obstacle | null,
): LineBox {
  if (!obstacle) return { x: 0, width: containerWidth };

  const lineBottom = lineTop + lineHeight;
  const overlaps = lineBottom > obstacle.top && lineTop < obstacle.bottom;
  if (!overlaps) return { x: 0, width: containerWidth };

  const intrusion = obstacle.intrusionAt
    ? Math.min(Math.max(obstacle.intrusionAt(lineTop, lineBottom), 0), obstacle.width)
    : obstacle.width;
  if (intrusion === 0) return { x: 0, width: containerWidth };

  const reserved = Math.min(intrusion + obstacle.gap, containerWidth);
  const width = Math.max(containerWidth - reserved, 0);
  const x = obstacle.side === 'left' ? reserved : 0;
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
  /** Debajo de este ancho no se realza: se deja el texto plano (mobile). */
  minWidth?: number;
  gap?: number;
}

interface FlowResult {
  lines: PositionedLine[] | null;
  height: number;
  enhanced: boolean;
}

// Un solo import dinámico compartido: Pretext nunca entra en el bundle inicial ni
// en SSR, y no se re-descarga en cada recálculo.
let pretextModule: Promise<typeof import('@chenglou/pretext')> | null = null;
const loadPretext = () => {
  if (!pretextModule) pretextModule = import('@chenglou/pretext');
  return pretextModule;
};

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

const measureObstacle = (
  container: HTMLElement,
  obstacleEl: HTMLElement | null,
  gap: number,
  silhouette?: { img: HTMLImageElement; profile: AlphaProfile },
): Obstacle | null => {
  if (!obstacleEl) return null;
  const c = container.getBoundingClientRect();
  const o = obstacleEl.getBoundingClientRect();
  if (o.width <= 0 || o.height <= 0) return null;
  const top = o.top - c.top;
  const centerX = o.left + o.width / 2 - c.left;
  const obstacle: Obstacle = {
    side: centerX > c.width / 2 ? 'right' : 'left',
    top,
    bottom: top + o.height,
    width: o.width,
    gap,
  };

  if (silhouette) {
    const { img, profile } = silhouette;
    // Medidas de layout del <img> (offsetWidth/Height ignoran el transform de la
    // animación de entrada). El img arranca en el tope del float.
    const imgWidth = img.offsetWidth || o.width;
    const imgHeight = img.offsetHeight || (imgWidth * profile.height) / profile.width;
    if (imgWidth > 0 && imgHeight > 0) {
      const scaleX = imgWidth / profile.width;
      const rowsPerCssPx = profile.height / imgHeight;
      obstacle.intrusionAt = (lineTop, lineBottom) => {
        const first = Math.max(0, Math.floor((lineTop - top) * rowsPerCssPx));
        const last = Math.min(profile.height - 1, Math.ceil((lineBottom - top) * rowsPerCssPx) - 1);
        if (last < first) return 0;
        let min = profile.width;
        let max = -1;
        for (let row = first; row <= last; row += 1) {
          if (profile.minX[row] < min) min = profile.minX[row];
          if (profile.maxX[row] > max) max = profile.maxX[row];
        }
        if (max < 0) return 0;
        return obstacle.side === 'right' ? obstacle.width - min * scaleX : (max + 1) * scaleX;
      };
    }
  }

  return obstacle;
};

const flow = (
  pretext: typeof import('@chenglou/pretext'),
  prepared: PreparedTextWithSegments,
  containerWidth: number,
  lineHeight: number,
  obstacle: Obstacle | null,
): PositionedLine[] => {
  const lines: PositionedLine[] = [];
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = 0;

  // Cota dura: un texto de marketing nunca llega a cientos de líneas; evita un
  // bucle infinito si algo no avanza.
  for (let guard = 0; guard < 400; guard += 1) {
    const { x, width } = insetForLine(y, lineHeight, containerWidth, obstacle);
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

export function usePretextFlow({
  text,
  containerRef,
  measureRef,
  obstacleRef,
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
        const obstacleEl = obstacleRef?.current ?? null;
        const obstacleImg = obstacleEl?.querySelector('img') ?? null;
        const profile = obstacleImg ? await alphaProfileFor(obstacleImg) : null;
        if (cancelled) return;
        const obstacle = measureObstacle(
          container,
          obstacleEl,
          gap,
          obstacleImg && profile ? { img: obstacleImg, profile } : undefined,
        );
        const lines = flow(pretext, prepared, container.clientWidth, lineHeight, obstacle);
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
    window.addEventListener('resize', schedule);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [text, minWidth, gap, containerRef, measureRef, obstacleRef]);

  return result;
}
