import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';
import fleurDeLisTufting from '../../assets/flor-de-lis-tufting.webp';
import sectionDivider from '../../assets/tufting/section-divider.webp';
import cornerFlourish from '../../assets/tufting/corner-flourish.webp';
import cardRule from '../../assets/tufting/card-rule.webp';
import quoteTapestry from '../../assets/tufting/quote-tapestry.webp';

type FileteadoProps = {
  className?: string;
  label?: string;
};

type HorizontalOrnamentProps = FileteadoProps & {
  /** `fade` renders the complete bitmap without the SVG drawing mask. */
  reveal?: 'draw' | 'fade';
};

type BannerProps = FileteadoProps & {
  children?: React.ReactNode;
};

type CornerProps = FileteadoProps & {
  flip?: 'none' | 'x' | 'y' | 'both';
};

const softRevealIn = (reduce: boolean, delay = 0) => ({
  initial: reduce ? false : { opacity: 0, scale: 0.97, y: 8 },
  whileInView: { opacity: 1, scale: 1, y: 0 },
  viewport: { once: true, margin: '-24px' },
  transition: reduce ? { duration: 0 } : { duration: 1.8, ease: 'easeOut' as const, delay },
});

const FileteadoImg: React.FC<FileteadoProps & { src: string; animate?: boolean }> = ({ className, label, src, animate = false }) => {
  const reduce = useReducedMotion();
  const accessibility = label ? { alt: label } : { alt: '', 'aria-hidden': true as const };

  if (animate) {
    return <motion.img src={src} className={className} draggable={false} decoding="async" {...accessibility} {...softRevealIn(Boolean(reduce))} />;
  }

  return <img src={src} className={className} draggable={false} decoding="async" {...accessibility} />;
};

const CompleteOrnamentImg: React.FC<FileteadoProps & { src: string }> = ({ className, label, src }) => {
  const reduce = useReducedMotion();
  const accessibility = label ? { alt: label } : { alt: '', 'aria-hidden': true as const };

  return (
    <motion.img
      src={src}
      data-ornament-render="complete"
      className={cn('block h-auto object-contain', className)}
      draggable={false}
      decoding="async"
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={reduce ? { duration: 0 } : { duration: 2.4, ease: 'linear' }}
      {...accessibility}
    />
  );
};

// De los fileteados SVG originales sobreviven SOLO los trazos centrales: se usan
// como máscara animada (pathLength 0→1) para que cada asset tufteado se revele
// siguiendo el recorrido de la lana, como cuando el fileteado se dibujaba solo.
// El ancho de cada trazo es generoso a propósito: con el remate redondeado tiene
// que cubrir el arte completo al terminar la animación.
interface RevealStroke {
  d: string;
  width: number;
  delay?: number;
}

interface TuftRevealOptions {
  /** Difuminado (px del viewBox) del borde de la máscara: la punta que avanza
      se ve difusa, como lana creándose. */
  blur?: number;
}

export const TuftReveal: React.FC<FileteadoProps & TuftRevealOptions & { src: string; viewBox: string; strokes: RevealStroke[] }> = ({
  className,
  label,
  src,
  viewBox,
  strokes,
  blur,
}) => {
  const reduce = useReducedMotion();
  const rawId = useId();
  const maskId = `tuft-reveal-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
  const accessibility = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };

  if (reduce) {
    return <img src={src} className={className} alt={label ?? ''} draggable={false} decoding="async" />;
  }

  return (
    <motion.svg
      viewBox={viewBox}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-24px' }}
      {...accessibility}
    >
      <defs>
        {blur !== undefined && (
          <filter id={`${maskId}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        )}
        <mask id={maskId} maskUnits="userSpaceOnUse">
          {strokes.map((stroke, index) => (
            <motion.path
              key={index}
              d={stroke.d}
              fill="none"
              stroke="#fff"
              strokeWidth={stroke.width}
              strokeLinecap="round"
              filter={blur !== undefined ? `url(#${maskId}-blur)` : undefined}
              variants={{
                hidden: { pathLength: 0 },
                visible: {
                  pathLength: 1,
                  transition: { duration: 2.4, delay: stroke.delay ?? 0, ease: 'linear' },
                },
              }}
            />
          ))}
        </mask>
      </defs>
      <image href={src} width={vbWidth} height={vbHeight} mask={`url(#${maskId})`} preserveAspectRatio="xMidYMid meet" />
    </motion.svg>
  );
};

