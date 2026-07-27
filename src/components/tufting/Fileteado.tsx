import React, { useId } from 'react';
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

const draw = (reduce: boolean, delay = 0, duration = 1.35) => ({
  initial: reduce ? false : { pathLength: 0, opacity: 0 },
  whileInView: reduce ? { opacity: 1 } : { pathLength: 1, opacity: 1 },
  viewport: { once: true, margin: '-24px' },
  transition: reduce ? { duration: 0 } : { duration, ease: 'easeOut' as const, delay },
});

const springIn = (reduce: boolean, delay = 0) => ({
  initial: reduce ? false : { opacity: 0, scale: 0.97, y: 8 },
  whileInView: { opacity: 1, scale: 1, y: 0 },
  viewport: { once: true, margin: '-24px' },
  transition: reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 120, damping: 19, delay },
});

const yarnPathClass = 'drop-shadow-[0_2px_0_rgba(43,35,32,0.10)]';

const YarnStroke: React.FC<{
  d: string;
  className?: string;
  width?: number;
  delay?: number;
  gilt?: boolean;
  flag?: boolean;
  shadow?: boolean;
  highlight?: 'surface' | 'gilt' | 'flag';
}> = ({ d, className, width = 5, delay = 0, gilt, flag, shadow = true, highlight = 'surface' }) => {
  const reduce = useReducedMotion();
  const color = gilt ? 'var(--color-gilt)' : flag ? 'var(--color-flag)' : 'currentColor';
  const highlightColor =
    highlight === 'gilt' ? 'var(--color-gilt)' : highlight === 'flag' ? 'var(--color-flag)' : 'var(--color-surface)';

  return (
    <>
      {shadow ? (
        <motion.path
          d={d}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={width + 4.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.11"
          {...draw(Boolean(reduce), delay)}
        />
      ) : null}
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(yarnPathClass, className)}
        {...draw(Boolean(reduce), delay)}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={highlightColor}
        strokeWidth={Math.max(1.05, width * 0.22)}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 6"
        opacity="0.78"
        {...draw(Boolean(reduce), delay + 0.04, 1.15)}
      />
    </>
  );
};

