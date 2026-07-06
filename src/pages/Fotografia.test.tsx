import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/render';
import { Fotografia } from './Fotografia';
import { photoCategories, photoPackages } from '../data/photography';

describe('Fotografia page', () => {
  it('renders without crashing', () => {
    renderWithProviders(<Fotografia />);
    expect(document.body).toBeInTheDocument();
  });

  it('shows the main heading', () => {
    renderWithProviders(<Fotografia />);
    expect(screen.getByText(/La luz cuenta la historia/i)).toBeInTheDocument();
  });

  it('renders every "qué hago" category card', () => {
    renderWithProviders(<Fotografia />);
    for (const category of photoCategories) {
      expect(screen.getByText(category.label)).toBeInTheDocument();
    }
  });

  it('shows the gallery section with copy for one continuous panorama', () => {
    renderWithProviders(<Fotografia />);
    expect(screen.getByText('Trabajo seleccionado')).toBeInTheDocument();
    expect(screen.getByText(/paneo general/i)).toBeInTheDocument();
  });

  it('no longer mentions the old per-rubro sample copy', () => {
    renderWithProviders(<Fotografia />);
    expect(screen.queryByText(/una muestra de cada rubro/i)).not.toBeInTheDocument();
  });

  it('falls back to the curation placeholder while the manifest is empty', () => {
    renderWithProviders(<Fotografia />);
    expect(screen.getByText('Galería en curaduría')).toBeInTheDocument();
  });

  it('renders every package name', () => {
    renderWithProviders(<Fotografia />);
    for (const pkg of photoPackages) {
      expect(screen.getByText(pkg.name)).toBeInTheDocument();
    }
  });

  it('links to the desarrollo service', () => {
    const { container } = renderWithProviders(<Fotografia />);
    expect(container.querySelector('a[href="/servicios/desarrollo"]')).not.toBeNull();
  });
});
