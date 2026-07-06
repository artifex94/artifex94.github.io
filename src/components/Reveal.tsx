import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../utils/cn';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Appearance delay in seconds. */
  delay?: number;
  /** Vertical travel in px before settling. */
  y?: number;
}

// Scroll-triggered entrance that honours prefers-reduced-motion: when the user
// asks for less motion it renders in its final state with no transition.
// Only opacity/transform are animated, so it never triggers layout on scroll.
export const Reveal: React.FC<RevealProps> = ({ children, className, delay = 0, y = 24 }) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};