export const FileteadoDivider: React.FC<FileteadoProps> = ({ className, label }) => {
  const reduce = useReducedMotion();

  return (
    <svg
      viewBox="0 0 420 72"
      className={cn('h-14 w-full text-accent', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="xMidYMid meet"
    >
      <YarnStroke d="M24 38 C58 12, 96 14, 112 36 C126 56, 92 62, 88 42 C86 28, 104 24, 124 35 C156 54, 182 54, 210 36 C238 18, 264 18, 296 35 C316 24, 334 28, 332 42 C328 62, 294 56, 308 36 C324 14, 362 12, 396 38" width={4.9} />
      <YarnStroke d="M84 46 C72 34, 76 20, 94 18 C112 20, 112 40, 96 42" width={2.8} gilt delay={0.1} highlight="surface" />
      <YarnStroke d="M336 46 C348 34, 344 20, 326 18 C308 20, 308 40, 324 42" width={2.8} gilt delay={0.1} highlight="surface" />
      <YarnStroke d="M150 36 C166 18, 194 19, 210 36 C226 19, 254 18, 270 36" width={3.2} flag delay={0.18} highlight="gilt" />
      <motion.circle cx="210" cy="36" r="4.5" fill="var(--color-gilt)" {...springIn(Boolean(reduce), 0.24)} />
      <motion.circle cx="210" cy="36" r="1.8" fill="var(--color-surface)" {...springIn(Boolean(reduce), 0.28)} />
    </svg>
  );
};

export const FileteadoOrnament: React.FC<FileteadoProps> = ({ className, label }) => {
  const reduce = useReducedMotion();
  const gradientId = useId().replace(/:/g, '-');

  return (
    <motion.svg
      viewBox="0 0 240 240"
      className={cn('aspect-square w-full text-accent', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...springIn(Boolean(reduce))}
    >
      <defs>
        <radialGradient id={`${gradientId}-wool-glow`} cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="var(--color-surface)" stopOpacity="0.98" />
          <stop offset="68%" stopColor="var(--color-base)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.08" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="88" fill={`url(#${gradientId}-wool-glow)`} opacity="0.86" />
      <YarnStroke d="M120 38 C82 40, 58 66, 68 92 C76 114, 108 110, 104 88 C101 72, 78 76, 82 94" width={4.8} />
      <YarnStroke d="M120 38 C158 40, 182 66, 172 92 C164 114, 132 110, 136 88 C139 72, 162 76, 158 94" width={4.8} />
      <YarnStroke d="M66 132 C38 138, 38 178, 70 182 C104 186, 112 148, 88 142 C72 138, 62 152, 72 164" width={4.6} delay={0.08} />
      <YarnStroke d="M174 132 C202 138, 202 178, 170 182 C136 186, 128 148, 152 142 C168 138, 178 152, 168 164" width={4.6} delay={0.08} />
      <YarnStroke d="M54 116 C82 100, 102 110, 120 140 C138 110, 158 100, 186 116" width={3.8} gilt delay={0.16} highlight="surface" />
      <YarnStroke d="M82 118 C98 126, 109 136, 120 154 C131 136, 142 126, 158 118" width={2.6} flag delay={0.24} highlight="gilt" />
      <motion.g {...springIn(Boolean(reduce), 0.22)}>
        <path d="M120 82 C141 98 145 123 120 150 C95 123 99 98 120 82Z" fill="var(--color-accent)" opacity="0.92" />
        <path d="M120 87 C134 105 133 126 120 148 C107 126 106 105 120 87Z" fill="var(--color-gilt)" opacity="0.46" />
        <path d="M106 112 C113 106 127 106 134 112" fill="none" stroke="var(--color-surface)" strokeWidth="1.6" strokeLinecap="round" opacity="0.84" />
        <circle cx="120" cy="119" r="7.5" fill="var(--color-gilt)" />
        <circle cx="120" cy="119" r="2.5" fill="var(--color-surface)" opacity="0.9" />
      </motion.g>
      <YarnStroke d="M92 204 C108 188, 132 188, 148 204" width={3.8} delay={0.3} />
    </motion.svg>
  );
};

export const FileteadoBanner: React.FC<BannerProps> = ({ className, children }) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn('relative mx-auto w-full max-w-2xl text-center', className)}
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 110, damping: 18 }}
    >
      <motion.div
        aria-hidden="true"
        animate={reduce ? undefined : { y: [0, -2, 0], rotate: [0, -0.18, 0.18, 0] }}
        transition={reduce ? { duration: 0 } : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 640 168" className="w-full text-accent" preserveAspectRatio="xMidYMid meet">
          <path d="M78 62 L170 34 L160 126 L70 106 L102 84Z" fill="var(--color-accent)" opacity="0.24" />
          <path d="M562 62 L470 34 L480 126 L570 106 L538 84Z" fill="var(--color-accent)" opacity="0.24" />
          <path d="M102 70 C82 44, 130 22, 160 50 C134 56, 120 68, 112 91Z" fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth="3" strokeLinejoin="round" />
          <path d="M538 70 C558 44, 510 22, 480 50 C506 56, 520 68, 528 91Z" fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth="3" strokeLinejoin="round" />
          <path d="M134 46 C236 24, 404 24, 506 46 L486 128 C392 111, 248 111, 154 128Z" fill="var(--color-surface)" />
          <path d="M134 46 C236 24, 404 24, 506 46 L486 128 C392 111, 248 111, 154 128Z" fill="none" stroke="var(--color-primary)" strokeWidth="9" strokeLinejoin="round" opacity="0.08" />
          <path d="M134 46 C236 24, 404 24, 506 46 L486 128 C392 111, 248 111, 154 128Z" fill="none" stroke="var(--color-accent)" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M148 58 C246 42, 394 42, 492 58" fill="none" stroke="var(--color-gilt)" strokeWidth="2.4" strokeLinecap="round" opacity="0.95" />
          <path d="M156 113 C250 98, 390 98, 484 113" fill="none" stroke="var(--color-flag)" strokeWidth="2" strokeLinecap="round" opacity="0.82" />
          <YarnStroke d="M112 84 C178 52, 250 56, 320 62 C390 56, 462 52, 528 84" width={4.1} delay={0.05} highlight="gilt" />
          <YarnStroke d="M102 69 C82 42, 122 28, 143 45 C158 58, 137 76, 124 64" width={3.1} gilt delay={0.2} />
          <YarnStroke d="M538 69 C558 42, 518 28, 497 45 C482 58, 503 76, 516 64" width={3.1} gilt delay={0.2} />
          <YarnStroke d="M126 105 C112 124, 78 118, 86 94 C92 78, 114 82, 112 96" width={2.6} flag delay={0.28} highlight="gilt" />
          <YarnStroke d="M514 105 C528 124, 562 118, 554 94 C548 78, 526 82, 528 96" width={2.6} flag delay={0.28} highlight="gilt" />
        </svg>
      </motion.div>
      <div className="pointer-events-none absolute inset-x-[15%] top-[51%] -translate-y-1/2 font-display text-[clamp(1rem,3.1vw,1.72rem)] font-semibold italic leading-tight tracking-[0.015em] text-accent [text-shadow:0_1px_0_rgba(255,255,255,0.9),0_2px_0_rgba(201,163,78,0.22)]">
        {children}
      </div>
    </motion.div>
  );
};

