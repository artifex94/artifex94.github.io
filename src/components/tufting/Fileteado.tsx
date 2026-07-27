import React, { createContext, useContext, useId } from 'react';
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

type TextureIds = {
  pile: string;
  halo: string;
  felt: string;
  feltGrain: string;
  tuftEdge: string;
  twist: string;
};

const TextureContext = createContext<TextureIds | null>(null);

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

const useTextureIds = (name: string): TextureIds => {
  const prefix = useId().replace(/:/g, '-');
  return {
    pile: `${prefix}-${name}-wool-pile`,
    halo: `${prefix}-${name}-wool-halo`,
    felt: `${prefix}-${name}-felt-body`,
    feltGrain: `${prefix}-${name}-felt-grain`,
    tuftEdge: `${prefix}-${name}-tuft-edge`,
    twist: `${prefix}-${name}-wool-twist`,
  };
};

const FileteadoTextureDefs: React.FC<{ ids: TextureIds }> = ({ ids }) => (
  <defs>
    <filter id={ids.pile} x="-20%" y="-30%" width="140%" height="160%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.78 1.18" numOctaves="4" seed="17" result="fiberNoise" />
      <feDisplacementMap in="SourceGraphic" in2="fiberNoise" scale="2.65" xChannelSelector="R" yChannelSelector="G" result="fuzzyCord" />
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.55" result="softPile" />
      <feOffset in="softPile" dx="1.2" dy="2" result="raisedShadow" />
      <feColorMatrix in="raisedShadow" type="matrix" values="0 0 0 0 0.17 0 0 0 0 0.12 0 0 0 0 0.09 0 0 0 0.28 0" result="pileShadow" />
      <feOffset in="SourceAlpha" dx="-0.8" dy="-0.8" result="topCatch" />
      <feColorMatrix in="topCatch" type="matrix" values="0 0 0 0 0.93 0 0 0 0 0.76 0 0 0 0 0.64 0 0 0 0.08 0" result="pileLight" />
      <feGaussianBlur in="fuzzyCord" stdDeviation="0.22" result="matteBloom" />
      <feMerge>
        <feMergeNode in="pileShadow" />
        <feMergeNode in="matteBloom" />
        <feMergeNode in="fuzzyCord" />
        <feMergeNode in="pileLight" />
      </feMerge>
    </filter>

    <filter id={ids.halo} x="-24%" y="-38%" width="148%" height="176%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="1.12 1.48" numOctaves="3" seed="41" result="hairNoise" />
      <feDisplacementMap in="SourceGraphic" in2="hairNoise" scale="3.5" result="woolHairs" />
      <feGaussianBlur in="woolHairs" stdDeviation="1.08" />
    </filter>

    <filter id={ids.twist} x="-8%" y="-18%" width="116%" height="136%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="1.9 2.8" numOctaves="2" seed="53" result="twistFiber" />
      <feDisplacementMap in="SourceGraphic" in2="twistFiber" scale="0.45" result="softTwist" />
      <feGaussianBlur in="softTwist" stdDeviation="0.42" />
    </filter>

    <filter id={ids.felt} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.82 1.24" numOctaves="5" seed="29" result="feltNoise" />
      <feDisplacementMap in="SourceGraphic" in2="feltNoise" scale="1.45" result="rumpledFelt" />
      <feComponentTransfer in="feltNoise" result="grainContrast">
        <feFuncA type="table" tableValues="0 0.18" />
      </feComponentTransfer>
      <feBlend in="rumpledFelt" in2="grainContrast" mode="multiply" result="feltWithGrain" />
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.7" result="feltLift" />
      <feOffset in="feltLift" dx="0" dy="1" result="feltShadow" />
      <feColorMatrix in="feltShadow" type="matrix" values="0 0 0 0 0.17 0 0 0 0 0.12 0 0 0 0 0.09 0 0 0 0.16 0" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="feltWithGrain" />
      </feMerge>
    </filter>

    <pattern id={ids.feltGrain} width="18" height="18" patternUnits="userSpaceOnUse">
      <rect width="18" height="18" fill="transparent" />
      <path d="M1 5 C5 3, 8 4, 11 2 M4 13 C8 11, 12 12, 16 9 M2 17 L7 15 M13 5 L17 3" stroke="var(--color-primary)" strokeWidth="0.55" strokeLinecap="round" opacity="0.08" />
      <path d="M2 9 L7 7 M10 15 L15 16 M12 1 L16 2" stroke="var(--color-surface)" strokeWidth="0.55" strokeLinecap="round" opacity="0.32" />
    </pattern>

    <pattern id={ids.tuftEdge} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
      <path d="M1 7 C2 3, 4 3, 5 7" fill="none" stroke="var(--color-surface)" strokeWidth="1.25" strokeLinecap="round" opacity="0.38" />
      <path d="M5 8 C6 4, 8 4, 9 8" fill="none" stroke="var(--color-primary)" strokeWidth="0.8" strokeLinecap="round" opacity="0.1" />
    </pattern>
  </defs>
);

