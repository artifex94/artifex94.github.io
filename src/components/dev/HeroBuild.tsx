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

  // Phase 4: the blueprint annotations (dimension lines, guides, block labels)
  // fade in last, so the piece reads as a plan under construction, not a mockup.
  const annotate: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: { duration: 0.5 * d, delay: (2.0 + i * 0.08) * d, ease: 'easeOut' },
    }),
  };

  const centered = { transformBox: 'fill-box' as const, transformOrigin: 'center' };
  const fromBottom = { transformBox: 'fill-box' as const, transformOrigin: '50% 100%' };

  return (
    <section className="grid gap-8 md:gap-12 lg:grid-cols-2 lg:items-center lg:gap-10">
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
            viewBox="0 0 480 360"
            role="img"
            aria-label="Un plano de sitio en construcción: primero el trazado, después se enciende con contenido y aparecen las cotas de medida."
            className="h-auto w-full"
            variants={{ hidden: {}, visible: {} }}
            initial={reduce ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            {/* Filled panels (painted behind the strokes) */}
            <g fill={SURFACE}>
              <motion.rect x="84" y="92" width="196" height="100" rx="6" variants={surface} custom={0} />
              <motion.rect x="296" y="92" width="104" height="100" rx="6" variants={surface} custom={1} />
              <motion.rect x="84" y="206" width="92" height="60" rx="6" variants={surface} custom={2} />
              <motion.rect x="196" y="206" width="92" height="60" rx="6" variants={surface} custom={3} />
              <motion.rect x="308" y="206" width="92" height="60" rx="6" variants={surface} custom={4} />
            </g>

            {/* Traced wireframe */}
            <g fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round">
              <motion.rect x="64" y="40" width="352" height="244" rx="10" variants={trace} custom={0} />
              <motion.line x1="64" y1="72" x2="416" y2="72" variants={trace} custom={1} />
              <motion.rect x="160" y="49" width="180" height="14" rx="7" stroke={LINE} variants={trace} custom={1} />
              <motion.rect x="84" y="92" width="196" height="100" rx="6" variants={trace} custom={2} />
              <motion.rect x="296" y="92" width="104" height="100" rx="6" variants={trace} custom={3} />
              <motion.rect x="84" y="206" width="92" height="60" rx="6" variants={trace} custom={4} />
              <motion.rect x="196" y="206" width="92" height="60" rx="6" variants={trace} custom={5} />
              <motion.rect x="308" y="206" width="92" height="60" rx="6" variants={trace} custom={6} />
            </g>

            {/* Corner crop marks — the piece is a cut sheet on the table */}
            <g fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round">
              <motion.path d="M64 54 L64 40 L78 40" variants={trace} custom={0} />
              <motion.path d="M402 40 L416 40 L416 54" variants={trace} custom={0} />
              <motion.path d="M64 270 L64 284 L78 284" variants={trace} custom={0} />
              <motion.path d="M402 284 L416 284 L416 270" variants={trace} custom={0} />
            </g>

            {/* Lit content: mostly grey wireframe bars, a single orange CTA */}
            <g>
              {/* window dots */}
              <motion.circle cx="80" cy="56" r="4.5" fill={MUTED} style={centered} variants={pop} custom={0} />
              <motion.circle cx="96" cy="56" r="4.5" fill={LINE} style={centered} variants={pop} custom={1} />
              <motion.circle cx="112" cy="56" r="4.5" fill={LINE} style={centered} variants={pop} custom={2} />

              {/* hero heading + copy + the one orange button */}
              <motion.rect x="100" y="112" width="150" height="11" rx="3" fill={MUTED} style={centered} variants={pop} custom={3} />
              <motion.rect x="100" y="131" width="118" height="7" rx="3" fill={LINE} style={centered} variants={pop} custom={4} />
              <motion.rect x="100" y="145" width="96" height="7" rx="3" fill={LINE} style={centered} variants={pop} custom={5} />
              <motion.rect x="100" y="162" width="92" height="22" rx="4" fill={ACCENT} style={centered} variants={pop} custom={7} />

              {/* side panel: avatar + bio lines (grey now) */}
              <motion.circle cx="348" cy="124" r="18" fill="var(--bg-base)" stroke={MUTED} strokeWidth="1.5" style={centered} variants={pop} custom={6} />
              <motion.rect x="312" y="156" width="80" height="7" rx="3" fill={LINE} style={centered} variants={pop} custom={8} />
              <motion.rect x="312" y="170" width="56" height="7" rx="3" fill={LINE} style={centered} variants={pop} custom={9} />

              {/* stat cards — grey labels + grey values */}
              <motion.rect x="96" y="220" width="48" height="6" rx="3" fill={LINE} style={centered} variants={pop} custom={9} />
              <motion.rect x="96" y="234" width="40" height="14" rx="3" fill={MUTED} style={centered} variants={pop} custom={10} />
              <motion.rect x="208" y="220" width="48" height="6" rx="3" fill={LINE} style={centered} variants={pop} custom={10} />
              <motion.rect x="208" y="234" width="52" height="14" rx="3" fill={MUTED} style={centered} variants={pop} custom={11} />
              <motion.rect x="320" y="220" width="48" height="6" rx="3" fill={LINE} style={centered} variants={pop} custom={11} />

              {/* mini chart growing in the third card — grey bars */}
              <motion.rect x="320" y="240" width="10" height="16" rx="2" fill={MUTED} style={{ ...fromBottom }} variants={grow} custom={0} />
              <motion.rect x="336" y="230" width="10" height="26" rx="2" fill={MUTED} style={{ ...fromBottom }} variants={grow} custom={1} />
              <motion.rect x="352" y="236" width="10" height="20" rx="2" fill={MUTED} style={{ ...fromBottom }} variants={grow} custom={2} />
              <motion.rect x="368" y="226" width="10" height="30" rx="2" fill={MUTED} style={{ ...fromBottom }} variants={grow} custom={3} />
            </g>

            {/* Phase 4: blueprint annotations — construction guides, cotas, labels.
                Hidden under 480px, where they crowd the plan into noise. */}
            <g className="hidden min-[480px]:block">
              {/* dashed construction guides that run past the sheet */}
              <g stroke={LINE} strokeWidth="1" strokeDasharray="3 4">
                <motion.line x1="84" y1="24" x2="84" y2="300" variants={annotate} custom={0} />
                <motion.line x1="296" y1="24" x2="296" y2="300" variants={annotate} custom={0} />
                <motion.line x1="40" y1="92" x2="452" y2="92" variants={annotate} custom={1} />
              </g>

              {/* horizontal dimension line: full width */}
              <g stroke={MUTED} strokeWidth="1" strokeLinecap="round">
                <motion.line x1="64" y1="284" x2="64" y2="316" strokeDasharray="3 4" variants={annotate} custom={2} />
                <motion.line x1="416" y1="284" x2="416" y2="316" strokeDasharray="3 4" variants={annotate} custom={2} />
                <motion.line x1="64" y1="310" x2="416" y2="310" variants={annotate} custom={3} />
                <motion.path d="M72 306 L64 310 L72 314" fill="none" variants={annotate} custom={3} />
                <motion.path d="M408 306 L416 310 L408 314" fill="none" variants={annotate} custom={3} />
              </g>
              <motion.text
                x="240" y="328" textAnchor="middle" fill={MUTED}
                style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
                variants={annotate} custom={4}
              >
                1440px
              </motion.text>

              {/* vertical dimension line: header height */}
              <g stroke={MUTED} strokeWidth="1" strokeLinecap="round">
                <motion.line x1="416" y1="40" x2="440" y2="40" strokeDasharray="3 4" variants={annotate} custom={2} />
                <motion.line x1="416" y1="72" x2="440" y2="72" strokeDasharray="3 4" variants={annotate} custom={2} />
                <motion.line x1="434" y1="40" x2="434" y2="72" variants={annotate} custom={3} />
                <motion.path d="M430 48 L434 40 L438 48" fill="none" variants={annotate} custom={3} />
                <motion.path d="M430 64 L434 72 L438 64" fill="none" variants={annotate} custom={3} />
              </g>
              <motion.text
                x="444" y="60" fill={MUTED}
                style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11 }}
                variants={annotate} custom={4}
              >
                64px
              </motion.text>

              {/* mono block labels in the left gutter */}
              <g fill={MUTED} textAnchor="end" style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10 }}>
                <motion.text x="56" y="60" variants={annotate} custom={5}>header</motion.text>
                <motion.text x="56" y="120" variants={annotate} custom={5}>hero</motion.text>
                <motion.text x="56" y="178" variants={annotate} custom={6}>cta</motion.text>
                <motion.text x="56" y="240" variants={annotate} custom={6}>stats</motion.text>
              </g>
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
