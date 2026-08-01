import { vi } from 'vitest';

/**
 * Viewport móvil para los tests.
 *
 * `useIsMobile` pregunta por `max-width`, y el stub de jsdom (src/test/setup.ts)
 * responde `matches: false` a todo: sin esto ningún test puede ver lo que solo
 * existe en móvil, como la franja del hero-pong.
 *
 * Cada test guarda y restaura `window.matchMedia` por su cuenta: acá no se
 * asume nada sobre el ciclo de vida del suite que lo usa.
 */
export function mockMobileViewport(): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('max-width'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
