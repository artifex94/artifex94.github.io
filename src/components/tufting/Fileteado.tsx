import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';

type FileteadoProps = {
  className?: string;
  label?: string;
};

type BannerProps = FileteadoProps & {
  children?: React.ReactNode;
};

type CornerProps = FileteadoProps & {
  flip?: 'none' | 'x' | 'y' | 'both';
};

const COLORS = {
  accent: '#c25e4c',
  accentTwist: '#ce7b6a',
  flag: '#6da9c9',
  flagTwist: '#8eb4c9',
  gilt: '#c9a34e',
  giltTwist: '#d4af6b',
  primary: '#2b2320',
  surface: '#ffffff',
  base: '#f5efe6',
};

const svgDataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const springIn = (reduce: boolean, delay = 0) => ({
  initial: reduce ? false : { opacity: 0, scale: 0.97, y: 8 },
  whileInView: { opacity: 1, scale: 1, y: 0 },
  viewport: { once: true, margin: '-24px' },
  transition: reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 120, damping: 19, delay },
});

const textureDefs = (name: string) => `
  <defs>
    <pattern id="${name}-felt-grain" width="28" height="28" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill="transparent" />
      <path d="M2 7 C8 3, 14 9, 22 5 M4 20 C10 16, 17 22, 26 17 M0 13 C7 17, 14 10, 23 14" stroke="${COLORS.primary}" stroke-width="0.62" stroke-linecap="round" opacity="0.08" />
      <path d="M5 12 L13 9 M17 25 L26 22 M2 26 L9 24 M20 3 L27 1" stroke="${COLORS.surface}" stroke-width="0.64" stroke-linecap="round" opacity="0.28" />
      <path d="M9 4 l5 2 M13 18 l8 -3 M24 10 l3 3" stroke="${COLORS.accentTwist}" stroke-width="0.48" stroke-linecap="round" opacity="0.12" />
    </pattern>
    <pattern id="${name}-tuft-edge" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
      <path d="M2 9 C3 5, 6 5, 7 9" fill="none" stroke="${COLORS.surface}" stroke-width="1.1" stroke-linecap="round" opacity="0.3" />
    </pattern>
  </defs>`;

type Point = readonly [number, number];
type PileTone = 'accent' | 'gilt' | 'flag';

const pileGradientDefs = (name: string) => `
  <defs>
    <radialGradient id="${name}-pile-accent" cx="42%" cy="34%" r="74%">
      <stop offset="0%" stop-color="#dc8a79" />
      <stop offset="48%" stop-color="${COLORS.accentTwist}" />
      <stop offset="82%" stop-color="${COLORS.accent}" />
      <stop offset="100%" stop-color="#a94d41" />
    </radialGradient>
    <radialGradient id="${name}-pile-gilt" cx="42%" cy="34%" r="74%">
      <stop offset="0%" stop-color="#e2be74" />
      <stop offset="50%" stop-color="${COLORS.giltTwist}" />
      <stop offset="84%" stop-color="${COLORS.gilt}" />
      <stop offset="100%" stop-color="#a98238" />
    </radialGradient>
    <radialGradient id="${name}-pile-flag" cx="42%" cy="34%" r="74%">
      <stop offset="0%" stop-color="#a8cadb" />
      <stop offset="50%" stop-color="${COLORS.flagTwist}" />
      <stop offset="84%" stop-color="${COLORS.flag}" />
      <stop offset="100%" stop-color="#5a8ba6" />
    </radialGradient>
  </defs>`;

const pileFiberTone = (tone: PileTone) => {
  if (tone === 'gilt') return { dark: '#876a2d', light: '#ead09a' };
  if (tone === 'flag') return { dark: '#47758e', light: '#c0d9e5' };
  return { dark: '#98463b', light: '#e49a8b' };
};

