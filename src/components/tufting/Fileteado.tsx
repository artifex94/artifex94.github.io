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

const yarnStroke = (
  d: string,
  { width = 7, color = COLORS.accent, twist = COLORS.accentTwist, shadow = true }: { width?: number; color?: string; twist?: string; shadow?: boolean } = {},
) => {
  const haloWidth = (width + 4.2).toFixed(2);
  const grooveWidth = Math.max(1.05, width * 0.2).toFixed(2);
  const twistWidth = Math.max(0.95, width * 0.16).toFixed(2);
  const hairWidth = Math.max(0.55, width * 0.08).toFixed(2);
  const dash = `${Math.max(1.05, width * 0.32).toFixed(2)} ${Math.max(2.35, width * 0.52).toFixed(2)}`;
  const fineDash = `${Math.max(0.85, width * 0.22).toFixed(2)} ${Math.max(3.1, width * 0.72).toFixed(2)}`;

  return `${shadow ? `<path d="${d}" fill="none" stroke="${COLORS.primary}" stroke-width="${width + 8}" stroke-linecap="round" stroke-linejoin="round" opacity="0.18" transform="translate(1.4 2.4)" />
    <path d="${d}" fill="none" stroke="${COLORS.primary}" stroke-width="${width + 2.4}" stroke-linecap="round" stroke-linejoin="round" opacity="0.1" transform="translate(0.4 0.8)" />` : ''}
    <path d="${d}" fill="none" stroke="${COLORS.surface}" stroke-width="${haloWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="0.16" />
    <path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" />
    <path d="${d}" fill="none" stroke="${COLORS.primary}" stroke-width="${grooveWidth}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${dash}" opacity="0.12" stroke-dashoffset="${(width * 0.18).toFixed(2)}" />
    <path d="${d}" fill="none" stroke="${twist}" stroke-width="${twistWidth}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${dash}" opacity="0.5" />
    <path d="${d}" fill="none" stroke="${COLORS.surface}" stroke-width="${hairWidth}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${fineDash}" opacity="0.32" stroke-dashoffset="${(width * 0.45).toFixed(2)}" />`;
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

const DIVIDER_SVG = fileteadoSvg(
  '0 0 420 72',
  `${textureDefs('divider')}
  ${yarnStroke('M24 38 C58 12, 96 14, 112 36 C126 56, 92 62, 88 42 C86 28, 104 24, 124 35 C156 54, 182 54, 210 36 C238 18, 264 18, 296 35 C316 24, 334 28, 332 42 C328 62, 294 56, 308 36 C324 14, 362 12, 396 38', { width: 7.4 })}
  ${yarnStroke('M84 46 C72 34, 76 20, 94 18 C112 20, 112 40, 96 42', { width: 5.4, color: COLORS.gilt, twist: COLORS.giltTwist })}
  ${yarnStroke('M336 46 C348 34, 344 20, 326 18 C308 20, 308 40, 324 42', { width: 5.4, color: COLORS.gilt, twist: COLORS.giltTwist })}
  ${yarnStroke('M150 36 C166 18, 194 19, 210 36 C226 19, 254 18, 270 36', { width: 5.8, color: COLORS.flag, twist: COLORS.flagTwist })}
  <circle cx="210" cy="36" r="5.8" fill="${COLORS.gilt}" />
  <circle cx="210" cy="36" r="2" fill="url(#divider-tuft-edge)" />`,
);

const ORNAMENT_SVG = fileteadoSvg(
  '0 0 240 240',
  `<defs>
    <radialGradient id="ornament-wool-glow" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="${COLORS.surface}" stop-opacity="0.98" />
      <stop offset="68%" stop-color="${COLORS.base}" stop-opacity="0.5" />
      <stop offset="100%" stop-color="${COLORS.accent}" stop-opacity="0.08" />
    </radialGradient>
  </defs>
  ${textureDefs('ornament')}
  <circle cx="120" cy="120" r="88" fill="url(#ornament-wool-glow)" opacity="0.86" style="mix-blend-mode:multiply" />
  <circle cx="120" cy="120" r="84" fill="url(#ornament-felt-grain)" opacity="0.6" />
  ${yarnStroke('M120 38 C82 40, 58 66, 68 92 C76 114, 108 110, 104 88 C101 72, 78 76, 82 94', { width: 7.2 })}
  ${yarnStroke('M120 38 C158 40, 182 66, 172 92 C164 114, 132 110, 136 88 C139 72, 162 76, 158 94', { width: 7.2 })}
  ${yarnStroke('M66 132 C38 138, 38 178, 70 182 C104 186, 112 148, 88 142 C72 138, 62 152, 72 164', { width: 6.9 })}
  ${yarnStroke('M174 132 C202 138, 202 178, 170 182 C136 186, 128 148, 152 142 C168 138, 178 152, 168 164', { width: 6.9 })}
  ${yarnStroke('M54 116 C82 100, 102 110, 120 140 C138 110, 158 100, 186 116', { width: 6.2, color: COLORS.gilt, twist: COLORS.giltTwist })}
  ${yarnStroke('M82 118 C98 126, 109 136, 120 154 C131 136, 142 126, 158 118', { width: 4.8, color: COLORS.flag, twist: COLORS.flagTwist })}
  <g style="mix-blend-mode:multiply">
    <path d="M120 82 C141 98 145 123 120 150 C95 123 99 98 120 82Z" fill="${COLORS.accent}" opacity="0.92" />
    <path d="M120 87 C134 105 133 126 120 148 C107 126 106 105 120 87Z" fill="${COLORS.gilt}" opacity="0.46" />
    <path d="M106 112 C113 106 127 106 134 112" fill="none" stroke="${COLORS.surface}" stroke-width="2.2" stroke-linecap="round" opacity="0.84" />
    <circle cx="120" cy="119" r="7.5" fill="${COLORS.gilt}" />
    <circle cx="120" cy="119" r="2.5" fill="${COLORS.surface}" opacity="0.9" />
  </g>
  ${yarnStroke('M92 204 C108 188, 132 188, 148 204', { width: 6 })}`,
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
    const length = 54 + (index % 5) * 7;
    const sway = index % 2 === 0 ? -5 : 5;
    const color = index % 4 === 0 ? COLORS.accentTwist : index % 4 === 1 ? COLORS.flagTwist : COLORS.giltTwist;
    return `<path d="M${x} 421 C${x + sway} 445, ${x - sway * 0.7} ${450 + length * 0.32}, ${x + sway * 0.45} ${421 + length}" stroke="${color}" stroke-width="6.2" stroke-linecap="round" opacity="0.82" />
      <path d="M${x + 2} 421 C${x + sway + 3} 444, ${x - sway * 0.5} ${452 + length * 0.28}, ${x + sway * 0.55 + 2} ${418 + length}" stroke="${COLORS.surface}" stroke-width="1.1" stroke-linecap="round" opacity="0.28" />`;
  }).join('');

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
  <path d="M138 146 C254 132, 704 130, 824 148 C835 221, 828 320, 812 392 C654 405, 306 405, 148 392 C132 315, 128 219, 138 146Z" fill="none" stroke="#8b4d3f" stroke-width="9" stroke-linejoin="round" opacity="0.55" />
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


