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

const draw = (reduce: boolean) => ({
  initial: reduce ? false : { pathLength: 0, opacity: 0 },
  whileInView: reduce ? { opacity: 1 } : { pathLength: 1, opacity: 1 },
  viewport: { once: true, margin: '-20px' },
  transition: reduce ? { duration: 0 } : { duration: 1.25, ease: 'easeOut' },
});

const springIn = (reduce: boolean, delay = 0) => ({
  initial: reduce ? false : { opacity: 0, scale: 0.96, y: 8 },
  whileInView: { opacity: 1, scale: 1, y: 0 },
  viewport: { once: true, margin: '-20px' },
  transition: reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 140, damping: 18, delay },
});

const yarnPathClass = 'drop-shadow-[0_2px_0_rgba(43,35,32,0.10)]';

const YarnStroke: React.FC<{
  d: string;
  className?: string;
  width?: number;
  delay?: number;
  gilt?: boolean;
  flag?: boolean;
}> = ({ d, className, width = 5, delay = 0, gilt, flag }) => {
  const reduce = useReducedMotion();
  const motionProps = draw(Boolean(reduce));
  const color = gilt ? 'var(--color-gilt)' : flag ? 'var(--color-flag)' : 'currentColor';

  return (
    <>
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width + 5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.16"
        {...motionProps}
        transition={reduce ? { duration: 0 } : { duration: 1.25, ease: 'easeOut', delay }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(yarnPathClass, className)}
        {...motionProps}
        transition={reduce ? { duration: 0 } : { duration: 1.25, ease: 'easeOut', delay }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="var(--color-surface)"
        strokeWidth={Math.max(1.1, width * 0.24)}
        strokeLinecap="round"
        strokeDasharray="1 7"
        opacity="0.78"
        {...motionProps}
        transition={reduce ? { duration: 0 } : { duration: 1.25, ease: 'easeOut', delay: delay + 0.05 }}
      />
    </>
  );
};

export const FileteadoDivider: React.FC<FileteadoProps> = ({ className, label }) => {
  const reduce = useReducedMotion();

  return (
    <svg
      viewBox="0 0 360 56"
      className={cn('h-12 w-full text-accent', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="xMidYMid meet"
    >
      <YarnStroke d="M18 30 C58 6, 88 48, 126 27 S198 8, 232 30 S300 46, 342 20" width={5} />
      <YarnStroke d="M92 31 C80 12, 54 15, 62 34 C68 49, 92 44, 92 31Z" width={3.2} gilt delay={0.12} />
      <YarnStroke d="M268 27 C280 45, 306 40, 298 22 C292 8, 268 13, 268 27Z" width={3.2} gilt delay={0.12} />
      <YarnStroke d="M144 28 C154 12, 174 12, 180 28 C174 44, 154 44, 144 28Z" width={3.5} flag delay={0.2} />
      <motion.circle
        cx="180"
        cy="28"
        r="4"
        fill="var(--color-gilt)"
        {...springIn(Boolean(reduce), 0.25)}
      />
    </svg>
  );
};

export const FileteadoOrnament: React.FC<FileteadoProps> = ({ className, label }) => {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 220 220"
      className={cn('aspect-square w-full text-accent', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...springIn(Boolean(reduce))}
    >
      <defs>
        <radialGradient id="fileteado-wool-glow" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="var(--color-surface)" stopOpacity="0.96" />
          <stop offset="72%" stopColor="var(--color-base)" stopOpacity="0.42" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.08" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="110" r="84" fill="url(#fileteado-wool-glow)" opacity="0.82" />
      <YarnStroke d="M110 46 C74 48, 58 78, 78 96 C98 112, 124 85, 96 72" width={4.8} />
      <YarnStroke d="M110 46 C146 48, 162 78, 142 96 C122 112, 96 85, 124 72" width={4.8} />
      <YarnStroke d="M72 124 C42 130, 42 172, 78 168 C110 164, 102 126, 74 140" width={4.8} flag delay={0.12} />
      <YarnStroke d="M148 124 C178 130, 178 172, 142 168 C110 164, 118 126, 146 140" width={4.8} flag delay={0.12} />
      <YarnStroke d="M62 110 C86 98, 96 108, 110 132 C124 108, 134 98, 158 110" width={4.2} gilt delay={0.2} />
      <motion.g {...springIn(Boolean(reduce), 0.2)}>
        <path d="M110 84 C126 96 132 116 110 137 C88 116 94 96 110 84Z" fill="var(--color-accent)" opacity="0.9" />
        <path d="M110 84 C122 102 121 119 110 137 C99 119 98 102 110 84Z" fill="var(--color-gilt)" opacity="0.42" />
        <circle cx="110" cy="112" r="8" fill="var(--color-gilt)" />
        <path d="M104 110 C108 105 113 105 117 110" fill="none" stroke="var(--color-surface)" strokeWidth="1.4" strokeLinecap="round" />
      </motion.g>
      <YarnStroke d="M87 184 C104 170, 116 170, 133 184" width={3.8} delay={0.28} />
    </motion.svg>
  );
};

export const FileteadoBanner: React.FC<BannerProps> = ({ className, label, children }) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn('relative mx-auto w-full max-w-xl text-center', className)}
      {...springIn(Boolean(reduce))}
      animate={reduce ? undefined : { y: [0, -2, 0] }}
      transition={reduce ? { duration: 0 } : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 520 128"
        className="w-full text-accent"
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        preserveAspectRatio="xMidYMid meet"
      >
        <path d="M48 48 L118 28 L118 92 L48 78 L76 63Z" fill="var(--color-flag)" opacity="0.18" />
        <path d="M472 48 L402 28 L402 92 L472 78 L444 63Z" fill="var(--color-flag)" opacity="0.18" />
        <path d="M102 34 C190 18 330 18 418 34 L398 96 C314 82 206 82 122 96Z" fill="var(--color-surface)" opacity="0.9" />
        <path d="M102 34 C190 18 330 18 418 34 L398 96 C314 82 206 82 122 96Z" fill="none" stroke="var(--color-gilt)" strokeWidth="3" strokeLinejoin="round" opacity="0.9" />
        <YarnStroke d="M72 62 C138 34, 212 42, 260 44 C308 42, 382 34, 448 62" width={4.2} />
        <YarnStroke d="M112 92 C176 74, 344 74, 408 92" width={3.3} flag delay={0.12} />
        <YarnStroke d="M64 50 C50 28, 82 18, 94 38" width={3.3} gilt delay={0.2} />
        <YarnStroke d="M456 50 C470 28, 438 18, 426 38" width={3.3} gilt delay={0.2} />
      </svg>
      <div className="pointer-events-none absolute inset-x-[20%] top-[39%] -translate-y-1/2 font-display text-[clamp(0.9rem,2.6vw,1.28rem)] font-semibold italic tracking-wide text-primary">
        {children}
      </div>
    </motion.div>
  );
};

export const FileteadoCorner: React.FC<CornerProps> = ({ className, label, flip = 'none' }) => {
  const scale = flip === 'both' ? '-scale-x-100 -scale-y-100' : flip === 'x' ? '-scale-x-100' : flip === 'y' ? '-scale-y-100' : '';

  return (
    <svg
      viewBox="0 0 120 120"
      className={cn('h-24 w-24 origin-center text-accent', scale, className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <YarnStroke d="M18 102 C18 54, 54 18, 102 18" width={4.8} />
      <YarnStroke d="M34 94 C42 72, 64 62, 86 68 C68 48, 78 30, 100 28" width={3.6} gilt delay={0.12} />
      <YarnStroke d="M24 70 C42 80, 54 66, 42 54 C30 42, 18 52, 24 70Z" width={3.2} flag delay={0.18} />
    </svg>
  );
};

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
