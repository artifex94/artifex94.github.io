import React, { useState } from 'react';
import { LayoutGroup } from 'framer-motion';
import { segments } from '../../data/business';
import { Reveal } from '../Reveal';
import { SegmentCard } from './SegmentCard';

// "¿Con qué trabajás?" — the six rubros from the old site, each fused with a
// link to its live demo. Only one card expands at a time; the rest dim.
export const SegmentGrid: React.FC = () => {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

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
          {segments.map((segment) => {
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
