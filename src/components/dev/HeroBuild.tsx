import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl, buildMailto } from '../../data/contact';

const ACCENT = 'var(--accent-orange)';
const SURFACE = 'var(--bg-surface)';
const LINE = 'var(--border-line)';
const MUTED = 'var(--text-secondary)';

const ctaHref =
  buildWhatsAppUrl('desarrollo') ?? buildMailto('Consulta - Desarrollo Web y Sistemas a Medida');
const ctaIsWhatsApp = ctaHref.startsWith('https://wa.me/');

// The signature moment: a website wireframe traces itself onto the canvas and
// then "lights up" — panels fill, accent nodes pop in and a mini chart grows.
// Reduced motion renders the finished, lit state with no animation.
export const HeroBuild: React.FC = () => {
  const reduce = useReducedMotion();
  const d = reduce ? 0 : 1;

  const trace: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.6 * d, delay: (0.1 + i * 0.1) * d, ease: 'easeInOut' },
        opacity: { duration: 0.001, delay: (0.1 + i * 0.1) * d },
      },
    }),
  };

  const surface: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: { duration: 0.4 * d, delay: (1.15 + i * 0.06) * d, ease: 'easeOut' },
    }),
  };

  const pop: Variants = {
    hidden: { opacity: 0, scale: 0.4 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: (1.35 + i * 0.06) * d, type: 'spring', stiffness: 420, damping: 22 },
    }),
  };

  const grow: Variants = {
    hidden: { scaleY: 0 },
    visible: (i: number) => ({
      scaleY: 1,
      transition: { delay: (1.65 + i * 0.09) * d, type: 'spring', stiffness: 360, damping: 24 },
    }),
  };

  const centered = { transformBox: 'fill-box' as const, transformOrigin: 'center' };
  const fromBottom = { transformBox: 'fill-box' as const, transformOrigin: '50% 100%' };

  return (
    <section className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-10">
      {/* Copy column */}
      <div className="max-w-xl">
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 block font-mono text-sm font-bold uppercase tracking-widest text-accent"
        >
          // Sitios y sistemas a medida
        </motion.span>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
        >
          Construyo la máquina que{' '}
          <span className="text-accent">hace funcionar tu negocio.</span>
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-lg text-lg leading-relaxed text-secondary md:text-xl"
        >
          Desde una web simple hasta un sistema completo a medida. Vos me contás qué necesita tu
          negocio; yo lo diseño, lo construyo y te acompaño después.
        </motion.p>
        <motion.a
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          href={ctaHref}
          {...(ctaIsWhatsApp ? { target: '_blank', rel: 'noreferrer' } : {})}
          className="mt-9 inline-flex items-center gap-3 bg-accent px-9 py-4 text-lg font-bold text-on-accent transition-all duration-300 hover:opacity-90 hover:shadow-[0_0_24px_rgba(255,107,0,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {ctaIsWhatsApp && <MessageCircle size={20} />}
          Consultar por WhatsApp
        </motion.a>
      </div>

      {/* Blueprint canvas */}
      <div className="relative">
        <div className="border border-dashed border-line bg-base/60 p-4 backdrop-blur-sm sm:p-6">
          <motion.svg
            viewBox="0 0 440 320"
            role="img"
            aria-label="Una web se construye sola: primero el trazado, después se enciende con contenido."
            className="h-auto w-full"
            variants={{ hidden: {}, visible: {} }}
            initial={reduce ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            {/* Filled panels (painted behind the strokes) */}
            <g fill={SURFACE}>
              <motion.rect x="32" y="68" width="232" height="104" rx="6" variants={surface} custom={0} />
              <motion.rect x="284" y="68" width="124" height="104" rx="6" variants={surface} custom={1} />
              <motion.rect x="32" y="192" width="120" height="68" rx="6" variants={surface} custom={2} />
              <motion.rect x="160" y="192" width="120" height="68" rx="6" variants={surface} custom={3} />
              <motion.rect x="288" y="192" width="120" height="68" rx="6" variants={surface} custom={4} />
            </g>

            {/* Traced wireframe */}
            <g fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round">
              <motion.rect x="12" y="12" width="416" height="296" rx="12" variants={trace} custom={0} />
              <motion.line x1="12" y1="48" x2="428" y2="48" variants={trace} custom={1} />
              <motion.rect x="104" y="22" width="300" height="16" rx="8" stroke={LINE} variants={trace} custom={1} />
              <motion.rect x="32" y="68" width="232" height="104" rx="6" variants={trace} custom={2} />
              <motion.rect x="284" y="68" width="124" height="104" rx="6" variants={trace} custom={3} />
              <motion.rect x="32" y="192" width="120" height="68" rx="6" variants={trace} custom={4} />
              <motion.rect x="160" y="192" width="120" height="68" rx="6" variants={trace} custom={5} />
              <motion.rect x="288" y="192" width="120" height="68" rx="6" variants={trace} custom={6} />
            </g>

            {/* Lit content: nodes, headings, avatar, button */}
            <g>
              {/* window dots */}
              <motion.circle cx="28" cy="30" r="5" fill={ACCENT} style={centered} variants={pop} custom={0} />
              <motion.circle cx="46" cy="30" r="5" fill={LINE} style={centered} variants={pop} custom={1} />
              <motion.circle cx="64" cy="30" r="5" fill={LINE} style={centered} variants={pop} custom={2} />

              {/* hero heading + copy + button */}
              <motion.rect x="48" y="90" width="150" height="12" rx="3" fill={ACCENT} style={centered} variants={pop} custom={3} />
              <motion.rect x="48" y="112" width="118" height="7" rx="3" fill={MUTED} style={centered} variants={pop} custom={4} />
              <motion.rect x="48" y="126" width="96" height="7" rx="3" fill={MUTED} style={centered} variants={pop} custom={5} />
              <motion.rect x="48" y="144" width="92" height="22" rx="4" fill={ACCENT} style={centered} variants={pop} custom={7} />

              {/* side panel: avatar + bio lines */}
              <motion.circle cx="346" cy="104" r="20" fill="var(--bg-base)" stroke={ACCENT} strokeWidth="1.5" style={centered} variants={pop} custom={6} />
              <motion.rect x="300" y="138" width="92" height="7" rx="3" fill={MUTED} style={centered} variants={pop} custom={8} />
              <motion.rect x="300" y="152" width="66" height="7" rx="3" fill={MUTED} style={centered} variants={pop} custom={9} />

              {/* stat cards */}
              <motion.rect x="44" y="206" width="52" height="7" rx="3" fill={MUTED} style={centered} variants={pop} custom={9} />
              <motion.rect x="44" y="222" width="44" height="16" rx="3" fill={ACCENT} style={centered} variants={pop} custom={10} />
              <motion.rect x="172" y="206" width="52" height="7" rx="3" fill={MUTED} style={centered} variants={pop} custom={10} />
              <motion.rect x="172" y="222" width="56" height="16" rx="3" fill={ACCENT} style={centered} variants={pop} custom={11} />
              <motion.rect x="300" y="206" width="52" height="7" rx="3" fill={MUTED} style={centered} variants={pop} custom={11} />

              {/* mini chart growing in the third card */}
              <motion.rect x="300" y="234" width="12" height="18" rx="2" fill={ACCENT} style={{ ...fromBottom }} variants={grow} custom={0} />
              <motion.rect x="320" y="222" width="12" height="30" rx="2" fill={ACCENT} style={{ ...fromBottom }} variants={grow} custom={1} />
              <motion.rect x="340" y="230" width="12" height="22" rx="2" fill={ACCENT} style={{ ...fromBottom }} variants={grow} custom={2} />
              <motion.rect x="360" y="214" width="12" height="38" rx="2" fill={ACCENT} style={{ ...fromBottom }} variants={grow} custom={3} />
            </g>
          </motion.svg>
        </div>
        {/* blueprint corner marks */}
        <span className="pointer-events-none absolute -left-1 -top-1 text-accent">+</span>
        <span className="pointer-events-none absolute -right-1 -top-1 text-accent">+</span>
        <span className="pointer-events-none absolute -bottom-1 -left-1 text-accent">+</span>
        <span className="pointer-events-none absolute -bottom-1 -right-1 text-accent">+</span>
      </div>
    </section>
  );
};