type FeltShapeProps =
  | ({ as: 'circle' } & React.SVGProps<SVGCircleElement>)
  | ({ as?: 'path' } & React.SVGProps<SVGPathElement>);

const FeltShape: React.FC<FeltShapeProps> = ({ as = 'path', style, filter: explicitFilter, ...props }) => {
  const texture = useContext(TextureContext);
  const sharedProps = {
    filter: texture ? `url(#${texture.felt})` : explicitFilter,
    style: texture ? { ...style, mixBlendMode: 'multiply' as const } : style,
  };

  if (as === 'circle') {
    return <circle {...(props as React.SVGProps<SVGCircleElement>)} {...sharedProps} />;
  }

  return <path {...(props as React.SVGProps<SVGPathElement>)} {...sharedProps} />;
};

const YarnStroke: React.FC<{
  d: string;
  className?: string;
  width?: number;
  delay?: number;
  gilt?: boolean;
  flag?: boolean;
  shadow?: boolean;
  highlight?: 'surface' | 'gilt' | 'flag';
}> = ({ d, className, width = 7, delay = 0, gilt, flag, shadow = true }) => {
  const reduce = useReducedMotion();
  const texture = useContext(TextureContext);
  const color = gilt ? 'var(--color-gilt)' : flag ? 'var(--color-flag)' : 'currentColor';
  const highlightBase = gilt ? 'var(--color-gilt)' : flag ? 'var(--color-flag)' : 'currentColor';
  const highlightColor = `color-mix(in srgb, ${highlightBase} 76%, #f5d6c7)`;
  const groove = Math.max(1.75, width * 0.28);
  const twist = Math.max(0.95, width * 0.17);
  const dash = `${Math.max(1.05, width * 0.34)} ${Math.max(2.35, width * 0.54)}`;
  const filter = texture ? `url(#${texture.pile})` : undefined;
  const haloFilter = texture ? `url(#${texture.halo})` : undefined;
  const twistFilter = texture ? `url(#${texture.twist})` : undefined;

  return (
    <>
      {shadow ? (
        <motion.path
          d={d}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={width + 8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.2"
          filter={haloFilter}
          transform="translate(1.4 2.2)"
          {...draw(Boolean(reduce), delay)}
        />
      ) : null}
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width + 3.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        filter={haloFilter}
        {...draw(Boolean(reduce), delay)}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        filter={filter}
        {...draw(Boolean(reduce), delay)}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={groove}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash}
        strokeDashoffset={width * 0.9}
        opacity="0.1"
        filter={filter}
        {...draw(Boolean(reduce), delay + 0.03, 1.15)}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={highlightColor}
        strokeWidth={twist}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash}
        opacity="0.34"
        filter={twistFilter}
        {...draw(Boolean(reduce), delay + 0.05, 1.15)}
      />
    </>
  );
};

const TuftDot: React.FC<{ cx: number; cy: number; r?: number; fill?: string; delay?: number }> = ({ cx, cy, r = 4.5, fill = 'var(--color-gilt)', delay = 0 }) => {
  const reduce = useReducedMotion();
  const texture = useContext(TextureContext);

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      filter={texture ? `url(#${texture.pile})` : undefined}
      {...springIn(Boolean(reduce), delay)}
    />
  );
};

