import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/render';
import { Tufting } from './Tufting';
import { tuftingCategories } from '../data/tufting';

describe('Tufting page', () => {
  it('renders without crashing', () => {
    renderWithProviders(<Tufting />);
    expect(document.body).toBeInTheDocument();
  });

  it('renders both hero rules as complete images without SVG reveal masks', () => {
    renderWithProviders(<Tufting />);
    const banner = screen.getByRole('heading', { name: /Un territorio de lana/i }).closest('figure');

    expect(banner).not.toBeNull();
    expect(banner?.querySelectorAll('img[data-ornament-render="complete"][data-ornament-kind="horizontal"]')).toHaveLength(2);
    expect(banner?.querySelector('svg[viewBox="0 0 260 52"], svg[viewBox="0 0 420 88"]')).not.toBeInTheDocument();
  });

  it('renders every repeated ornament without the clipping SVG masks', () => {
    renderWithProviders(<Tufting />);

    expect(document.querySelector('svg[viewBox="0 0 132 132"], svg[viewBox="0 0 260 52"], svg[viewBox="0 0 420 88"]')).not.toBeInTheDocument();
    expect(document.querySelectorAll('img[data-ornament-render="complete"]').length).toBeGreaterThan(2);
  });

  it('shows every category title', () => {
    renderWithProviders(<Tufting />);
    for (const category of tuftingCategories) {
      expect(screen.getByText(category.title)).toBeInTheDocument();
    }
  });

  it('shows one tufted illustration per category with descriptive alt text', () => {
    renderWithProviders(<Tufting />);
    for (const category of tuftingCategories) {
      expect(screen.getByAltText(`Ilustración tufteada: ${category.title}`)).toBeInTheDocument();
    }
  });

  it('shows the closing CTA', () => {
    renderWithProviders(<Tufting />);
    expect(screen.getByText('¿Tejemos algo juntos?')).toBeInTheDocument();
  });
});
