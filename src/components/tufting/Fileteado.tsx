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

const mirrorX = (points: Point[], axis = 120): Point[] => points.map(([x, y]) => [axis * 2 - x, y]);

const heartPileRows = (): Point[][] => [
  [[113, 91], [120, 88], [127, 91]],
  [[104, 99], [112, 98], [120, 101], [128, 98], [136, 99]],
  [[99, 108], [107, 109], [115, 110], [123, 110], [131, 109], [139, 108]],
  [[101, 118], [109, 120], [117, 121], [125, 121], [133, 120], [141, 118]],
  [[106, 128], [114, 130], [122, 131], [130, 130], [138, 128]],
  [[112, 138], [120, 142], [128, 138]],
];

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
    const wobble = Math.sin(index * 1.73 + radius) * radius * 0.1;
    const r = radius * (1 + Math.sin(index * 2.21 + 0.4) * 0.12);
    return { x, y, cx: x + nx * wobble, cy: y + ny * wobble, r, nx, ny, dx: dx / length, dy: dy / length, index };
  });

  const contact = settled
    .map(({ cx, cy, r, index }) => `<circle cx="${(cx + 1.2).toFixed(2)}" cy="${(cy + 1.9).toFixed(2)}" r="${(r * 0.92).toFixed(2)}" fill="${COLORS.primary}" opacity="${(0.095 + (index % 2) * 0.018).toFixed(3)}" />`)
    .join('');

  const halo = settled
    .map(({ cx, cy, r, index }) => `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(r * (1.18 + Math.sin(index * 1.91) * 0.05)).toFixed(2)}" fill="${COLORS.base}" opacity="0.16" />`)
    .join('');

  const fuzz = settled
    .filter((_, index) => index % 2 === 0)
    .map(({ cx, cy, r, nx, ny, dx, dy, index }) => {
      const side = index % 4 < 2 ? 1 : -1;
      const fringe = r * (1.03 + (index % 3) * 0.11);
      const tangent = ((index % 5) - 2) * r * 0.18;
      const fx = cx + nx * fringe * side + dx * tangent;
      const fy = cy + ny * fringe * side + dy * tangent;
      const rr = 0.62 + (index % 4) * 0.16;
      const color = index % 3 === 0 ? COLORS.surface : `url(#${id}-pile-${tone})`;
      const opacity = index % 3 === 0 ? 0.2 : 0.32 + (index % 2) * 0.06;
      return `<circle cx="${fx.toFixed(2)}" cy="${fy.toFixed(2)}" r="${rr.toFixed(2)}" fill="${color}" opacity="${opacity.toFixed(2)}" />`;
    })
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

      return `<g><circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="url(#${id}-pile-${tone})" />${fibers}</g>`;
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

  return `<g aria-hidden="true">${contact}</g><g aria-hidden="true">${halo}${fuzz}</g><g aria-hidden="true">${tuft}</g><g aria-hidden="true">${dents}</g>`;
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

const ornamentTopLeftPoints = [
  ...sampleCubic([120, 39], [82, 40], [58, 66], [68, 92], 15),
  ...sampleCubic([68, 92], [76, 114], [108, 110], [104, 88], 10, true),
  ...sampleCubic([104, 88], [101, 72], [78, 76], [82, 94], 9, true),
];

const ornamentLowerLeftPoints = [
  ...sampleCubic([66, 132], [38, 138], [38, 178], [70, 182], 15),
  ...sampleCubic([70, 182], [104, 186], [112, 148], [88, 142], 12, true),
  ...sampleCubic([88, 142], [72, 138], [62, 152], [72, 164], 8, true),
];

const ornamentGarlandPoints = sampleCubic([54, 116], [82, 100], [102, 110], [120, 140], 14).concat(
  sampleCubic([120, 140], [138, 110], [158, 100], [186, 116], 14, true),
);

const ornamentFlagPoints = sampleCubic([82, 118], [98, 126], [109, 136], [120, 154], 10).concat(
  sampleCubic([120, 154], [131, 136], [142, 126], [158, 118], 10, true),
);

