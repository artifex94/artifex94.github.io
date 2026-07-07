import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import type { Segment } from '../../data/business';

interface SegmentModalProps {
  segment: Segment | null;
  onClose: () => void;
}

// Mobile-only reveal: the rubro description shows as a centered card over a
// dimmed backdrop, so the grid behind never moves. Portal escapes the section's
// stacking/transform context. Same blueprint language as the Platzi dialog.
export const SegmentModal: React.FC<SegmentModalProps> = ({ segment, onClose }) => {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!segment) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [segment, onClose]);

  return createPortal(
    <AnimatePresence>
      {segment && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center px-4"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.15 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={segment.title}
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

          <motion.div
            className="relative z-10 w-full max-w-sm border border-dashed border-accent/50 bg-[#0d0d0d] p-6"
            initial={reduce ? false : { scale: 0.95, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { scale: 0.95, y: 8 }}
            transition={{ duration: reduce ? 0 : 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <span aria-hidden="true" className="absolute -left-px -top-px text-xs leading-none text-accent">+</span>
            <span aria-hidden="true" className="absolute -right-px -top-px text-xs leading-none text-accent">+</span>
            <span aria-hidden="true" className="absolute -bottom-px -left-px text-xs leading-none text-accent">+</span>
            <span aria-hidden="true" className="absolute -bottom-px -right-px text-xs leading-none text-accent">+</span>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-3 top-3 text-secondary transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-3 flex items-center gap-3 pr-8">
              <segment.icon className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
              <h3 className="font-bold text-accent">{segment.title}</h3>
            </div>

            <p className="text-sm leading-relaxed text-primary">{segment.pain}</p>

            <Link
              to={`/business/${segment.slug}`}
              className="mt-5 inline-flex items-center gap-1.5 font-mono text-sm font-bold text-accent transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ver cómo lo resuelvo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
