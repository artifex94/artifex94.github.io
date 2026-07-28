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