export const FileteadoCorner: React.FC<CornerProps> = ({ className, label, flip = 'none' }) => {
  const scale = flip === 'both' ? '-scale-x-100 -scale-y-100' : flip === 'x' ? '-scale-x-100' : flip === 'y' ? '-scale-y-100' : '';

  return (
    <svg
      viewBox="0 0 132 132"
      className={cn('h-24 w-24 origin-center text-accent', scale, className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <YarnStroke d="M18 114 C18 72, 36 36, 72 18 C88 10, 106 12, 116 24" width={4.6} />
      <YarnStroke d="M35 100 C42 70, 66 54, 94 60 C76 42, 84 26, 112 24" width={3.2} gilt delay={0.1} />
      <YarnStroke d="M30 75 C46 86, 62 73, 51 58 C40 44, 24 54, 30 75Z" width={3.1} flag delay={0.18} highlight="gilt" />
      <YarnStroke d="M58 107 C78 88, 100 86, 116 100" width={2.8} delay={0.25} />
    </svg>
  );
};

export const FileteadoCardRule: React.FC<FileteadoProps> = ({ className, label }) => (
  <svg
    viewBox="0 0 260 42"
    className={cn('h-10 w-full text-accent', className)}
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    preserveAspectRatio="none"
  >
    <YarnStroke d="M12 24 C46 8, 78 10, 94 24 C106 34, 122 34, 130 22 C138 34, 154 34, 166 24 C182 10, 214 8, 248 24" width={3.2} />
    <YarnStroke d="M48 25 C39 15, 48 7, 60 11 C70 16, 66 29, 54 27" width={2.2} gilt delay={0.12} />
    <YarnStroke d="M212 25 C221 15, 212 7, 200 11 C190 16, 194 29, 206 27" width={2.2} gilt delay={0.12} />
    <YarnStroke d="M110 22 C119 14, 141 14, 150 22" width={2} flag delay={0.2} highlight="gilt" />
  </svg>
);

export const FileteadoHornero: React.FC<FileteadoProps> = ({ className, label }) => {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 180 130"
      className={cn('w-full text-accent', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...springIn(Boolean(reduce))}
    >
      <path d="M52 78 C68 42, 123 38, 142 72 C126 100, 78 108, 52 78Z" fill="var(--color-accent)" opacity="0.18" />
      <YarnStroke d="M42 78 C62 42, 118 36, 144 72 C128 104, 76 108, 42 78Z" width={4.6} />
      <YarnStroke d="M86 66 C104 48, 126 54, 138 72" width={3.2} gilt delay={0.12} />
      <YarnStroke d="M42 78 C32 70, 24 56, 18 40" width={3.8} flag delay={0.18} />
      <path d="M144 70 L166 60 L151 80Z" fill="var(--color-gilt)" opacity="0.9" />
      <circle cx="132" cy="64" r="3" fill="var(--color-primary)" />
      <YarnStroke d="M72 102 C92 92, 112 92, 134 102" width={3.2} flag delay={0.24} />
    </motion.svg>
  );
};