export const FileteadoDivider: React.FC<FileteadoProps> = ({ className, label }) => {
  const reduce = useReducedMotion();
  const texture = useTextureIds('divider');

  return (
    <TextureContext.Provider value={texture}>
      <svg
        viewBox="0 0 420 72"
        className={cn('h-14 w-full text-accent', className)}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        preserveAspectRatio="xMidYMid meet"
      >
        <FileteadoTextureDefs ids={texture} />
        <YarnStroke d="M24 38 C58 12, 96 14, 112 36 C126 56, 92 62, 88 42 C86 28, 104 24, 124 35 C156 54, 182 54, 210 36 C238 18, 264 18, 296 35 C316 24, 334 28, 332 42 C328 62, 294 56, 308 36 C324 14, 362 12, 396 38" width={7.4} />
        <YarnStroke d="M84 46 C72 34, 76 20, 94 18 C112 20, 112 40, 96 42" width={5.4} gilt delay={0.1} highlight="surface" />
        <YarnStroke d="M336 46 C348 34, 344 20, 326 18 C308 20, 308 40, 324 42" width={5.4} gilt delay={0.1} highlight="surface" />
        <YarnStroke d="M150 36 C166 18, 194 19, 210 36 C226 19, 254 18, 270 36" width={5.8} flag delay={0.18} highlight="gilt" />
        <TuftDot cx={210} cy={36} r={5.8} delay={0.24} />
        <motion.circle cx="210" cy="36" r="2" fill={`url(#${texture.tuftEdge})`} {...springIn(Boolean(reduce), 0.28)} />
      </svg>
    </TextureContext.Provider>
  );
};

export const FileteadoOrnament: React.FC<FileteadoProps> = ({ className, label }) => {
  const reduce = useReducedMotion();
  const gradientId = useId().replace(/:/g, '-');
  const texture = useTextureIds('ornament');

  return (
    <TextureContext.Provider value={texture}>
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
        <FileteadoTextureDefs ids={texture} />
        <FeltShape as="circle" cx="120" cy="120" r="88" fill={`url(#${gradientId}-wool-glow)`} opacity="0.86" />
        <circle cx="120" cy="120" r="84" fill={`url(#${texture.feltGrain})`} opacity="0.6" />
        <YarnStroke d="M120 38 C82 40, 58 66, 68 92 C76 114, 108 110, 104 88 C101 72, 78 76, 82 94" width={7.2} />
        <YarnStroke d="M120 38 C158 40, 182 66, 172 92 C164 114, 132 110, 136 88 C139 72, 162 76, 158 94" width={7.2} />
        <YarnStroke d="M66 132 C38 138, 38 178, 70 182 C104 186, 112 148, 88 142 C72 138, 62 152, 72 164" width={6.9} delay={0.08} />
        <YarnStroke d="M174 132 C202 138, 202 178, 170 182 C136 186, 128 148, 152 142 C168 138, 178 152, 168 164" width={6.9} delay={0.08} />
        <YarnStroke d="M54 116 C82 100, 102 110, 120 140 C138 110, 158 100, 186 116" width={6.2} gilt delay={0.16} highlight="surface" />
        <YarnStroke d="M82 118 C98 126, 109 136, 120 154 C131 136, 142 126, 158 118" width={4.8} flag delay={0.24} highlight="gilt" />
        <motion.g {...springIn(Boolean(reduce), 0.22)} filter={`url(#${texture.felt})`}>
          <path d="M120 82 C141 98 145 123 120 150 C95 123 99 98 120 82Z" fill="var(--color-accent)" opacity="0.92" />
          <path d="M120 87 C134 105 133 126 120 148 C107 126 106 105 120 87Z" fill="var(--color-gilt)" opacity="0.46" />
          <path d="M106 112 C113 106 127 106 134 112" fill="none" stroke="var(--color-surface)" strokeWidth="2.2" strokeLinecap="round" opacity="0.84" />
          <circle cx="120" cy="119" r="7.5" fill="var(--color-gilt)" />
          <circle cx="120" cy="119" r="2.5" fill="var(--color-surface)" opacity="0.9" />
        </motion.g>
        <YarnStroke d="M92 204 C108 188, 132 188, 148 204" width={6} delay={0.3} />
      </motion.svg>
    </TextureContext.Provider>
  );
};

