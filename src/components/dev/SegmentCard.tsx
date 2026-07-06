import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import type { Segment } from '../../data/business';

interface SegmentCardProps {
  segment: Segment;
  isOpen: boolean;
  /** Another card is open, so this one steps back. */
  isDimmed: boolean;
  onToggle: () => void;
}

// A rubro card. Collapsed it shows the icon, title and a one-line hook; the
// full pain and the demo link are always in the DOM but clipped until expanded,
// so the height animation runs only on click (never on scroll or mount).
export const SegmentCard: React.FC<SegmentCardProps> = ({ segment, isOpen, isDimmed, onToggle }) => {
  const reduce = useReducedMotion();
  const Icon = segment.icon;
  const panelId = `segment-panel-${segment.slug}`;

  return (
    <motion.div
      layout={reduce ? false : 'position'}
      transition={{ layout: { duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] } }}
      animate={{ opacity: isDimmed ? 0.75 : 1 }}
      className={`flex flex-col border bg-surface transition-colors ${
        isOpen ? 'border-accent' : 'border-line hover:border-accent/60'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group relative flex flex-col gap-3 p-5 pr-12 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span
          aria-hidden="true"
          className={`absolute right-4 top-5 text-accent transition-transform duration-300 ${
            isOpen ? 'rotate-45' : 'group-hover:rotate-90'
          }`}
        >
          <Plus className="h-5 w-5" />
        </span>
        <Icon
          className={`h-7 w-7 transition-colors ${isOpen ? 'text-accent' : 'text-accent/70 group-hover:text-accent'}`}
          aria-hidden="true"
        />
        <h3 className={`font-bold transition-colors ${isOpen ? 'text-accent' : 'text-white group-hover:text-accent'}`}>
          {segment.title}
        </h3>
        <p className="text-sm leading-relaxed text-primary/85">{segment.hook}</p>
      </button>

      <motion.div
        id={panelId}
        initial={false}
        animate={reduce ? undefined : { height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        style={reduce ? { height: isOpen ? 'auto' : 0 } : undefined}
        transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={!isOpen}
        className="overflow-hidden"
      >
        <div className="border-t border-line/60 px-5 pb-5 pt-4">
          <p className="text-sm leading-relaxed text-primary">{segment.pain}</p>
          <Link
            to={`/business/${segment.slug}`}
            tabIndex={isOpen ? 0 : -1}
            className="mt-4 inline-flex items-center gap-1.5 font-mono text-sm font-bold text-accent transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Ver cómo lo resuelvo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};