const ornamentBottomPoints = sampleCubic([92, 204], [108, 188], [132, 188], [148, 204], 12);

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
  ${pileTrail(ornamentTopLeftPoints, { radius: 6.9, tone: 'accent', id: 'ornament' })}
  ${pileTrail(mirrorX(ornamentTopLeftPoints), { radius: 6.9, tone: 'accent', id: 'ornament' })}
  ${pileTrail(ornamentLowerLeftPoints, { radius: 6.5, tone: 'accent', id: 'ornament' })}
  ${pileTrail(mirrorX(ornamentLowerLeftPoints), { radius: 6.5, tone: 'accent', id: 'ornament' })}
  ${pileTrail(ornamentGarlandPoints, { radius: 5.65, tone: 'gilt', id: 'ornament' })}
  ${pileTrail(ornamentFlagPoints, { radius: 4.45, tone: 'flag', id: 'ornament' })}
  <g style="mix-blend-mode:multiply">
    ${heartPileRows().map((row) => pileTrail(row, { radius: 6.35, tone: 'accent', id: 'ornament', dentEvery: 1 })).join('')}
    ${pileTrail([[120, 119]], { radius: 5.1, tone: 'gilt', id: 'ornament' })}
    ${pileTrail([[109, 112], [116, 109], [124, 109], [131, 112]], { radius: 2.25, tone: 'gilt', id: 'ornament' })}
    ${pileTrail([[118, 122], [122, 122]], { radius: 1.75, tone: 'flag', id: 'ornament' })}
  </g>
  ${pileTrail(ornamentBottomPoints, { radius: 5.5, tone: 'accent', id: 'ornament' })}`,
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
    <pattern id="banner-letter-pile" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-11)">
      <path d="M1 7 C5 3, 9 10, 15 5 M0 14 C5 9, 10 16, 16 11" stroke="#fff6e6" stroke-width="1" stroke-linecap="round" opacity="0.22" />
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
  <g aria-hidden="true" font-family="Georgia, 'Times New Roman', serif" text-anchor="middle" font-weight="900" letter-spacing="0.5">
    <text x="484" y="242" font-size="70" fill="none" stroke="${COLORS.primary}" stroke-width="22" stroke-linejoin="round" opacity="0.23" transform="rotate(-0.7 484 242) translate(5 8)">Lo que se hace</text>
    <text x="480" y="240" font-size="70" fill="none" stroke="#7f473b" stroke-width="12" stroke-linejoin="round" transform="rotate(-0.7 480 240)">Lo que se hace</text>
    <text x="480" y="240" font-size="70" fill="${COLORS.primary}" stroke="url(#banner-letter-pile)" stroke-width="3" stroke-linejoin="round" transform="rotate(-0.7 480 240)">Lo que se hace</text>
    <text x="482" y="326" font-size="74" fill="none" stroke="${COLORS.primary}" stroke-width="23" stroke-linejoin="round" opacity="0.24" transform="rotate(0.55 482 326) translate(6 9)">a mano no se olvida</text>
    <text x="478" y="323" font-size="74" fill="none" stroke="#7f473b" stroke-width="13" stroke-linejoin="round" transform="rotate(0.55 478 323)">a mano no se olvida</text>
    <text x="478" y="323" font-size="74" fill="${COLORS.primary}" stroke="url(#banner-letter-pile)" stroke-width="3.2" stroke-linejoin="round" transform="rotate(0.55 478 323)">a mano no se olvida</text>
    <path d="M188 281 C262 267, 323 271, 370 285" fill="none" stroke="${COLORS.accentTwist}" stroke-width="7" stroke-linecap="round" opacity="0.88" />
    <path d="M590 284 C642 268, 706 268, 774 281" fill="none" stroke="${COLORS.accentTwist}" stroke-width="7" stroke-linecap="round" opacity="0.88" />
    <path d="M203 279 C265 271, 316 274, 356 284 M606 282 C654 273, 707 273, 760 281" fill="none" stroke="#fff1d6" stroke-width="1.4" stroke-linecap="round" opacity="0.36" />
  </g>
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
      className={cn('relative mx-auto w-full max-w-[min(92vw,38rem)] overflow-hidden text-center', className)}
      role="img"
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
      <figcaption className="sr-only">{label}</figcaption>
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
