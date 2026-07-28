import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FleurDeLisReveal } from './FleurDeLisReveal';

describe('FleurDeLisReveal', () => {
  it('builds the flower from the requested color stages', () => {
    const { container } = render(<FleurDeLisReveal label="Flor de lis de lana" />);
    const svg = screen.getByRole('img', { name: 'Flor de lis de lana' });
    const stages = [...container.querySelectorAll('[data-reveal-stage]')].map((stage) => stage.getAttribute('data-reveal-stage'));

    expect(svg).toHaveAttribute('data-fleur-reveal', 'layered');
    expect(stages).toEqual(['yellow', 'inner-orange', 'ivory', 'outer-orange', 'brown']);
    expect(container.querySelector('[data-reveal-completion="soft"]')).toBeInTheDocument();
    expect(container.querySelectorAll('image')).toHaveLength(1);
  });

  it('remains decorative when it has no accessible label', () => {
    const { container } = render(<FleurDeLisReveal />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
