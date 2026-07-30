import type { LayoutCursor } from '@chenglou/pretext';
import { loadPretext } from '../../utils/pretextLoader';
import type { GlyphMetric } from '../../utils/heroDodge';

// Medición del texto del hero, una sola vez por partida.
//
// Reparto de tareas:
//   · Pretext  → segmenta el texto, corta las líneas y dice cuánto aire le sobra
//                a cada una (el slack). Todo sin tocar el DOM: mide en canvas.
//   · Range    → da la caja REAL de cada grafema, con el kerning, el tracking y
//                el corte de línea que el navegador aplicó de verdad.
//
// Las posiciones salen del navegador a propósito: cualquier modelo propio podría
// desviarse y el overlay de glifos tiene que caer exactamente sobre el texto
// original. Pretext aporta la segmentación y el margen de maniobra por línea.
//
// Todas las lecturas del DOM pasan acá, en una sola ráfaga: el primer
// getBoundingClientRect fuerza un layout y los demás leen un árbol ya limpio.
// El loop del juego después no lee nada.

/** Elemento del hero que aporta letras jugables (el <span>, el <h1>, el <p>). */
export interface HeroBlockInput {
  element: HTMLElement;
}

export interface HeroBlockStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  lineHeight: string;
  letterSpacing: string;
  color: string;
}

export interface HeroLine {
  /** Relativo al origen (la sección del hero). */
  top: number;
  bottom: number;
  /** Aire que le sobra a la línea: cuánto puede crecer sin desbordar su bloque. */
  slack: number;
}

export interface HeroGlyph extends GlyphMetric {
  /** Índice del bloque al que pertenece: define su tipografía. */
  block: number;
}

export interface HeroMetrics {
  glyphs: HeroGlyph[];
  lines: HeroLine[];
  blocks: HeroBlockStyle[];
  /** Elementos que pintan el texto original: se los apaga durante la partida. */
  paintedElements: HTMLElement[];
  /** Ancho del origen: es la pista del juego. */
  width: number;
  /** Si Pretext y el DOM no coincidieron en el corte de líneas. */
  slackFromDom: boolean;
}

/** Tolerancia para agrupar grafemas en la misma línea. */
const LINE_EPSILON = 2;

export const canMeasureHero = (): boolean => {
  if (typeof window === 'undefined') return false;
  const segmenter = (Intl as unknown as { Segmenter?: unknown }).Segmenter;
  if (typeof segmenter !== 'function') return false;
  if (typeof document.createRange !== 'function') return false;
  try {
    if (!document.createElement('canvas').getContext('2d')) return false;
  } catch {
    return false;
  }
  return true;
};

/**
 * Todos los nodos de texto del bloque, en orden.
 *
 * Se recorren todos (y no solo el más largo) porque un bloque puede estar
 * partido en varios nodos sin que eso signifique nada: `// {nombre}` en JSX son
 * dos. Unirlos en el markup para simplificar la medición cambiaría el shaping
 * del texto y el ancho del bloque, aunque sea por centésimas de píxel.
 *
 * Se saltea lo que está marcado `aria-hidden`: ahí vive el cursor del
 * Typewriter, que es decoración y no una letra del hero.
 */
