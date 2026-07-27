import React from 'react';
import { cn } from '../../utils/cn';

interface WoolStitchProps {
  className?: string;
  label?: string;
}

type Point = readonly [number, number];

const encodeSvg = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const cubicPoint = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return [
    mt2 * mt * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t2 * t * p3[0],
    mt2 * mt * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t2 * t * p3[1],
  ];
};

const sampleCubic = (p0: Point, p1: Point, p2: Point, p3: Point, steps: number, skipFirst = false): Point[] =>
  Array.from({ length: steps + 1 - (skipFirst ? 1 : 0) }, (_, index) => cubicPoint(p0, p1, p2, p3, (index + (skipFirst ? 1 : 0)) / steps));

const pileTrail = (points: Point[], radius = 5.7) => {
  const settled = points.map(([x, y], index) => {
    const previous = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];
    const dx = next[0] - previous[0];
    const dy = next[1] - previous[1];
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length;
    const ny = dx / length;
    const wobble = Math.sin(index * 1.73 + radius) * radius * 0.1;
    const r = radius * (1 + Math.sin(index * 2.17 + 0.35) * 0.12);
    return { cx: x + nx * wobble, cy: y + ny * wobble, r, nx, ny, dx: dx / length, dy: dy / length, index };
  });

  const contact = settled
    .map(({ cx, cy, r, index }) => `<circle cx="${(cx + 1.15).toFixed(2)}" cy="${(cy + 1.85).toFixed(2)}" r="${(r * 0.92).toFixed(2)}" fill="#2b2320" opacity="${(0.1 + (index % 2) * 0.018).toFixed(3)}" />`)
    .join('');

  const halo = settled
    .map(({ cx, cy, r, index }) => `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(r * (1.18 + Math.sin(index * 1.8) * 0.05)).toFixed(2)}" fill="#f5efe6" opacity="0.16" />`)
    .join('');

  const fuzz = settled
    .filter((_, index) => index % 2 === 0)
    .map(({ cx, cy, r, nx, ny, dx, dy, index }) => {
      const side = index % 4 < 2 ? 1 : -1;
      const fx = cx + nx * r * (1.04 + (index % 3) * 0.1) * side + dx * ((index % 5) - 2) * r * 0.18;
      const fy = cy + ny * r * (1.04 + (index % 3) * 0.1) * side + dy * ((index % 5) - 2) * r * 0.18;
      const rr = 0.62 + (index % 4) * 0.16;
      const fill = index % 3 === 0 ? '#fffaf2' : 'url(#stitch-pile)';
      const opacity = index % 3 === 0 ? 0.2 : 0.34;
      return `<circle cx="${fx.toFixed(2)}" cy="${fy.toFixed(2)}" r="${rr.toFixed(2)}" fill="${fill}" opacity="${opacity}" />`;
    })
    .join('');

  const tufts = settled
    .map(({ cx, cy, r, index }) => {
      const fibers = Array.from({ length: 3 + (index % 3 === 0 ? 1 : 0) }, (_, fiberIndex) => {
        const angle = index * 0.88 + fiberIndex * 2.08;
        const outer = r * (0.62 - fiberIndex * 0.055);
        const inner = r * (0.18 + fiberIndex * 0.08);
        const sx = cx + Math.cos(angle) * outer;
        const sy = cy + Math.sin(angle) * outer;
        const mx = cx + Math.cos(angle + 0.54) * inner;
        const my = cy + Math.sin(angle + 0.54) * inner;
        const ex = cx + Math.cos(angle + 1.04) * outer * 0.72;
        const ey = cy + Math.sin(angle + 1.04) * outer * 0.72;
        const stroke = (fiberIndex + index) % 2 === 0 ? '#98463b' : '#e49a8b';
        const opacity = (fiberIndex + index) % 2 === 0 ? 0.18 : 0.14;
        return `<path d="M${sx.toFixed(2)} ${sy.toFixed(2)} C${mx.toFixed(2)} ${my.toFixed(2)}, ${mx.toFixed(2)} ${my.toFixed(2)}, ${ex.toFixed(2)} ${ey.toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${Math.max(0.48, r * 0.085).toFixed(2)}" stroke-linecap="round" opacity="${opacity}" />`;
      }).join('');
      return `<g><circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="url(#stitch-pile)" />${fibers}</g>`;
    })
    .join('');

  const dents = settled
    .slice(1)
    .map(({ cx, cy, dx, dy }, index) => {
      const previous = settled[index];
      const mx = (cx + previous.cx) / 2;
      const my = (cy + previous.cy) / 2 + radius * 0.16;
      const nx = -dy;
      const ny = dx;
      const span = radius * 0.34;
      const sag = radius * 0.18;
      return `<path d="M${(mx - nx * span).toFixed(2)} ${(my - ny * span).toFixed(2)} C${(mx - nx * span * 0.35).toFixed(2)} ${(my + sag - ny * span * 0.35).toFixed(2)}, ${(mx + nx * span * 0.35).toFixed(2)} ${(my + sag + ny * span * 0.35).toFixed(2)}, ${(mx + nx * span).toFixed(2)} ${(my + ny * span).toFixed(2)}" fill="none" stroke="#2b2320" stroke-width="${Math.max(0.7, radius * 0.13).toFixed(2)}" stroke-linecap="round" opacity="0.16" />`;
    })
    .join('');

  return `${contact}${halo}${fuzz}${tufts}${dents}`;
};

