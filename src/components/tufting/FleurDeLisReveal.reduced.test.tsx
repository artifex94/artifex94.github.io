import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => true };
});

const { FleurDeLisReveal } = await import('./FleurDeLisReveal');

describe('FleurDeLisReveal with reduced motion', () => {
  it('shows the complete static flower instead of an animated mask', () => {
    const { container } = render(<FleurDeLisReveal label="Flor de lis de lana" className="w-full" />);

    expect(screen.getByRole('img', { name: 'Flor de lis de lana' })).toBeInstanceOf(HTMLImageElement);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveClass('w-full');
  });
});