const CORNER_SVG = fileteadoSvg(
  '0 0 132 132',
  `${textureDefs('corner')}
  ${yarnStroke('M18 114 C18 72, 36 36, 72 18 C88 10, 106 12, 116 24', { width: 7.2 })}
  ${yarnStroke('M35 100 C42 70, 66 54, 94 60 C76 42, 84 26, 112 24', { width: 5.6, color: COLORS.gilt, twist: COLORS.giltTwist })}
  ${yarnStroke('M30 75 C46 86, 62 73, 51 58 C40 44, 24 54, 30 75Z', { width: 5.3, color: COLORS.flag, twist: COLORS.flagTwist })}
  ${yarnStroke('M58 107 C78 88, 100 86, 116 100', { width: 5.1 })}`,
);

const CARD_RULE_SVG = fileteadoSvg(
  '0 0 260 42',
  `${textureDefs('card-rule')}
  ${yarnStroke('M12 24 C50 9, 84 11, 104 24 C118 32, 142 32, 156 24 C176 11, 210 9, 248 24', { width: 5.4 })}
  ${yarnStroke('M110 22 C119 14, 141 14, 150 22', { width: 4.1, color: COLORS.flag, twist: COLORS.flagTwist })}`,
  'none',
);

const HORNERO_SVG = fileteadoSvg(
  '0 0 180 130',
  `${textureDefs('hornero')}
  <path d="M52 78 C68 42, 123 38, 142 72 C126 100, 78 108, 52 78Z" fill="${COLORS.accent}" opacity="0.18" style="mix-blend-mode:multiply" />
  ${yarnStroke('M42 78 C62 42, 118 36, 144 72 C128 104, 76 108, 42 78Z', { width: 7.1 })}
  ${yarnStroke('M86 66 C104 48, 126 54, 138 72', { width: 5.4, color: COLORS.gilt, twist: COLORS.giltTwist })}
  ${yarnStroke('M42 78 C32 70, 24 56, 18 40', { width: 5.9, color: COLORS.flag, twist: COLORS.flagTwist })}
  <path d="M144 70 L166 60 L151 80Z" fill="${COLORS.gilt}" opacity="0.9" />
  <circle cx="132" cy="64" r="3.4" fill="${COLORS.primary}" />
  ${yarnStroke('M72 102 C92 92, 112 92, 134 102', { width: 5.4, color: COLORS.flag, twist: COLORS.flagTwist })}`,
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

export const FileteadoHornero: React.FC<FileteadoProps> = ({ className, label }) => (
  <FileteadoImg src={svgDataUri(HORNERO_SVG)} className={cn('w-full', className)} label={label} animate />
);
