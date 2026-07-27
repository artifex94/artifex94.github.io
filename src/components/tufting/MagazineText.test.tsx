import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/render';
import { MagazineText } from './MagazineText';

// En jsdom no hay canvas 2D real, así que Pretext nunca se activa: el componente
// debe caer al texto plano (accesible + indexable). Esto es exactamente lo que ve
// el prerender y cualquier navegador sin canvas.
describe('MagazineText (fallback SSR/sin canvas)', () => {
  const TEXT = 'Tejemos despacio, para que dure una vida entera.';

  it('renderiza el texto plano cuando no puede realzar', () => {
    renderWithProviders(<MagazineText text={TEXT} className="font-display" />);
    expect(screen.getByText(TEXT)).toBeInTheDocument();
  });

  it('no explota sin obstáculo ni props extra', () => {
    expect(() => renderWithProviders(<MagazineText text="Hola" />)).not.toThrow();
    expect(screen.getByText('Hola')).toBeInTheDocument();
  });
});