const woolStitchPoints = [
  ...sampleCubic([4, 23], [28, 5], [48, 35], [72, 20], 12),
  ...sampleCubic([72, 20], [94, 6], [118, 4], [142, 20], 13, true),
  ...sampleCubic([142, 20], [164, 35], [188, 35], [216, 16], 14, true),
];

// Detalle decorativo de pila: fila de mechones horneada como imagen para evitar repintar paths durante el scroll.
const woolStitchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 44" preserveAspectRatio="xMidYMid meet">
  <defs>
    <radialGradient id="stitch-pile" cx="42%" cy="34%" r="74%">
      <stop offset="0%" stop-color="#dc8a79" />
      <stop offset="48%" stop-color="#ce7b6a" />
      <stop offset="82%" stop-color="#c25e4c" />
      <stop offset="100%" stop-color="#a94d41" />
    </radialGradient>
  </defs>
  ${pileTrail(woolStitchPoints)}
</svg>`;

const woolStitchSrc = encodeSvg(woolStitchSvg);

export const WoolStitch: React.FC<WoolStitchProps> = ({ className, label }) => {
  return (
    <img
      src={woolStitchSrc}
      className={cn('h-8 w-full', className)}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      draggable={false}
      decoding="async"
    />
  );
};

interface WoolPlaceholderProps {
  label?: string;
  className?: string;
}

export const WoolPlaceholder: React.FC<WoolPlaceholderProps> = ({
  label = 'Pieza en preparación',
  className,
}) => (
  <div
    className={cn(
      'atelier-felt relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] border border-line shadow-[0_16px_26px_rgba(112,70,52,0.14),0_2px_7px_rgba(43,35,32,0.06),inset_0_1px_0_rgba(255,255,255,0.88)]',
      className,
    )}
  >
    <div className="relative w-3/4 rounded-full bg-surface/90 px-5 py-3 text-center text-sm font-semibold text-secondary shadow-[0_8px_16px_rgba(43,35,32,0.09)]">
      {label}
    </div>
  </div>
);

export const puffyCardClass =
  'atelier-felt relative overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_20px_28px_rgba(112,70,52,0.16),0_3px_8px_rgba(43,35,32,0.06),inset_0_1px_0_rgba(255,255,255,0.92)]';

export const puffyInteractiveClass =
  'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_28px_rgba(112,70,52,0.18),0_4px_10px_rgba(43,35,32,0.07)]';
