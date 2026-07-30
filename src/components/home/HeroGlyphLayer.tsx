import React, { useEffect, useRef } from 'react';
import type { HeroMetrics } from './measureHero';

// Copia jugable del texto del hero: un <span> absoluto por letra, en la
// posición que el navegador ya le había dado.
//
// El texto original NO se parte nunca. Mientras el overlay está montado, los
// bloques originales se pintan con `color: transparent`, que es la única forma
// de apagarlos sin tocar el layout: `sr-only`, `display` o `visibility`
// colapsarían la caja y correrían todo lo que hay debajo. El texto sigue en el
// DOM, en el árbol de accesibilidad y en el HTML que ve el prerender.

interface HeroGlyphLayerProps {
  metrics: HeroMetrics;
  /** Recibe los spans en el mismo orden que `metrics.glyphs`. */
  onSpans: (spans: HTMLSpanElement[]) => void;
}

export const HeroGlyphLayer: React.FC<HeroGlyphLayerProps> = ({ metrics, onSpans }) => {
  const spans = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    onSpans(spans.current);
  }, [metrics, onSpans]);

  // Apaga el texto original mientras el overlay lo reemplaza, y lo devuelve
  // exactamente como estaba al desmontarse.
  useEffect(() => {
    const restore = metrics.paintedElements.map((el) => ({ el, color: el.style.color }));
    for (const { el } of restore) el.style.color = 'transparent';
    return () => {
      for (const { el, color } of restore) el.style.color = color;
    };
  }, [metrics]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {metrics.glyphs.map((glyph, index) => {
        const style = metrics.blocks[glyph.block];
        return (
          <span
            key={index}
            ref={(el) => {
              if (el) spans.current[index] = el;
            }}
            style={{
              position: 'absolute',
              left: glyph.x,
              top: glyph.y,
              // La caja del grafema mide una línea de alto, así que con el mismo
              // line-height el glifo cae en el mismo píxel que el original.
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              fontStyle: style.fontStyle,
              lineHeight: style.lineHeight,
              letterSpacing: style.letterSpacing,
              color: style.color,
              whiteSpace: 'pre',
              willChange: 'transform',
            }}
          >
            {glyph.char}
          </span>
        );
      })}
    </div>
  );
};