const DIVIDER_VIEWBOX = '0 0 420 88';
// La guía de máscara se parte en el centro (210,39): ambas mitades se dibujan a
// la vez y avanzan siempre hacia afuera. Los recorridos son deliberadamente
// monotónicos para que ninguna voluta produzca una pausa antes del remate.
const DIVIDER_STROKES: RevealStroke[] = [
  {
    d: 'M210 39 C184 54, 153 55, 124 39 C91 21, 56 25, 24 44',
    width: 98,
  },
  {
    d: 'M210 39 C236 24, 267 23, 296 39 C329 57, 364 53, 396 44',
    width: 98,
  },
];

const CARD_RULE_VIEWBOX = '0 0 260 52';
// Igual que el divisor: partido en el centro (130,32) para crecer hacia afuera.
const CARD_RULE_STROKES: RevealStroke[] = [
  { d: 'M130 32 C120.5 32, 111 30, 104 26 C84 12, 50 10, 12 26', width: 58 },
  { d: 'M130 32 C139.5 32, 149 30, 156 26 C176 12, 210 10, 248 26', width: 58 },
];

const CORNER_VIEWBOX = '0 0 132 132';
const CORNER_STROKES: RevealStroke[] = [
  { d: 'M17 115 C18 71, 36 35, 72 17 C89 9, 108 11, 118 24', width: 76 },
  { d: 'M35 100 C42 70, 66 54, 94 60 C76 42, 84 26, 112 24', width: 54, delay: 0.45 },
];

export const FileteadoDivider: React.FC<HorizontalOrnamentProps> = ({ className, label, reveal = 'draw' }) =>
  reveal === 'fade' ? (
    <CompleteOrnamentImg src={sectionDivider} className={cn('w-full', className)} label={label} />
  ) : (
    <TuftReveal
      src={sectionDivider}
      viewBox={DIVIDER_VIEWBOX}
      strokes={DIVIDER_STROKES}
      blur={3.5}
      className={cn('h-14 w-full', className)}
      label={label}
    />
  );

export const FileteadoOrnament: React.FC<FileteadoProps> = ({ className, label }) => (
  <FileteadoImg src={fleurDeLisTufting} className={cn('w-full', className)} label={label} animate />
);

// Tapiz tufteado como contenedor: los children se renderizan tal cual dentro del
// campo crema (semántica y estilos los pone quien lo usa — puede llevar un h1).
export const FileteadoBanner: React.FC<BannerProps> = ({ className, children }) => {
  const reduce = useReducedMotion();

  return (
    <motion.figure
      className={cn('relative mx-auto w-full max-w-[min(92vw,38rem)] overflow-hidden text-center [container-type:inline-size]', className)}
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 110, damping: 18 }}
    >
      <img
        src={quoteTapestry}
        alt=""
        aria-hidden="true"
        className="block w-full select-none"
        draggable={false}
        decoding="async"
      />
      <div className="absolute bottom-[23%] left-[13.5%] right-[13.5%] top-[20.5%] flex flex-col items-center justify-center px-[1.5%]">
        {children}
      </div>
    </motion.figure>
  );
};

export const FileteadoCorner: React.FC<CornerProps> = ({ className, label, flip = 'none' }) => {
  const scale = flip === 'both' ? '-scale-x-100 -scale-y-100' : flip === 'x' ? '-scale-x-100' : flip === 'y' ? '-scale-y-100' : '';

  return (
    <TuftReveal
      src={cornerFlourish}
      viewBox={CORNER_VIEWBOX}
      strokes={CORNER_STROKES}
      className={cn('h-24 w-24 origin-center', scale, className)}
      label={label}
    />
  );
};

export const FileteadoCardRule: React.FC<HorizontalOrnamentProps> = ({ className, label, reveal = 'draw' }) =>
  reveal === 'fade' ? (
    <CompleteOrnamentImg src={cardRule} className={cn('w-full', className)} label={label} />
  ) : (
    <TuftReveal
      src={cardRule}
      viewBox={CARD_RULE_VIEWBOX}
      strokes={CARD_RULE_STROKES}
      blur={2.5}
      className={cn('h-10 w-full', className)}
      label={label}
    />
  );
