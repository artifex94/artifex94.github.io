import React, { useEffect, useState } from 'react';
import { LayoutGroup } from 'framer-motion';
import { segments } from '../../data/business';
import { Reveal } from '../Reveal';
import { SegmentCard } from './SegmentCard';

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

  // Desktop: the open card moves to the front so its full-width panel always
  // sits first, and framer's layout animation slides the rest into place.
  // Mobile (single column): keep the original order so the card just expands
  // in place — no jarring jump to the top of the list.
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
            const isOpen = openSlug === segment.slug;
            return (
              <SegmentCard
                key={segment.slug}
                segment={segment}
                isOpen={isOpen}
                isDimmed={openSlug !== null && !isOpen}
                onToggle={() => setOpenSlug(isOpen ? null : segment.slug)}
              />
            );
          })}
        </div>
      </LayoutGroup>
    </section>
  );
};
