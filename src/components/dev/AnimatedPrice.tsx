import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface AnimatedPriceProps {
  /** The current price string, e.g. "$400.000". Always rendered as real text. */
  value: string;
  className?: string;
}

// Flip animation keyed on the value: the outgoing price slides up while the new
// one slides in (popLayout keeps the incoming value in flow). The active value
// is a real text node, so the component stays assertable in tests.
export const AnimatedPrice: React.FC<AnimatedPriceProps> = ({ value, className }) => {
  const reduce = useReducedMotion();

  return (
    <span className={`inline-flex overflow-hidden ${className ?? ''}`}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={reduce ? false : { y: '-70%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: '70%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
