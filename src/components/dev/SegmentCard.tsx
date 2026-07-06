import React, { useRef } from 'react';
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

// A rubro card. Collapsed it lives in its grid cell; expanded it takes over the
// whole row (col-span-full) and its siblings reflow underneath. The pain + demo
// link, always in the DOM (clipped when collapsed, so links stay crawlable and
// test-visible), lay out horizontally beside the header on desktop. framer's
// layout drives the box morph; the grid reordering IS the structural argument.
export const SegmentCard: React.FC<SegmentCardProps> = ({ segment, isOpen, isDimmed, onToggle }) => {
  const reduce = useReducedMotion();
  const Icon = segment.icon;
  const panelId = `segment-panel-${segment.slug}`;
  const btnRef = useRef<HTMLButtonElement>(null);

  // Escape collapses the open card and returns focus to its toggle.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onToggle();
      btnRef.current?.focus();
    }
  };

  return (
    <motion.div
      layout={reduce ? false : true}
      transition={{ layout: { duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] } }}
      animate={{ opacity: isDimmed ? 0.85 : 1 }}
      onKeyDown={handleKeyDown}
      className={`flex overflow-hidden border bg-surface transition-[border-color,box-shadow] duration-300 ${
        isOpen
          ? 'col-span-full flex-col border-accent md:flex-row md:items-stretch'
          : 'flex-col border-line hover:border-accent hover:shadow-[0_0_20px_rgba(255,107,0,0.2)]'
      }`}
    >
      <motion.button
        ref={btnRef}
        layout={reduce ? false : 'position'}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`group relative flex min-h-[44px] w-full flex-col gap-3 p-5 pr-12 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          isOpen ? 'md:w-[38%] md:shrink-0 md:justify-center md:border-r md:border-line/60' : ''
        }`}
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
      </motion.button>

      <motion.div
        id={panelId}
        layout={reduce ? false : 'position'}
        aria-hidden={!isOpen}
        className={`overflow-hidden transition-opacity duration-300 ${
          isOpen
            ? 'border-t border-line/60 p-5 opacity-100 md:flex-1 md:border-t-0'
            : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-sm leading-relaxed text-primary">{segment.pain}</p>
        <Link
          to={`/business/${segment.slug}`}
          tabIndex={isOpen ? 0 : -1}
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-sm font-bold text-accent transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Ver cómo lo resuelvo
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </motion.div>
    </motion.div>
  );
};