const findTextNodes = (root: HTMLElement): Text[] => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!(node.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
      const parent = (node as Text).parentElement;
      if (parent?.closest('[aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const out: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    out.push(node as Text);
    node = walker.nextNode();
  }
  return out;
};

const readStyle = (el: HTMLElement): HeroBlockStyle => {
  const cs = getComputedStyle(el);
  return {
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight,
    fontStyle: cs.fontStyle,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing,
    color: cs.color,
  };
};

/** Shorthand que entiende el canvas de Pretext. */
const canvasFont = (el: HTMLElement, style: HeroBlockStyle): string => {
  const cs = getComputedStyle(el);
  return cs.font || `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
};

/** Grafemas del texto con su offset de carácter, para poder pedirle el rect al Range. */
const graphemeOffsets = (text: string): { char: string; start: number; end: number }[] => {
  const Segmenter = (Intl as unknown as { Segmenter: new (locale?: string, options?: { granularity: string }) => { segment: (input: string) => Iterable<{ segment: string; index: number }> } }).Segmenter;
  const segmenter = new Segmenter('es', { granularity: 'grapheme' });
  const out: { char: string; start: number; end: number }[] = [];
  for (const piece of segmenter.segment(text)) {
    out.push({ char: piece.segment, start: piece.index, end: piece.index + piece.segment.length });
  }
  return out;
};

/**
 * Ancho de contenido del bloque, sin padding: es el `maxWidth` con el que hay
 * que pedirle las líneas a Pretext para que corte como cortó el navegador.
 */
const contentWidth = (el: HTMLElement): number => {
  const cs = getComputedStyle(el);
  const padding = parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
  return Math.max(el.clientWidth - padding, 0);
};

/**
 * Medición hecha por adelantado, en tiempo muerto.
 *
 * Medir cuesta ~150ms de latencia (el import de Pretext, esperar las fuentes y
 * 186 consultas de rects). Hacerlo recién en el toque se siente como un
 * titubeo, así que se adelanta y se guarda. Solo se reutiliza si el ancho del
 * bloque sigue siendo el mismo: si el viewport cambió, la medición no sirve.
 */
let warmed: { width: number; metrics: HeroMetrics } | null = null;

export async function warmMeasureHero(
  origin: HTMLElement,
  blocks: readonly HeroBlockInput[],
): Promise<void> {
  const metrics = await measureHero(origin, blocks);
  if (metrics) warmed = { width: metrics.width, metrics };
}

export async function measureHero(
  origin: HTMLElement,
  blocks: readonly HeroBlockInput[],
  { allowWarm = false }: { allowWarm?: boolean } = {},
): Promise<HeroMetrics | null> {
  if (!canMeasureHero() || !blocks.length) return null;

  if (allowWarm && warmed) {
    const width = origin.getBoundingClientRect().width;
    if (Math.abs(warmed.width - width) < 0.5) return warmed.metrics;
    warmed = null;
  }

  // Sin esto se mediría con la fuente de fallback y el overlay caería corrido.
  try {
    await document.fonts?.ready;
  } catch {
    /* sin Font Loading API: se sigue con lo que haya */
  }

  const pretext = await loadPretext();

  const glyphs: HeroGlyph[] = [];
  const lines: HeroLine[] = [];
  const styles: HeroBlockStyle[] = [];
  const paintedElements: HTMLElement[] = [];
  let slackFromDom = false;

  const originRect = origin.getBoundingClientRect();
  if (originRect.width <= 0) return null;

  const range = document.createRange();

  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
    const { element } = blocks[blockIndex];
    const nodes = findTextNodes(element);
    if (!nodes.length) return null;
    const text = nodes.map((node) => node.nodeValue ?? '').join('');
    if (!text.trim()) return null;

    const painted = (nodes[0].parentElement ?? element) as HTMLElement;
    const style = readStyle(painted);
    styles.push(style);
    paintedElements.push(painted);

    const width = contentWidth(element);
    if (width <= 0) return null;

    // --- Pretext: segmentación + corte de líneas + slack ---
    const letterSpacing = parseFloat(style.letterSpacing);
    const prepared = pretext.prepareWithSegments(text, canvasFont(painted, style), {
      letterSpacing: Number.isFinite(letterSpacing) ? letterSpacing : 0,
    });
    const pretextWidths: number[] = [];
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
    for (let guard = 0; guard < 64; guard += 1) {
      const line = pretext.layoutNextLine(prepared, cursor, width);
      if (!line) break;
      pretextWidths.push(line.width);
      // Sin avance del cursor habría loop infinito.
      if (line.end.segmentIndex === cursor.segmentIndex && line.end.graphemeIndex === cursor.graphemeIndex) break;
      cursor = line.end;
    }

    // --- Range: la caja real de cada grafema, nodo por nodo ---
    const blockGlyphs: { char: string; rect: DOMRect }[] = [];
    for (const node of nodes) {
      const nodeText = node.nodeValue ?? '';
      for (const { char, start, end } of graphemeOffsets(nodeText)) {
        if (!char.trim()) continue; // los espacios no son letras jugables
        range.setStart(node, start);
        range.setEnd(node, end);
        const rects = range.getClientRects();
        if (!rects.length) continue;
        // Un grafema entra en un solo rect; si hubiera más, el primero es el suyo.
        const rect = rects[0];
        if (rect.width <= 0 || rect.height <= 0) continue;
        blockGlyphs.push({ char, rect });
      }
    }
    if (!blockGlyphs.length) return null;

    // Agrupación en líneas por posición vertical real.
    const tops: number[] = [];
    const lineOf = (top: number): number => {
      for (let i = 0; i < tops.length; i += 1) {
        if (Math.abs(tops[i] - top) <= LINE_EPSILON) return i;
      }
      tops.push(top);
      return tops.length - 1;
    };

    const localLines = new Map<number, { top: number; bottom: number; left: number; right: number }>();
    const pending: { char: string; rect: DOMRect; local: number }[] = [];
    for (const entry of blockGlyphs) {
      const local = lineOf(entry.rect.top);
      const box = localLines.get(local);
      if (!box) {
        localLines.set(local, {
          top: entry.rect.top,
          bottom: entry.rect.bottom,
          left: entry.rect.left,
          right: entry.rect.right,
        });
      } else {
        box.top = Math.min(box.top, entry.rect.top);
        box.bottom = Math.max(box.bottom, entry.rect.bottom);
        box.left = Math.min(box.left, entry.rect.left);
        box.right = Math.max(box.right, entry.rect.right);
      }
      pending.push({ ...entry, local });
    }

    // Si Pretext cortó igual que el navegador, su slack es el bueno; si no, se
    // deriva del propio DOM. Degradar es mejor que quedarse sin juego por un
    // desacuerdo de line-breaking.
    const sameLineCount = pretextWidths.length === localLines.size;
    if (!sameLineCount) slackFromDom = true;

    const lineOffset = lines.length;
    for (let local = 0; local < localLines.size; local += 1) {
      const box = localLines.get(local)!;
      const domSlack = width - (box.right - box.left);
      const slack = sameLineCount ? width - pretextWidths[local] : domSlack;
      lines.push({
        top: box.top - originRect.top,
        bottom: box.bottom - originRect.top,
        slack: Math.max(slack, 0),
      });
    }

    for (const entry of pending) {
      glyphs.push({
        char: entry.char,
        block: blockIndex,
        line: lineOffset + entry.local,
        x: entry.rect.left - originRect.left,
        y: entry.rect.top - originRect.top,
        w: entry.rect.width,
        h: entry.rect.height,
      });
    }
  }

  range.detach?.();

  return {
    glyphs,
    lines,
    blocks: styles,
    paintedElements,
    width: originRect.width,
    slackFromDom,
  };
}
