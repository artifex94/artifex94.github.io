import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { segments, type Segment } from '../../data/business';
import { Reveal } from '../Reveal';
import { SegmentCard } from './SegmentCard';

// Tracks how many columns the grid renders (1 / 2 / 3), matching the Tailwind
// breakpoints, so we can tell which row a card sits in. Guards keep it inert in
// jsdom (tests) and during the prerender's first paint.
const useColumns = (): number => {
  const [cols, setCols] = useState(1);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const lg = window.matchMedia('(min-width: 1024px)');
    const sm = window.matchMedia('(min-width: 640px)');
    const update = () => setCols(lg.matches ? 3 : sm.matches ? 2 : 1);
    update();
    lg.addEventListener('change', update);
    sm.addEventListener('change', update);
    return () => {
      lg.removeEventListener('change', update);
      sm.removeEventListener('change', update);
    };
  }, []);
  return cols;
};

// The detail strip: full-width panel with the pain + demo link, and a pointer
// that slides to sit under the active card's column.
const SegmentDetail: React.FC<{ segment: Segment; cols: number; colIndex: number }> = ({
  segment,
  cols,
  colIndex,
}) => {
  const Icon = segment.icon;
  return (
    <div id="segment-detail" role="region" className="relative mt-1 border border-accent/60 bg-surface p-5 md:p-6">
      {/* Pointer to the active card — slides horizontally on same-row switches. */}
      <span
        aria-hidden="true"
        className="absolute -top-[7px] -ml-1.5 hidden h-3 w-3 rotate-45 border-l border-t border-accent/60 bg-surface transition-[left] duration-300 ease-out sm:block"
        style={{ left: `${((colIndex + 0.5) / cols) * 100}%` }}
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
        <div className="flex items-center gap-3 md:w-1/4 md:shrink-0">
          <Icon className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
          <h3 className="font-bold text-accent">{segment.title}</h3>
        </div>
        <div className="md:flex-1">
          <p className="text-sm leading-relaxed text-primary">{segment.pain}</p>
          <Link
            to={`/business/${segment.slug}`}
            className="mt-4 inline-flex items-center gap-1.5 font-mono text-sm font-bold text-accent transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Ver cómo lo resuelvo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// "¿Con qué trabajás?" — the six rubros, each fused with a link to its live
// demo. Cards stay fixed in their cells; clicking one opens a full-width strip
// below that card's ROW, so nothing reflows sideways — only the rows beneath it
// shift down. Coherent, predictable movement instead of the whole grid jumping.
export const SegmentGrid: React.FC = () => {
  const reduce = useReducedMotion();
  const cols = useColumns();
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  // Close on Escape (focus stays on the card button, which was never moved).
  useEffect(() => {
    if (!openSlug) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenSlug(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openSlug]);

  const openIndex = openSlug ? segments.findIndex((s) => s.slug === openSlug) : -1;
  const openSegment = openIndex >= 0 ? segments[openIndex] : null;
  // Index of the last card in the open card's row: the strip goes right after it.
  const detailAfterIndex =
    openIndex >= 0 ? Math.min(segments.length - 1, (Math.floor(openIndex / cols) + 1) * cols - 1) : -1;

  return (
    <section>
      <Reveal className="mb-8 text-center md:mb-10">
        <h2 className="text-3xl font-bold text-white">¿Con qué trabajás?</h2>
        <p className="mt-3 text-primary/80">
          Elegí tu rubro y mirá cómo se ve resuelto. Cada uno tiene su demo navegable.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((segment, i) => {
          const isActive = openSlug === segment.slug;
          return (
            <React.Fragment key={segment.slug}>
              <SegmentCard
                segment={segment}
                isActive={isActive}
                onToggle={() => setOpenSlug(isActive ? null : segment.slug)}
              />
              <AnimatePresence initial={false}>
                {openSegment && detailAfterIndex === i && (
                  <motion.div
                    key="segment-detail"
                    className="col-span-full overflow-hidden"
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <SegmentDetail segment={openSegment} cols={cols} colIndex={openIndex % cols} />
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};
