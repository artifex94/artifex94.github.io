import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '../utils/cn';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useVelocity,
  useInView,
  animate,
} from 'framer-motion';

// ── Personality constants ──────────────────────────────────────────────────
const SURPRISED_MULTIPLIER = 2.2;  // exaggerated tilt on first encounter
const CALM_MULTIPLIER      = 0.35; // subtle tilt once accustomed
const CALM_DELAY_MS        = 5000; // auto-calm after 5s in viewport
const CALM_HOVER_COUNT     = 3;    // or after 3 hover-leave cycles

function readCalm(key: string): boolean {
  try { return sessionStorage.getItem(key) === 'calm'; } catch { return false; }
}
function writeCalm(key: string): void {
  try { sessionStorage.setItem(key, 'calm'); } catch { /* ignore */ }
}

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

  // ── Personality state (session-persistent) ─────────────────────────────
  const sessionKey    = `bp-${coords.x}-${coords.y}`;
  const alreadyCalm   = readCalm(sessionKey);

  // Scales ALL rotations. Starts high (surprised), drops to calm after acclimation.
  const intensity  = useMotionValue(alreadyCalm ? CALM_MULTIPLIER : SURPRISED_MULTIPLIER);
  const isCalmRef  = useRef(alreadyCalm);
  const hoverCount = useRef(0);
  const calmTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goCalm = useCallback(() => {
    if (isCalmRef.current) return;
    isCalmRef.current = true;
    writeCalm(sessionKey);
    if (calmTimer.current) clearTimeout(calmTimer.current);
    // Slow, smooth transition so the change itself feels natural
    animate(intensity, CALM_MULTIPLIER, { duration: 1.8, ease: 'easeInOut' });
  }, [sessionKey, intensity]);

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
  const rotateXScroll  = useTransform(smoothVelocity, [-1000, 0, 1000], [5, 0, -5]);

  // ── 3. Combined rotation × intensity ──────────────────────────────────
  // Surprised phase (intensity ≈ 2.2): tilt up to ±11°, very reactive.
  // Calm phase (intensity ≈ 0.35): tilt ≤ ±2°, barely perceptible but alive.
  const rotateX = useTransform(
    [rotateXPointer, rotateXScroll, intensity],
    (v: number[]) => `${((v[0] ?? 0) + (v[1] ?? 0)) * (v[2] ?? 1)}deg`
  );
  const rotateY = useTransform(
    [rotateYPointer, intensity],
    (v: number[]) => `${(v[0] ?? 0) * (v[1] ?? 1)}deg`
  );

  // ── 4. Inverse rotation — content stays flat ───────────────────────────
  const contentRotateX = useTransform(
    [rotateXPointer, rotateXScroll, intensity],
    (v: number[]) => -((v[0] ?? 0) + (v[1] ?? 0)) * (v[2] ?? 1)
  );
  const contentRotateY = useTransform(
    [rotateYPointer, intensity],
    (v: number[]) => -(v[0] ?? 0) * (v[1] ?? 1)
  );

  // ── 5. Viewport entry: jolt + calm timer ──────────────────────────────
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  useEffect(() => {
    if (!isInView || isCalmRef.current) return;

    // "Surprised" jolt — element reacts to being seen for the first time.
    // Animate y (feeds mouseYSpring via spring physics → produces a natural wobble).
    (async () => {
      await animate(y, -0.38, { duration: 0.12, ease: 'easeOut' });
      await animate(y,  0.12, { duration: 0.10, ease: 'easeInOut' });
      await animate(y,  0,    { duration: 0.45, ease: 'easeOut' });
    })();

    calmTimer.current = setTimeout(goCalm, CALM_DELAY_MS);
    return () => { if (calmTimer.current) clearTimeout(calmTimer.current); };
  }, [isInView, goCalm, y]);

  // ── 6. Pointer handlers ────────────────────────────────────────────────
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerReset = () => { x.set(0); y.set(0); };

  // Each complete hover cycle (enter → leave) counts toward going calm.
  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
    if (isCalmRef.current) return;
    hoverCount.current += 1;
    if (hoverCount.current >= CALM_HOVER_COUNT) goCalm();
  };

  return (
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
        onPointerLeave={handlePointerLeave}
        onPointerUp={handlePointerReset}
        onPointerCancel={handlePointerReset}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={cn(
          'relative w-full h-full border border-dashed border-line bg-base/80 backdrop-blur-sm p-6 sm:p-8 transition-colors hover:border-accent/40',
          innerClassName
        )}
      >
        {/* Decorative 3D corners — float above card surface */}
        <div style={{ transform: 'translateZ(20px)' }} className="absolute -top-1.25 -left-1.25 text-accent text-xs opacity-80 leading-none">+</div>
        <div style={{ transform: 'translateZ(20px)' }} className="absolute -top-1.25 -right-1.25 text-accent text-xs opacity-80 leading-none">+</div>
        <div style={{ transform: 'translateZ(20px)' }} className="absolute -bottom-1.25 -left-1.25 text-accent text-xs opacity-80 leading-none">+</div>
        <div style={{ transform: 'translateZ(20px)' }} className="absolute -bottom-1.25 -right-1.25 text-accent text-xs opacity-80 leading-none">+</div>

        <div style={{ transform: 'translateZ(30px)' }} className="absolute -top-3 right-4 bg-base px-2 text-[10px] text-secondary border border-dashed border-line tracking-wider">
          [x:{coords.x.toString().padStart(2, '0')}, y:{coords.y.toString().padStart(2, '0')}]
        </div>

        {/* Content layer — counter-rotated to stay perpendicular to camera */}
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