export const FileteadoBanner: React.FC<BannerProps> = ({ className, children }) => {
  const reduce = useReducedMotion();
  const label = typeof children === 'string' ? children.trim() : undefined;
  const texture = useTextureIds('banner');

  return (
    <TextureContext.Provider value={texture}>
      <motion.div
        className={cn('relative mx-auto w-full max-w-[min(90vw,34rem)] overflow-hidden text-center', className)}
        role={label ? 'img' : undefined}
        aria-label={label}
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
          <svg viewBox="0 0 680 260" className="w-full text-accent" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <FileteadoTextureDefs ids={texture} />
            <FeltShape d="M78 104 L182 54 L170 206 L68 174 L104 136Z" fill="var(--color-accent)" opacity="0.2" />
            <FeltShape d="M602 104 L498 54 L510 206 L612 174 L576 136Z" fill="var(--color-accent)" opacity="0.2" />
            <FeltShape d="M108 112 C84 72, 136 34, 170 76 C140 84, 124 108, 116 140Z" fill="var(--color-base)" stroke="var(--color-accent)" strokeWidth="4.6" strokeLinejoin="round" />
            <FeltShape d="M572 112 C596 72, 544 34, 510 76 C540 84, 556 108, 564 140Z" fill="var(--color-base)" stroke="var(--color-accent)" strokeWidth="4.6" strokeLinejoin="round" />

            <FeltShape d="M150 76 C254 48, 426 48, 530 76 L510 206 C410 182, 270 182, 170 206Z" fill="var(--color-surface)" />
            <path d="M150 76 C254 48, 426 48, 530 76 L510 206 C410 182, 270 182, 170 206Z" fill={`url(#${texture.feltGrain})`} opacity="0.74" />
            <path d="M150 76 C254 48, 426 48, 530 76 L510 206 C410 182, 270 182, 170 206Z" fill="none" stroke="var(--color-primary)" strokeWidth="10" strokeLinejoin="round" opacity="0.08" filter={`url(#${texture.halo})`} />
            <YarnStroke d="M150 76 C254 48, 426 48, 530 76 L510 206 C410 182, 270 182, 170 206Z" width={5.8} shadow={false} />

            <YarnStroke d="M168 90 C230 76, 266 75, 294 78" width={4.8} gilt delay={0.02} />
            <YarnStroke d="M386 78 C414 75, 450 76, 512 90" width={4.8} gilt delay={0.02} />
            <YarnStroke d="M170 188 C232 174, 266 174, 294 178" width={4.6} flag delay={0.06} highlight="gilt" />
            <YarnStroke d="M386 178 C414 174, 448 174, 510 188" width={4.6} flag delay={0.06} highlight="gilt" />

            <YarnStroke d="M116 120 C154 92, 200 78, 294 84" width={6.2} delay={0.05} highlight="gilt" />
            <YarnStroke d="M386 84 C480 78, 526 92, 564 120" width={6.2} delay={0.05} highlight="gilt" />
            <YarnStroke d="M122 150 C166 186, 218 184, 294 176" width={5.9} delay={0.09} flag highlight="gilt" />
            <YarnStroke d="M386 176 C462 184, 514 186, 558 150" width={5.9} delay={0.09} flag highlight="gilt" />

            <YarnStroke d="M108 108 C84 68, 128 45, 152 72 C168 92, 144 118, 130 96" width={5.6} gilt delay={0.2} />
            <YarnStroke d="M572 108 C596 68, 552 45, 528 72 C512 92, 536 118, 550 96" width={5.6} gilt delay={0.2} />
            <YarnStroke d="M132 170 C116 204, 80 190, 88 150 C94 126, 118 132, 116 156" width={5.2} flag delay={0.28} highlight="gilt" />
            <YarnStroke d="M548 170 C564 204, 600 190, 592 150 C586 126, 562 132, 564 156" width={5.2} flag delay={0.28} highlight="gilt" />
          </svg>
        </motion.div>
        <div className="pointer-events-none absolute inset-x-[14%] top-1/2 z-10 -translate-y-1/2 sm:inset-x-[16%]">
          <span className="mx-auto flex min-h-[4.5rem] items-center justify-center rounded-[1.35rem] border border-gilt/60 bg-[color:var(--color-base)] px-5 py-4 font-display text-[clamp(1rem,3.25vw,1.38rem)] font-semibold leading-relaxed tracking-[0.01em] text-primary shadow-[inset_0_2px_10px_rgba(255,255,255,0.72),inset_0_-9px_18px_rgba(112,70,52,0.08)] sm:min-h-[4.15rem] sm:px-7 sm:py-4 sm:whitespace-nowrap">
            {children}
          </span>
        </div>
      </motion.div>
    </TextureContext.Provider>
  );
};

