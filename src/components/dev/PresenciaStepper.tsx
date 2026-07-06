import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, MessageCircle } from 'lucide-react';
import { presenciaLevels } from '../../data/business';
import { buildWhatsAppUrl, buildMailto } from '../../data/contact';
import { AnimatedPrice } from './AnimatedPrice';

// "Presencia Digital": one card, three internal levels. A segmented control with
// a sliding pill switches level; price flips, pitch crossfades and the feature
// list reflows. The layout animation runs only on click.
export const PresenciaStepper: React.FC = () => {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const level = presenciaLevels[active];

  const waHref =
    buildWhatsAppUrl('desarrollo', level.id) ?? buildMailto(`Consulta - Plan ${level.label}`);
  const isWhatsApp = waHref.startsWith('https://wa.me/');

  return (
    <div className="flex h-full flex-col border border-line bg-surface p-6 sm:p-8">
      <div className="mb-1 font-mono text-xs uppercase tracking-widest text-accent">
        Presencia Digital
      </div>
      <p className="mb-6 text-sm text-primary/70">
        Tu negocio online, en el nivel que necesites hoy.
      </p>

      {/* Segmented control */}
      <div
        role="tablist"
        aria-label="Nivel de Presencia Digital"
        className="relative flex gap-1 rounded-sm border border-line bg-base p-1"
      >
        {presenciaLevels.map((lvl, i) => {
          const selected = i === active;
          return (
            <button
              key={lvl.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(i)}
              className="relative flex-1 rounded-sm px-2 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {selected && (
                <motion.span
                  layoutId="presencia-pill"
                  className="absolute inset-0 rounded-sm bg-accent"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 400, damping: 32 }
                  }
                />
              )}
              <span className={`relative z-10 ${selected ? 'text-on-accent' : 'text-secondary'}`}>
                {lvl.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-2">
        <AnimatedPrice
          value={level.price}
          className="text-4xl font-extrabold text-white"
        />
        <span className="text-sm text-secondary">ARS</span>
      </div>
      <p className="mt-1.5 font-mono text-xs text-primary/60">+ abono mensual opcional</p>

      {/* Pitch (crossfade) */}
      <div className="mt-3 min-h-[3.5rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={level.id}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            className="text-sm leading-relaxed text-secondary"
          >
            {level.pitch}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Features (reflow) */}
      <motion.ul layout={reduce ? false : 'position'} className="mt-6 flex flex-1 flex-col gap-3">
        <AnimatePresence initial={false} mode="popLayout">
          {level.features.map((feature) => (
            <motion.li
              key={feature}
              layout={reduce ? false : 'position'}
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: 8 }}
              transition={{ duration: reduce ? 0 : 0.22 }}
              className="flex items-start gap-2.5 text-sm text-primary"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{feature}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <a
        href={waHref}
        {...(isWhatsApp ? { target: '_blank', rel: 'noreferrer' } : {})}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-accent px-6 py-3.5 font-bold text-on-accent transition-all duration-300 hover:opacity-90 hover:shadow-[0_0_20px_rgba(255,107,0,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {isWhatsApp && <MessageCircle size={18} />}
        Quiero el plan {level.label}
      </a>
    </div>
  );
};
