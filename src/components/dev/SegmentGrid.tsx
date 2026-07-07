import React, { useEffect, useState } from 'react';
import { LayoutGroup } from 'framer-motion';
import { segments } from '../../data/business';
import { Reveal } from '../Reveal';
import { SegmentCard } from './SegmentCard';
import { SegmentModal } from './SegmentModal';

// True below the sm breakpoint (single-column grid). Guarded for jsdom/tests
// and the prerender's first paint (defaults to desktop, which is inert since
// nothing is open until the user interacts).
const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isMobile;
};

// "¿Con qué trabajás?" — the six rubros from the old site, each fused with a
// link to its live demo. One card expands at a time; the rest dim.
export const SegmentGrid: React.FC = () => {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const openSegment = openSlug ? segments.find((s) => s.slug === openSlug) ?? null : null;

  // Desktop: the open card moves to the front and expands inline, framer's
  // layout animation slides the rest into place. Mobile keeps the original
  // order and never expands inline — the description shows in a centered modal
  // (SegmentModal) so the grid never moves.
  const ordered =
    openSlug && !isMobile
      ? [
          ...segments.filter((s) => s.slug === openSlug),
          ...segments.filter((s) => s.slug !== openSlug),
        ]
      : segments;

  return (
    <section>
      <Reveal className="mb-8 text-center md:mb-10">
        <h2 className="text-3xl font-bold text-white">¿Con qué trabajás?</h2>
        <p className="mt-3 text-primary/80">
          Elegí tu rubro y mirá cómo se ve resuelto. Cada uno tiene su demo navegable.
        </p>
      </Reveal>

      <LayoutGroup>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((segment) => {
            const isActive = openSlug === segment.slug;
            return (
              <SegmentCard
                key={segment.slug}
                segment={segment}
                // On mobile the card never expands inline — the modal handles it.
                isOpen={!isMobile && isActive}
                isDimmed={!isMobile && openSlug !== null && !isActive}
                asDialog={isMobile}
                onToggle={() => setOpenSlug(isActive ? null : segment.slug)}
              />
            );
          })}
        </div>
      </LayoutGroup>

      {/* Mobile: description as a centered modal, grid frozen behind. */}
      <SegmentModal segment={isMobile ? openSegment : null} onClose={() => setOpenSlug(null)} />
    </section>
  );
};