export const FileteadoCorner: React.FC<CornerProps> = ({ className, label, flip = 'none' }) => {
  const scale = flip === 'both' ? '-scale-x-100 -scale-y-100' : flip === 'x' ? '-scale-x-100' : flip === 'y' ? '-scale-y-100' : '';
  const texture = useTextureIds('corner');

  return (
    <TextureContext.Provider value={texture}>
      <svg
        viewBox="0 0 132 132"
        className={cn('h-24 w-24 origin-center text-accent', scale, className)}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        <FileteadoTextureDefs ids={texture} />
        <YarnStroke d="M18 114 C18 72, 36 36, 72 18 C88 10, 106 12, 116 24" width={7.2} />
        <YarnStroke d="M35 100 C42 70, 66 54, 94 60 C76 42, 84 26, 112 24" width={5.6} gilt delay={0.1} />
        <YarnStroke d="M30 75 C46 86, 62 73, 51 58 C40 44, 24 54, 30 75Z" width={5.3} flag delay={0.18} highlight="gilt" />
        <YarnStroke d="M58 107 C78 88, 100 86, 116 100" width={5.1} delay={0.25} />
      </svg>
    </TextureContext.Provider>
  );
};

export const FileteadoCardRule: React.FC<FileteadoProps> = ({ className, label }) => {
  const texture = useTextureIds('card-rule');

  return (
    <TextureContext.Provider value={texture}>
      <svg
        viewBox="0 0 260 42"
        className={cn('h-10 w-full text-accent', className)}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        preserveAspectRatio="none"
      >
        <FileteadoTextureDefs ids={texture} />
        <YarnStroke d="M12 24 C46 8, 78 10, 94 24 C106 34, 122 34, 130 22 C138 34, 154 34, 166 24 C182 10, 214 8, 248 24" width={5.8} />
        <YarnStroke d="M48 25 C39 15, 48 7, 60 11 C70 16, 66 29, 54 27" width={4.5} gilt delay={0.12} />
        <YarnStroke d="M212 25 C221 15, 212 7, 200 11 C190 16, 194 29, 206 27" width={4.5} gilt delay={0.12} />
        <YarnStroke d="M110 22 C119 14, 141 14, 150 22" width={4.2} flag delay={0.2} highlight="gilt" />
      </svg>
    </TextureContext.Provider>
  );
};

export const FileteadoHornero: React.FC<FileteadoProps> = ({ className, label }) => {
  const reduce = useReducedMotion();
  const texture = useTextureIds('hornero');

  return (
    <TextureContext.Provider value={texture}>
      <motion.svg
        viewBox="0 0 180 130"
        className={cn('w-full text-accent', className)}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        {...springIn(Boolean(reduce))}
      >
        <FileteadoTextureDefs ids={texture} />
        <FeltShape d="M52 78 C68 42, 123 38, 142 72 C126 100, 78 108, 52 78Z" fill="var(--color-accent)" opacity="0.18" />
        <YarnStroke d="M42 78 C62 42, 118 36, 144 72 C128 104, 76 108, 42 78Z" width={7.1} />
        <YarnStroke d="M86 66 C104 48, 126 54, 138 72" width={5.4} gilt delay={0.12} />
        <YarnStroke d="M42 78 C32 70, 24 56, 18 40" width={5.9} flag delay={0.18} />
        <path d="M144 70 L166 60 L151 80Z" fill="var(--color-gilt)" opacity="0.9" filter={`url(#${texture.felt})`} />
        <circle cx="132" cy="64" r="3.4" fill="var(--color-primary)" filter={`url(#${texture.pile})`} />
        <YarnStroke d="M72 102 C92 92, 112 92, 134 102" width={5.4} flag delay={0.24} />
      </motion.svg>
    </TextureContext.Provider>
  );
};
