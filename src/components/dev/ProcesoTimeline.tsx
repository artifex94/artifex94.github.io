import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform, useReducedMotion, type MotionValue } from 'framer-motion';
import { procesoSteps, type ProcessStep } from '../../data/business';
import { Reveal } from '../Reveal';

const THRESHOLDS = [0.04, 0.37, 0.67, 0.96];
// Radius of the h-12 (48px) circle: offsetTop + this lands on its vertical center.
const NODE_CENTER_OFFSET = 24;

interface StepNodeProps {
  step: ProcessStep;
  index: number;
  progress: MotionValue<number>;
  threshold: number;
  reduce: boolean;
  nodeRef: (el: HTMLDivElement | null) => void;
}

// One timeline step. Its lit state is derived from the shared scroll progress
// via useTransform — no state is set on scroll, which keeps it test-safe.
const StepNode: React.FC<StepNodeProps> = ({ step, index, progress, threshold, reduce, nodeRef }) => {
  const fill = useTransform(progress, [threshold - 0.04, threshold + 0.02], [0, 1]);
  const dim = useTransform(progress, [threshold - 0.06, threshold], [0.7, 1]);
  const Icon = step.icon;

  return (
    <motion.div
      ref={nodeRef}
      style={reduce ? undefined : { opacity: dim }}
      className="flex items-start gap-4 md:flex-col md:items-center md:gap-3 md:text-center"
    >
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-base">
        <motion.span
          aria-hidden="true"
          style={reduce ? undefined : { opacity: fill }}
          className="absolute inset-0 rounded-full bg-accent/15"
        />
        <span className="relative z-10 font-mono text-sm font-bold text-accent">
          0{index + 1}
        </span>
      </div>
      <div className="pt-1 md:pt-0">
        <div className="mb-1.5 flex items-center gap-2 md:justify-center">
          <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
          <h3 className="font-bold text-white">{step.title}</h3>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-primary/80">{step.desc}</p>
      </div>
    </motion.div>
  );
};

// "Cómo trabajamos": a timeline whose connecting line draws itself as the
// section scrolls into view (vertical on mobile, horizontal on desktop).
export const ProcesoTimeline: React.FC = () => {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const nodeEls = useRef<Array<HTMLDivElement | null>>([]);
  const [thresholds, setThresholds] = useState<number[]>(THRESHOLDS);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 75%', 'end 55%'],
  });
  // Overdamped (no overshoot): the tip settles fast and doesn't lag behind
  // quick touch flings on mobile.
  const lineProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 });

  useLayoutEffect(() => {
    // On mobile the 4 steps stack with variable heights, so the fixed
    // fractions in THRESHOLDS drift from the line's real geometry. Desktop
    // keeps the uniform grid (horizontal line), so fixed thresholds are
    // exactly right there — only mobile needs measuring.
    const measure = () => {
      // jsdom (tests) has no matchMedia: bail out, THRESHOLDS stays as-is.
      if (typeof window.matchMedia !== 'function') return;

      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      if (isDesktop) {
        setThresholds(THRESHOLDS);
        return;
      }

      const nodes = nodeEls.current;
      if (nodes.length === 0 || nodes.some((n) => n === null)) return;

      const centers = nodes.map((n) => n!.offsetTop + NODE_CENTER_OFFSET);
      const first = centers[0];
      const last = centers[centers.length - 1];
      const span = last - first;
      if (!Number.isFinite(span) || span <= 0) return;

      const next = centers.map((c) => 0.04 + ((c - first) / span) * 0.92);
      if (next.some((v) => !Number.isFinite(v))) return;

      setThresholds(next);
    };

    measure();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    for (const node of nodeEls.current) {
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section>
      <Reveal className="mb-10 text-center md:mb-12">
        <h2 className="text-3xl font-bold text-white">Cómo trabajamos</h2>
        <p className="mt-3 text-primary/80">Cuatro pasos claros, sin vueltas.</p>
      </Reveal>

      <div ref={ref} className="relative">
        {/* Horizontal line (desktop) */}
        <svg
          className="absolute left-[12.5%] top-6 hidden h-[2px] w-3/4 md:block"
          viewBox="0 0 100 1"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="var(--accent-orange)" strokeOpacity="0.25" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <motion.line
            x1="0" y1="0.5" x2="100" y2="0.5"
            stroke="var(--accent-orange)" strokeWidth="2.5" vectorEffect="non-scaling-stroke"
            initial={reduce ? undefined : { pathLength: 0 }}
            style={reduce ? undefined : { pathLength: lineProgress }}
          />
        </svg>

        {/* Vertical line (mobile) */}
        <svg
          className="absolute bottom-6 left-6 top-6 w-[2px] md:hidden"
          viewBox="0 0 1 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1="0.5" y1="0" x2="0.5" y2="100" stroke="var(--accent-orange)" strokeOpacity="0.25" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <motion.line
            x1="0.5" y1="0" x2="0.5" y2="100"
            stroke="var(--accent-orange)" strokeWidth="2.5" vectorEffect="non-scaling-stroke"
            initial={reduce ? undefined : { pathLength: 0 }}
            style={reduce ? undefined : { pathLength: lineProgress }}
          />
        </svg>

        <div className="relative grid gap-8 md:grid-cols-4">
          {procesoSteps.map((step, i) => (
            <StepNode
              key={step.title}
              step={step}
              index={i}
              progress={lineProgress}
              threshold={thresholds[i]}
              reduce={reduce}
              nodeRef={(el) => {
                nodeEls.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
