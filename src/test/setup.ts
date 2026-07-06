import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('framer-motion', async () => {
  const { createElement, forwardRef, Fragment } = await import('react');

  const STRIP_PROPS = new Set([
    'initial', 'animate', 'exit', 'whileInView', 'whileHover', 'whileTap',
    'whileFocus', 'whileDrag', 'viewport', 'transition', 'variants',
    'onAnimationComplete', 'onAnimationStart', 'layout', 'layoutId', 'drag',
    'dragConstraints', 'dragElastic', 'dragMomentum',
  ]);

  // Returns true if value looks like a MotionValue (has .get/.set)
  const isMotionValue = (v: unknown): boolean =>
    typeof v === 'object' && v !== null && 'get' in v && 'set' in v;

  const createMotionEl = (tag: string) =>
    forwardRef<HTMLElement, Record<string, unknown>>(
      ({ children, style, ...props }, ref) => {
        const cleanProps: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(props)) {
          if (!STRIP_PROPS.has(k)) cleanProps[k] = v;
        }
        const cleanStyle: Record<string, unknown> = {};
        if (style && typeof style === 'object') {
          for (const [k, v] of Object.entries(style as Record<string, unknown>)) {
            if (!isMotionValue(v)) cleanStyle[k] = v;
          }
        }
        return createElement(
          tag,
          { ...cleanProps, style: Object.keys(cleanStyle).length ? cleanStyle : undefined, ref },
          children as React.ReactNode,
        );
      }
    );

  const motion = new Proxy({} as Record<string, unknown>, {
    get: (_target, tag: string) => createMotionEl(tag),
  });

  // Minimal MotionValue stub. `.on()` and `.subscribe()` return an unsubscribe fn
  // so scroll-driven code (useScroll/useSpring/useTransform) can attach listeners.
  const motionValue = (initial = 0) => ({
    get: () => initial,
    set: vi.fn(),
    on: vi.fn(() => vi.fn()),
    subscribe: vi.fn(() => vi.fn()),
    destroy: vi.fn(),
  });

  return {
    motion,
    AnimatePresence: ({ children }: { children: unknown }) =>
      createElement(Fragment, null, children as React.ReactNode),
    LayoutGroup: ({ children }: { children: unknown }) =>
      createElement(Fragment, null, children as React.ReactNode),
    MotionConfig: ({ children }: { children: unknown }) =>
      createElement(Fragment, null, children as React.ReactNode),
    useReducedMotion: () => false,
    useInView: () => true,
    useMotionValue: (initial: number) => motionValue(initial),
    useSpring: (v: unknown) => v,
    useTransform: () => motionValue(0),
    useVelocity: () => motionValue(0),
    useScroll: () => ({ scrollY: motionValue(0), scrollYProgress: motionValue(0) }),
    animate: vi.fn(() => ({ stop: vi.fn() })),
  };
});

// Suppress expected console.error from ErrorBoundary tests
const origConsoleError = console.error;
vi.stubGlobal('console', {
  ...console,
  error: (...args: unknown[]) => {
    const msg = String(args[0] ?? '');
    if (
      msg.includes('The above error occurred') ||
      msg.includes('Error: Test error') ||
      msg.includes('React will try to recreate')
    ) return;
    origConsoleError(...args);
  },
});

