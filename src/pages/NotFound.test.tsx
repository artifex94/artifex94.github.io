import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/render';
import { NotFound } from './NotFound';

describe('NotFound', () => {
  it('renders a 404 heading', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('informs the user the page was not found', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  it('provides a link back to the home page', () => {
    renderWithProviders(<NotFound />);
    const link = screen.getByRole('link', { name: /volver al inicio/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('shows a descriptive message about the missing route', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText(/repositorio/i)).toBeInTheDocument();
  });
});
