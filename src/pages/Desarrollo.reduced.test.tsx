import { describe, it, expect, vi } from 'vitest';

// Re-mock framer-motion for this file only, forcing useReducedMotion -> true,
// to prove the page degrades to a dignified static variant with all key content.
vi.mock('framer-motion', async () => {
  const { createElement, forwardRef, Fragment } = await import('react');

  const STRIP_PROPS = new Set([
    'initial', 'animate', 'exit', 'whileInView', 'whileHover', 'whileTap',
    'whileFocus', 'whileDrag', 'viewport', 'transition', 'variants', 'custom',
    'onAnimationComplete', 'onAnimationStart', 'layout', 'layoutId', 'drag',
    'dragConstraints', 'dragElastic', 'dragMomentum',
  ]);

  const isMotionValue = (v: unknown): boolean =>
    typeof v === 'object' && v !== null && 'get' in v && 'set' in v;

  const createMotionEl = (tag: string) =>
    forwardRef<HTMLElement, Record<string, unknown>>(({ children, style, ...props }, ref) => {
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
    });

  const motion = new Proxy({} as Record<string, unknown>, {
    get: (_t, tag: string) => createMotionEl(tag),
  });

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
    useReducedMotion: () => true,
    useInView: () => true,
    useMotionValue: (v: number) => motionValue(v),
    useSpring: (v: unknown) => v,
    useTransform: () => motionValue(0),
    useVelocity: () => motionValue(0),
    useScroll: () => ({ scrollY: motionValue(0), scrollYProgress: motionValue(0) }),
    animate: vi.fn(() => ({ stop: vi.fn() })),
  };
});

const { screen, fireEvent } = await import('@testing-library/react');
const { renderWithProviders } = await import('../test/render');
const { Desarrollo } = await import('./Desarrollo');
const { segments, differentiators, procesoSteps } = await import('../data/business');

describe('Desarrollo page with reduced motion', () => {
  it('renders the hero heading statically', () => {
    renderWithProviders(<Desarrollo />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Construyo la máquina/i);
  });

  it('keeps every segment, its title and demo link present', () => {
    const { container } = renderWithProviders(<Desarrollo />);
    for (const segment of segments) {
      expect(screen.getByText(segment.title)).toBeInTheDocument();
      expect(container.querySelector(`a[href="/business/${segment.slug}"]`)).not.toBeNull();
    }
  });

  it('still lets the presencia stepper switch levels', () => {
    renderWithProviders(<Desarrollo />);
    expect(screen.getByText('$200.000')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Tienda' }));
    expect(screen.getByText('$600.000')).toBeInTheDocument();
  });

  it('keeps the process steps and differentiators present', () => {
    renderWithProviders(<Desarrollo />);
    for (const step of procesoSteps) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    }
    for (const item of differentiators) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it('mentions the retainer figure exactly once', () => {
    const { container } = renderWithProviders(<Desarrollo />);
    expect((container.textContent ?? '').split('$50.000').length - 1).toBe(1);
  });
});