const seededUnit = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const closedBlobPath = (cx: number, cy: number, radius: number, seed: number, scale = 1) => {
  const count = 6 + Math.floor(seededUnit(seed + 0.17) * 4);
  const points = Array.from({ length: count }, (_, index): Point => {
    const baseAngle = (Math.PI * 2 * index) / count;
    const angle = baseAngle + (seededUnit(seed + index * 5.31) - 0.5) * 0.18;
    const jitter = 0.82 + seededUnit(seed + index * 9.73) * 0.36;
    const rx = radius * scale * jitter * (0.97 + seededUnit(seed + 31 + index) * 0.07);
    const ry = radius * scale * jitter * (0.95 + seededUnit(seed + 47 + index) * 0.1);
    return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
  });

  return points
    .map((point, index) => {
      const previous = points[(index - 1 + count) % count];
      const next = points[(index + 1) % count];
      const nextNext = points[(index + 2) % count];
      const cp1: Point = [point[0] + (next[0] - previous[0]) / 6, point[1] + (next[1] - previous[1]) / 6];
      const cp2: Point = [next[0] - (nextNext[0] - point[0]) / 6, next[1] - (nextNext[1] - point[1]) / 6];
      return `${index === 0 ? `M${point[0].toFixed(2)} ${point[1].toFixed(2)}` : ''} C${cp1[0].toFixed(2)} ${cp1[1].toFixed(2)}, ${cp2[0].toFixed(2)} ${cp2[1].toFixed(2)}, ${next[0].toFixed(2)} ${next[1].toFixed(2)}`;
    })
    .join(' ') + ' Z';
};

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


const bannerPompon = (id: string, x: number, y: number, radius: number, tone: PileTone) =>
  pileTrail([[x, y]], { radius, tone, id, dentEvery: 1 });

const pileTrail = (
  points: Point[],
  { radius = 6, tone = 'accent', id = 'pile', dentEvery = 1 }: { radius?: number; tone?: PileTone; id?: string; dentEvery?: number } = {},
) => {
  const fiberTone = pileFiberTone(tone);
  const settled = points.map(([x, y], index) => {
    const previous = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];
    const dx = next[0] - previous[0];
    const dy = next[1] - previous[1];
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length;
    const ny = dx / length;
    const wobble = Math.sin(index * 1.73 + radius) * radius * 0.16;
    const r = radius * (1 + Math.sin(index * 2.21 + 0.4) * 0.1 + (seededUnit(index + radius * 19) - 0.5) * 0.08);
    return { x, y, cx: x + nx * wobble, cy: y + ny * wobble, r, nx, ny, dx: dx / length, dy: dy / length, index };
  });

  const contact = settled
    .map(({ cx, cy, r, index }) => `<path d="${closedBlobPath(cx + 1.2, cy + 1.9, r * 0.96, index + radius * 101, 1)}" fill="${COLORS.primary}" opacity="${(0.09 + (index % 2) * 0.018).toFixed(3)}" />`)
    .join('');

  const halo = settled
    .map(({ cx, cy, r, index }) => `<path d="${closedBlobPath(cx, cy, r, index + radius * 137, 1.3 + Math.sin(index * 1.91) * 0.04)}" fill="${COLORS.base}" opacity="0.16" />`)
    .join('');

  const velvetRing = settled
    .map(({ cx, cy, r, index }) => `<path d="${closedBlobPath(cx, cy, r, index + radius * 173, 1.16 + seededUnit(index + 13) * 0.08)}" fill="url(#${id}-pile-${tone})" opacity="${(0.25 + seededUnit(index + 29) * 0.1).toFixed(2)}" />`)
    .join('');

  const fuzz = settled
    .flatMap(({ cx, cy, r, nx, ny, dx, dy, index }) =>
      Array.from({ length: 5 }, (_, fuzzIndex) => {
        const side = (fuzzIndex + index) % 5 < 3 ? 1 : -1;
        const spread = (fuzzIndex - 2) * r * 0.34 + (seededUnit(index * 17 + fuzzIndex) - 0.5) * r * 0.28;
        const out = r * (1.02 + seededUnit(index * 23 + fuzzIndex) * 0.34);
        const fx = cx + nx * out * side + dx * spread;
        const fy = cy + ny * out * side + dy * spread;
        const len = 1 + seededUnit(index * 41 + fuzzIndex) * 1.5;
        const lean = (seededUnit(index * 53 + fuzzIndex) - 0.5) * 0.9;
        const ex = fx + (nx * side + dx * lean) * len;
        const ey = fy + (ny * side + dy * lean) * len;
        const mx = (fx + ex) / 2 + dx * (seededUnit(index * 61 + fuzzIndex) - 0.5) * len;
        const my = (fy + ey) / 2 + dy * (seededUnit(index * 67 + fuzzIndex) - 0.5) * len;
        const stroke = (index + fuzzIndex) % 4 === 0 ? COLORS.surface : fiberTone.light;
        const opacity = 0.2 + seededUnit(index * 71 + fuzzIndex) * 0.25;
        return `<path d="M${fx.toFixed(2)} ${fy.toFixed(2)} Q${mx.toFixed(2)} ${my.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${(0.42 + seededUnit(index * 79 + fuzzIndex) * 0.42).toFixed(2)}" stroke-linecap="round" opacity="${opacity.toFixed(2)}" />`;
      }),
    )
    .join('');

  const tuft = settled
    .map(({ cx, cy, r, index }) => {
      const arcCount = 3 + (index % 3 === 0 ? 1 : 0);
      const fibers = Array.from({ length: arcCount }, (_, fiberIndex) => {
        const angle = index * 0.88 + fiberIndex * 2.08;
        const inner = r * (0.18 + fiberIndex * 0.08);
        const outer = r * (0.62 - fiberIndex * 0.055);
        const sx = cx + Math.cos(angle) * outer;
        const sy = cy + Math.sin(angle) * outer;
        const mx = cx + Math.cos(angle + 0.54) * inner;
        const my = cy + Math.sin(angle + 0.54) * inner;
        const ex = cx + Math.cos(angle + 1.04) * outer * 0.72;
        const ey = cy + Math.sin(angle + 1.04) * outer * 0.72;
        const stroke = (fiberIndex + index) % 2 === 0 ? fiberTone.dark : fiberTone.light;
        const opacity = (fiberIndex + index) % 2 === 0 ? 0.18 : 0.14;
        return `<path d="M${sx.toFixed(2)} ${sy.toFixed(2)} C${mx.toFixed(2)} ${my.toFixed(2)}, ${mx.toFixed(2)} ${my.toFixed(2)}, ${ex.toFixed(2)} ${ey.toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${Math.max(0.48, r * 0.085).toFixed(2)}" stroke-linecap="round" opacity="${opacity}" />`;
      }).join('');

      return `<g><path d="${closedBlobPath(cx, cy, r, index + radius * 211)}" fill="url(#${id}-pile-${tone})" />${fibers}</g>`;
    })
    .join('');

  const dents = settled
    .slice(1)
    .filter((_, index) => index % dentEvery === 0)
    .map(({ cx, cy, dx, dy }, index) => {
      const previous = settled[index];
      const mx = (cx + previous.cx) / 2;
      const my = (cy + previous.cy) / 2 + radius * 0.16;
      const nx = -dy;
      const ny = dx;
      const span = radius * 0.34;
      const sag = radius * 0.18;
      return `<path d="M${(mx - nx * span).toFixed(2)} ${(my - ny * span).toFixed(2)} C${(mx - nx * span * 0.35).toFixed(2)} ${(my + sag - ny * span * 0.35).toFixed(2)}, ${(mx + nx * span * 0.35).toFixed(2)} ${(my + sag + ny * span * 0.35).toFixed(2)}, ${(mx + nx * span).toFixed(2)} ${(my + ny * span).toFixed(2)}" fill="none" stroke="${COLORS.primary}" stroke-width="${Math.max(0.7, radius * 0.13).toFixed(2)}" stroke-linecap="round" opacity="0.16" />`;
    })
    .join('');

  return `<g aria-hidden="true">${contact}</g><g aria-hidden="true">${halo}${velvetRing}${fuzz}</g><g aria-hidden="true">${tuft}</g><g aria-hidden="true">${dents}</g>`;
};

