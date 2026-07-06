import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useReducedMotion, type MotionValue } from 'framer-motion';
import { procesoSteps, type ProcessStep } from '../../data/business';
import { Reveal } from '../Reveal';

const THRESHOLDS = [0.04, 0.37, 0.67, 0.96];

interface StepNodeProps {
  step: ProcessStep;
  index: number;
  progress: MotionValue<number>;
  threshold: number;
  reduce: boolean;
}

// One timeline step. Its lit state is derived from the shared scroll progress
// via useTransform — no state is set on scroll, which keeps it test-safe.
const StepNode: React.FC<StepNodeProps> = ({ step, index, progress, threshold, reduce }) => {
  const fill = useTransform(progress, [threshold - 0.04, threshold + 0.02], [0, 1]);
  const dim = useTransform(progress, [threshold - 0.06, threshold], [0.7, 1]);
  const Icon = step.icon;

  return (
    <motion.div
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
        <p className="max-w-xs text-sm leading-relaxed text-primary/70">{step.desc}</p>
      </div>
    </motion.div>
  );
};

// "Cómo trabajamos": a timeline whose connecting line draws itself as the
// section scrolls into view (vertical on mobile, horizontal on desktop).
export const ProcesoTimeline: React.FC = () => {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 75%', 'end 55%'],
  });
  const lineProgress = useSpring(scrollYProgress, { stiffness: 70, damping: 22, restDelta: 0.001 });

  return (
    <section>
      <Reveal className="mb-10 text-center md:mb-12">
        <h2 className="text-3xl font-bold text-white">Cómo trabajamos</h2>
        <p className="mt-3 text-primary/70">Cuatro pasos claros, sin vueltas.</p>
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
              threshold={THRESHOLDS[i]}
              reduce={reduce}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
