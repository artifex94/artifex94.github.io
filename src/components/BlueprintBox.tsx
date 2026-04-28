import React, { useRef } from 'react';
import { cn } from '../utils/cn';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useVelocity,
} from 'framer-motion';

interface BlueprintBoxProps {
  children: React.ReactNode;
  /**
   * Applied to the outermost wrapper (perspective container).
   * Use for LAYOUT classes only: flex-grow, w-full, h-full, col-span-*, etc.
   * Do NOT put background or border classes here — they will show through
   * the gaps created when the card tilts in 3D.
   */
  className?: string;
  /**
   * Applied to the inner tilting card surface.
   * Use for VISUAL / APPEARANCE classes: bg-*, border-l-*, ring-*, etc.
   */
  innerClassName?: string;
  coords?: { x: number; y: number };
  delay?: number;
}

export const BlueprintBox: React.FC<BlueprintBoxProps> = ({
  children,
  className,
  innerClassName,
  coords = { x: 10, y: 20 },
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // ── 1. Pointer (mouse / touch) ─────────────────────────────────────────
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateXPointer = useTransform(mouseYSpring, [-0.5, 0.5], [5, -5]);
  const rotateYPointer = useTransform(mouseXSpring, [-0.5, 0.5], [-5, 5]);

  // ── 2. Scroll velocity ─────────────────────────────────────────────────
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const rotateXScroll = useTransform(smoothVelocity, [-1000, 0, 1000], [5, 0, -5]);

  // ── 3. Combined rotation (string + "deg") — drives the frame tilt ─────
  const rotateX = useTransform(
    [rotateXPointer, rotateXScroll],
    (values: number[]) => `${(values[0] ?? 0) + (values[1] ?? 0)}deg`
  );
  const rotateY = useTransform(rotateYPointer, (val) => `${val}deg`);

  // ── 4. Inverse rotation (numeric degrees) — keeps content flat ────────
  //
  // The frame tilts; the content counter-tilts by the exact same angle so
  // it always faces the camera. Interactive elements (links, buttons, cards)
  // are never seen at an angle and are comfortable to click and read.
  //
  // NO z-translation here — pushing content forward in Z creates a visible
  // gap between the card surface and the floating content layer, which makes
  // the outer wrapper's background show through when the card tilts.
  const contentRotateX = useTransform(
    [rotateXPointer, rotateXScroll],
    (values: number[]) => -((values[0] ?? 0) + (values[1] ?? 0))
  );
  const contentRotateY = useTransform(rotateYPointer, (val: number) => -val);

  // ── 5. Pointer events ──────────────────────────────────────────────────
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerReset = () => { x.set(0); y.set(0); };

  return (
    /*
     * Outer wrapper — perspective container only.
     * className is intentionally limited to LAYOUT classes (flex-grow, etc.).
     * Background/border classes belong on the inner card via innerClassName.
     */
    <motion.div
      style={{ perspective: 1200 }}
      initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={cn('relative', className)}
    >
      {/* ── Tilting card surface ── */}
      <motion.div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerReset}
        onPointerUp={handlePointerReset}
        onPointerCancel={handlePointerReset}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={cn(
          'relative w-full h-full border border-dashed border-line bg-base/80 backdrop-blur-sm p-6 sm:p-8 transition-colors hover:border-accent/40',
          innerClassName
        )}
      >
        {/* Decorative 3D corners — float above card surface, tilt with frame */}
        <div style={{ transform: 'translateZ(20px)' }} className="absolute -top-1.25 -left-1.25 text-accent text-xs opacity-80 leading-none">+</div>
        <div style={{ transform: 'translateZ(20px)' }} className="absolute -top-1.25 -right-1.25 text-accent text-xs opacity-80 leading-none">+</div>
        <div style={{ transform: 'translateZ(20px)' }} className="absolute -bottom-1.25 -left-1.25 text-accent text-xs opacity-80 leading-none">+</div>
        <div style={{ transform: 'translateZ(20px)' }} className="absolute -bottom-1.25 -right-1.25 text-accent text-xs opacity-80 leading-none">+</div>

        <div style={{ transform: 'translateZ(30px)' }} className="absolute -top-3 right-4 bg-base px-2 text-[10px] text-secondary border border-dashed border-line tracking-wider">
          [x:{coords.x.toString().padStart(2, '0')}, y:{coords.y.toString().padStart(2, '0')}]
        </div>

        {/*
         * Content layer — counter-rotated so it stays perpendicular to the camera.
         *
         * The rotateX/rotateY exactly negate the frame's tilt, making all
         * interactive elements (links, buttons, text) face the user flat.
         * No z-translation is applied: pushing the content forward in Z
         * would create a gap between the card surface and content, revealing
         * the outer wrapper behind the tilted frame.
         */}
        <motion.div
          style={{ rotateX: contentRotateX, rotateY: contentRotateY }}
          className="relative z-10"
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