const fileteadoSvg = (viewBox: string, content: string, preserveAspectRatio = 'xMidYMid meet') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="${preserveAspectRatio}">${content}</svg>`;

const FileteadoImg: React.FC<FileteadoProps & { src: string; animate?: boolean }> = ({ className, label, src, animate = false }) => {
  const reduce = useReducedMotion();
  const accessibility = label ? { alt: label } : { alt: '', 'aria-hidden': true as const };

  if (animate) {
    return <motion.img src={src} className={className} draggable={false} decoding="async" {...accessibility} {...springIn(Boolean(reduce))} />;
  }

  return <img src={src} className={className} draggable={false} decoding="async" {...accessibility} />;
};

const dividerMainPoints = [
  ...sampleCubic([24, 44], [58, 14], [96, 17], [112, 39], 14),
  ...sampleCubic([112, 39], [126, 59], [92, 66], [88, 45], 9, true),
  ...sampleCubic([88, 45], [86, 30], [104, 27], [124, 39], 9, true),
  ...sampleCubic([124, 39], [156, 58], [182, 58], [210, 39], 16, true),
  ...sampleCubic([210, 39], [238, 20], [264, 20], [296, 39], 16, true),
  ...sampleCubic([296, 39], [316, 27], [334, 30], [332, 45], 9, true),
  ...sampleCubic([332, 45], [328, 66], [294, 59], [308, 39], 9, true),
  ...sampleCubic([308, 39], [324, 17], [362, 14], [396, 44], 14, true),
];

const dividerLeftCurlPoints = [
  ...sampleCubic([84, 52], [72, 39], [76, 23], [94, 21], 9),
  ...sampleCubic([94, 21], [112, 23], [112, 43], [96, 46], 9, true),
];

const dividerRightCurlPoints = [
  ...sampleCubic([336, 52], [348, 39], [344, 23], [326, 21], 9),
  ...sampleCubic([326, 21], [308, 23], [308, 43], [324, 46], 9, true),
];

const dividerFlagPoints = [
  ...sampleCubic([150, 39], [166, 20], [194, 21], [210, 39], 12),
  ...sampleCubic([210, 39], [226, 21], [254, 20], [270, 39], 12, true),
];

const DIVIDER_SVG = fileteadoSvg(
  '0 0 420 88',
  `${pileGradientDefs('divider')}
  ${pileTrail(dividerMainPoints, { radius: 6.6, tone: 'accent', id: 'divider' })}
  ${pileTrail(dividerLeftCurlPoints, { radius: 5.2, tone: 'gilt', id: 'divider' })}
  ${pileTrail(dividerRightCurlPoints, { radius: 5.2, tone: 'gilt', id: 'divider' })}
  ${pileTrail(dividerFlagPoints, { radius: 5.4, tone: 'flag', id: 'divider' })}
  ${pileTrail([[210, 39]], { radius: 7.2, tone: 'gilt', id: 'divider' })}`,
);

const mirrorRows = (rows: Point[][]): Point[][] => rows.map((row) => row.map(([x, y]) => [240 - x, y] as const));

const fleurDeLisCentralPetalPath = 'M120 28 C132 48 137 72 136 96 C135 119 130 137 126 150 L114 150 C110 137 105 119 104 96 C103 72 108 48 120 28 Z';
const fleurDeLisLeftPetalPath = 'M104 150 C94 148 87 138 86 126 C85 113 89 100 95 91 C83 92 70 99 60 110 C51 121 49 131 52 136 C45 128 47 111 60 98 C75 83 93 76 104 82 C99 86 95 93 92 101 C86 116 78 131 84 142 C88 150 97 153 104 150 Z';
const fleurDeLisRightPetalPath = 'M136 150 C146 148 153 138 154 126 C155 113 151 100 145 91 C157 92 170 99 180 110 C189 121 191 131 188 136 C195 128 193 111 180 98 C165 83 147 76 136 82 C141 86 145 93 148 101 C154 116 162 131 156 142 C152 150 143 153 136 150 Z';
const fleurDeLisBandPath = 'M87 149 H153 C158 149 162 153 162 158 C162 163 158 167 153 167 H87 C82 167 78 163 78 158 C78 153 82 149 87 149 Z';
const fleurDeLisBasePath = 'M113 168 H127 C126 182 124 198 120 212 C116 198 114 182 113 168 Z M94 168 H106 C103 181 94 194 82 202 C82 188 87 177 94 168 Z M134 168 H146 C153 177 158 188 158 202 C146 194 137 181 134 168 Z';

const fleurDeLisCentralPetalRows: Point[][] = [
  [[120, 36]],
  [[116, 50], [120, 46], [124, 50]],
  [[112, 66], [120, 61], [128, 66]],
  [[108, 84], [116, 79], [124, 79], [132, 84]],
  [[108, 102], [116, 98], [124, 98], [132, 102]],
  [[110, 120], [117, 117], [123, 117], [130, 120]],
  [[113, 138], [120, 136], [127, 138]],
  [[116, 148], [120, 147], [124, 148]],
];

const fleurDeLisLeftPetalRows: Point[][] = [
  [[98, 88], [91, 92]],
  [[98, 99], [88, 102], [77, 109], [66, 119]],
  [[96, 110], [85, 114], [74, 122], [63, 131], [55, 135]],
  [[91, 122], [80, 128], [69, 135], [58, 137]],
  [[87, 135], [77, 141], [67, 141]],
  [[91, 145], [100, 149]],
];
const fleurDeLisRightPetalRows = mirrorRows(fleurDeLisLeftPetalRows);

const fleurDeLisBandRows: Point[][] = [
  [[86, 153], [103, 153], [120, 153], [137, 153], [154, 153]],
  [[82, 158], [101, 158], [120, 158], [139, 158], [158, 158]],
  [[86, 163], [103, 163], [120, 163], [137, 163], [154, 163]],
];

const fleurDeLisBaseRows: Point[][] = [
  [[97, 172], [92, 181], [86, 193]],
  [[104, 173], [99, 186], [88, 198]],
  [[116, 174], [120, 188], [124, 174]],
  [[113, 185], [120, 199], [127, 185]],
  [[136, 173], [141, 186], [152, 198]],
  [[143, 172], [148, 181], [154, 193]],
  [[116, 199], [120, 209], [124, 199]],
];

const ORNAMENT_SVG = fileteadoSvg(
  '0 0 240 240',
  `<defs>
    <radialGradient id="ornament-wool-glow" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="${COLORS.surface}" stop-opacity="0.98" />
      <stop offset="68%" stop-color="${COLORS.base}" stop-opacity="0.5" />
      <stop offset="100%" stop-color="${COLORS.accent}" stop-opacity="0.08" />
    </radialGradient>
  </defs>
  ${pileGradientDefs('ornament')}
  ${textureDefs('ornament')}
  <circle cx="120" cy="120" r="88" fill="url(#ornament-wool-glow)" opacity="0.86" style="mix-blend-mode:multiply" />
  <circle cx="120" cy="120" r="84" fill="url(#ornament-felt-grain)" opacity="0.6" />
  <defs>
    <clipPath id="ornament-central-petal-clip"><path d="${fleurDeLisCentralPetalPath}" /></clipPath>
    <clipPath id="ornament-left-petal-clip"><path d="${fleurDeLisLeftPetalPath}" /></clipPath>
    <clipPath id="ornament-right-petal-clip"><path d="${fleurDeLisRightPetalPath}" /></clipPath>
    <clipPath id="ornament-band-clip"><path d="${fleurDeLisBandPath}" /></clipPath>
    <clipPath id="ornament-base-clip"><path d="${fleurDeLisBasePath}" /></clipPath>
  </defs>
  <g style="mix-blend-mode:multiply">
    <path d="${fleurDeLisCentralPetalPath}" fill="${COLORS.accent}" opacity="0.88" />
    <path d="${fleurDeLisLeftPetalPath}" fill="${COLORS.accent}" opacity="0.88" />
    <path d="${fleurDeLisRightPetalPath}" fill="${COLORS.accent}" opacity="0.88" />
    <path d="${fleurDeLisBasePath}" fill="${COLORS.accent}" opacity="0.88" />
    <path d="${fleurDeLisBandPath}" fill="${COLORS.gilt}" opacity="0.94" />
    <g clip-path="url(#ornament-central-petal-clip)">
      <path d="${fleurDeLisCentralPetalPath}" fill="url(#ornament-felt-grain)" opacity="0.22" />
      ${fleurDeLisCentralPetalRows.map((row) => pileTrail(row, { radius: 5.65, tone: 'accent', id: 'ornament', dentEvery: 1 })).join('')}
    </g>
    <g clip-path="url(#ornament-left-petal-clip)">
      <path d="${fleurDeLisLeftPetalPath}" fill="url(#ornament-felt-grain)" opacity="0.22" />
      <path d="${fleurDeLisLeftPetalPath}" fill="none" stroke="url(#ornament-pile-accent)" stroke-width="3.2" stroke-linejoin="round" opacity="0.24" />
      ${fleurDeLisLeftPetalRows.map((row) => pileTrail(row, { radius: 6.45, tone: 'accent', id: 'ornament', dentEvery: 1 })).join('')}
    </g>
    <g clip-path="url(#ornament-right-petal-clip)">
      <path d="${fleurDeLisRightPetalPath}" fill="url(#ornament-felt-grain)" opacity="0.22" />
      <path d="${fleurDeLisRightPetalPath}" fill="none" stroke="url(#ornament-pile-accent)" stroke-width="3.2" stroke-linejoin="round" opacity="0.24" />
      ${fleurDeLisRightPetalRows.map((row) => pileTrail(row, { radius: 6.45, tone: 'accent', id: 'ornament', dentEvery: 1 })).join('')}
    </g>
    <g clip-path="url(#ornament-base-clip)">
      <path d="${fleurDeLisBasePath}" fill="url(#ornament-felt-grain)" opacity="0.22" />
      <path d="${fleurDeLisBasePath}" fill="none" stroke="url(#ornament-pile-accent)" stroke-width="3" stroke-linejoin="round" opacity="0.22" />
      ${fleurDeLisBaseRows.map((row) => pileTrail(row, { radius: 5.65, tone: 'accent', id: 'ornament', dentEvery: 1 })).join('')}
    </g>
    <g clip-path="url(#ornament-band-clip)">
      <path d="${fleurDeLisBandPath}" fill="url(#ornament-felt-grain)" opacity="0.18" />
      <path d="${fleurDeLisBandPath}" fill="none" stroke="url(#ornament-pile-gilt)" stroke-width="2.8" stroke-linejoin="round" opacity="0.28" />
      ${fleurDeLisBandRows.map((row) => pileTrail(row, { radius: 5.3, tone: 'gilt', id: 'ornament', dentEvery: 1 })).join('')}
    </g>
  </g>`,
);


const bannerStitches = (side: 'top' | 'bottom' | 'left' | 'right') => {
  if (side === 'top') {
    return Array.from({ length: 30 }, (_, index) => {
      const x = 118 + index * 24;
      const y = 110 + (index % 3) * 1.2;
      return `<path d="M${x} ${y + 10} l13 -17" stroke="${COLORS.giltTwist}" stroke-width="5.4" stroke-linecap="round" opacity="0.92" />`;
    }).join('');
  }

  if (side === 'bottom') {
    return Array.from({ length: 30 }, (_, index) => {
      const x = 118 + index * 24;
      const y = 416 - (index % 2) * 1.4;
      return `<path d="M${x} ${y - 12} l14 18" stroke="${COLORS.giltTwist}" stroke-width="5.4" stroke-linecap="round" opacity="0.88" />`;
    }).join('');
  }

  if (side === 'left') {
    return Array.from({ length: 12 }, (_, index) => {
      const y = 134 + index * 22;
      return `<path d="M112 ${y} l-17 11" stroke="${COLORS.giltTwist}" stroke-width="5.3" stroke-linecap="round" opacity="0.86" />`;
    }).join('');
  }

  return Array.from({ length: 12 }, (_, index) => {
    const y = 134 + index * 22;
    return `<path d="M848 ${y} l17 12" stroke="${COLORS.giltTwist}" stroke-width="5.3" stroke-linecap="round" opacity="0.86" />`;
  }).join('');
};

const bannerFringes = () =>
  Array.from({ length: 29 }, (_, index) => {
    const x = 144 + index * 24;
    const length = 43 + (index % 5) * 5;
    const sway = index % 2 === 0 ? -3.5 : 3.5;
    const tone: PileTone = index % 4 === 1 ? 'flag' : index % 4 === 2 ? 'gilt' : 'accent';
    const color = tone === 'flag' ? COLORS.flagTwist : tone === 'gilt' ? COLORS.giltTwist : COLORS.accentTwist;
    const endX = x + sway * 0.52;
    const endY = 421 + length;
    return `<path d="M${x} 419 C${x + sway} 435, ${x - sway * 0.45} ${444 + length * 0.18}, ${endX.toFixed(1)} ${(endY - 7).toFixed(1)}" stroke="${color}" stroke-width="3.3" stroke-linecap="round" opacity="0.66" />
      <path d="M${x + 1.4} 419 C${x + sway + 1.5} 435, ${x - sway * 0.35} ${443 + length * 0.18}, ${(endX + 1.2).toFixed(1)} ${(endY - 7).toFixed(1)}" stroke="${COLORS.surface}" stroke-width="0.72" stroke-linecap="round" opacity="0.34" />
      ${bannerPompon('banner', endX, endY, 8.2 + (index % 3) * 0.75, tone)}`;
  }).join('');

const bannerInnerTopPoints = sampleCubic([138, 146], [254, 132], [704, 130], [824, 148], 44);
const bannerInnerRightPoints = sampleCubic([824, 148], [835, 221], [828, 320], [812, 392], 24, true);
const bannerInnerBottomPoints = sampleCubic([812, 392], [654, 405], [306, 405], [148, 392], 44, true);
const bannerInnerLeftPoints = sampleCubic([148, 392], [132, 315], [128, 219], [138, 146], 24, true);
const bannerInnerBorderPoints = [
  ...bannerInnerTopPoints,
  ...bannerInnerRightPoints,
  ...bannerInnerBottomPoints,
  ...bannerInnerLeftPoints,
];


const BANNER_SVG = fileteadoSvg(
  '0 0 960 560',
  `<defs>
    <linearGradient id="banner-wool-ground" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7efe2" />
      <stop offset="44%" stop-color="#ead9c3" />
      <stop offset="100%" stop-color="#d7bfa2" />
    </linearGradient>
    <linearGradient id="banner-wood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a86b3f" />
      <stop offset="45%" stop-color="#7b452b" />
      <stop offset="100%" stop-color="#c28a56" />
    </linearGradient>
    <pattern id="banner-felt-fiber" width="38" height="38" patternUnits="userSpaceOnUse">
      <rect width="38" height="38" fill="transparent" />
      <path d="M2 8 C12 4, 18 13, 31 7 M7 24 C16 17, 22 28, 36 21 M4 34 C12 30, 18 36, 26 31" stroke="#7d5c49" stroke-width="0.95" stroke-linecap="round" opacity="0.16" />
      <path d="M0 16 C10 20, 18 12, 28 17 M12 3 C20 9, 28 0, 38 6 M15 36 C21 31, 28 35, 35 29" stroke="#fffaf1" stroke-width="0.85" stroke-linecap="round" opacity="0.32" />
      <path d="M19 10 l8 -3 M6 29 l7 2 M30 32 l6 -4" stroke="#bf8062" stroke-width="0.7" stroke-linecap="round" opacity="0.22" />
    </pattern>
  </defs>
  ${pileGradientDefs('banner')}
  <path d="M168 92 C252 66, 348 74, 480 70 C612 66, 708 68, 790 92" fill="none" stroke="${COLORS.primary}" stroke-width="8" stroke-linecap="round" opacity="0.18" />
  <path d="M193 98 C190 116, 184 132, 176 148 M767 98 C770 116, 776 132, 784 148" fill="none" stroke="#8a5a3a" stroke-width="6" stroke-linecap="round" opacity="0.86" />
  <path d="M112 84 C256 56, 706 57, 848 84" fill="none" stroke="url(#banner-wood)" stroke-width="24" stroke-linecap="round" />
  <path d="M126 80 C286 70, 548 70, 832 82" fill="none" stroke="#d39b63" stroke-width="2.4" stroke-linecap="round" opacity="0.55" />
  <path d="M212 84 C235 76, 248 90, 270 82 M602 82 C626 73, 646 92, 674 82" fill="none" stroke="#5d321f" stroke-width="2.2" stroke-linecap="round" opacity="0.46" />
  <path d="M194 98 C172 132, 143 138, 105 156" fill="none" stroke="#b89464" stroke-width="5" stroke-linecap="round" />
  <path d="M766 98 C788 132, 817 138, 855 156" fill="none" stroke="#b89464" stroke-width="5" stroke-linecap="round" />
  <path d="M118 122 C238 106, 716 103, 844 123 C858 207, 852 329, 830 417 C665 432, 294 432, 130 417 C107 322, 105 213, 118 122Z" fill="${COLORS.primary}" opacity="0.15" transform="translate(5 9)" />
  <path d="M118 122 C238 106, 716 103, 844 123 C858 207, 852 329, 830 417 C665 432, 294 432, 130 417 C107 322, 105 213, 118 122Z" fill="url(#banner-wool-ground)" />
  <path d="M118 122 C238 106, 716 103, 844 123 C858 207, 852 329, 830 417 C665 432, 294 432, 130 417 C107 322, 105 213, 118 122Z" fill="url(#banner-felt-fiber)" opacity="0.96" />
  <g opacity="0.78">${pileTrail(bannerInnerBorderPoints, { radius: 4.25, tone: 'accent', id: 'banner', dentEvery: 2 })}</g>
  <path d="M148 157 C263 144, 696 142, 813 158 C822 226, 816 308, 802 379 C650 391, 310 391, 158 379 C144 307, 139 226, 148 157Z" fill="none" stroke="${COLORS.flag}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.75" stroke-dasharray="2 13" />
  ${bannerStitches('top')}
  ${bannerStitches('bottom')}
  ${bannerStitches('left')}
  ${bannerStitches('right')}
  <path d="M150 166 C268 151, 690 151, 808 167 M160 374 C320 389, 637 389, 798 374" fill="none" stroke="${COLORS.surface}" stroke-width="2" stroke-linecap="round" opacity="0.35" />
  ${bannerFringes()}`,
);


const cornerMainPoints = sampleCubic([18, 114], [18, 72], [36, 36], [72, 18], 18).concat(
  sampleCubic([72, 18], [88, 10], [106, 12], [116, 24], 10, true),
);
const cornerGiltPoints = sampleCubic([35, 100], [42, 70], [66, 54], [94, 60], 13).concat(
  sampleCubic([94, 60], [76, 42], [84, 26], [112, 24], 11, true),
);
const cornerFlagLoopPoints = [
  ...sampleCubic([30, 75], [46, 86], [62, 73], [51, 58], 9),
  ...sampleCubic([51, 58], [40, 44], [24, 54], [30, 75], 9, true),
];
const cornerLowerPoints = sampleCubic([58, 107], [78, 88], [100, 86], [116, 100], 11);

const CORNER_SVG = fileteadoSvg(
  '0 0 132 132',
  `${pileGradientDefs('corner')}
  ${textureDefs('corner')}
  <path d="M17 115 C18 71, 36 35, 72 17 C89 9, 108 11, 118 24" fill="none" stroke="${COLORS.base}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="0.18" />
  ${pileTrail(cornerMainPoints, { radius: 6.55, tone: 'accent', id: 'corner' })}
  ${pileTrail(cornerGiltPoints, { radius: 5.05, tone: 'gilt', id: 'corner' })}
  ${pileTrail(cornerFlagLoopPoints, { radius: 4.65, tone: 'flag', id: 'corner' })}
  ${pileTrail(cornerLowerPoints, { radius: 4.65, tone: 'accent', id: 'corner' })}`,
);


const cardRuleMainPoints = [
  ...sampleCubic([12, 26], [50, 10], [84, 12], [104, 26], 13),
  ...sampleCubic([104, 26], [118, 34], [142, 34], [156, 26], 9, true),
  ...sampleCubic([156, 26], [176, 12], [210, 10], [248, 26], 13, true),
];

const cardRuleFlagPoints = sampleCubic([110, 24], [119, 15], [141, 15], [150, 24], 10);

const CARD_RULE_SVG = fileteadoSvg(
  '0 0 260 52',
  `${pileGradientDefs('card-rule')}
  ${pileTrail(cardRuleMainPoints, { radius: 5.25, tone: 'accent', id: 'card-rule' })}
  ${pileTrail(cardRuleFlagPoints, { radius: 4.35, tone: 'flag', id: 'card-rule' })}`,
  'xMidYMid meet',
);

export const FileteadoDivider: React.FC<FileteadoProps> = ({ className, label }) => (
  <FileteadoImg src={svgDataUri(DIVIDER_SVG)} className={cn('h-14 w-full', className)} label={label} />
);

export const FileteadoOrnament: React.FC<FileteadoProps> = ({ className, label }) => (
  <FileteadoImg src={svgDataUri(ORNAMENT_SVG)} className={cn('aspect-square w-full', className)} label={label} animate />
);

export const FileteadoBanner: React.FC<BannerProps> = ({ className, children }) => {
  const reduce = useReducedMotion();
  const label = typeof children === 'string' ? children.trim() : 'Lo que se hace a mano no se olvida';

  return (
    <motion.figure
      className={cn('relative mx-auto w-full max-w-[min(92vw,38rem)] overflow-hidden text-center [container-type:inline-size]', className)}
      aria-label={label}
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 110, damping: 18 }}
    >
      <img
        src={svgDataUri(BANNER_SVG)}
        alt=""
        aria-hidden="true"
        className="block w-full select-none"
        draggable={false}
        decoding="async"
      />
      <div className="absolute bottom-[26%] left-[12%] right-[12%] top-[22%] flex items-center justify-center px-[2%]">
        <p className="tuft-lettering max-w-[12.5em] text-balance text-center text-[clamp(1.25rem,7.2cqw,2.75rem)]">
          {children}
        </p>
      </div>
    </motion.figure>
  );
};

export const FileteadoCorner: React.FC<CornerProps> = ({ className, label, flip = 'none' }) => {
  const scale = flip === 'both' ? '-scale-x-100 -scale-y-100' : flip === 'x' ? '-scale-x-100' : flip === 'y' ? '-scale-y-100' : '';

  return <FileteadoImg src={svgDataUri(CORNER_SVG)} className={cn('h-24 w-24 origin-center', scale, className)} label={label} />;
};

export const FileteadoCardRule: React.FC<FileteadoProps> = ({ className, label }) => (
  <FileteadoImg src={svgDataUri(CARD_RULE_SVG)} className={cn('h-10 w-full', className)} label={label} />
);
