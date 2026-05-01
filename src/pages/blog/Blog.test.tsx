import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/render';
import { Blog } from './Blog';
import { categories, getAllPublished } from '../../data/blog';

describe('Blog page', () => {
  it('renders without crashing', () => {
    renderWithProviders(<Blog />);
    expect(document.body).toBeInTheDocument();
  });

  it('shows the main heading', () => {
    renderWithProviders(<Blog />);
    expect(screen.getByText('Blog & Notas')).toBeInTheDocument();
  });

  it('renders a link for each category pointing to /blog/:slug', () => {
    const { container } = renderWithProviders(<Blog />);
    for (const cat of categories) {
      const link = container.querySelector(`a[href="/blog/${cat.slug}"]`);
      expect(link, `Missing link for category "${cat.slug}"`).not.toBeNull();
    }
  });

  it('shows recent published posts', () => {
    const recent = getAllPublished().slice(0, 4);
    renderWithProviders(<Blog />);
    expect(screen.getByText(recent[0].title)).toBeInTheDocument();
  });

  it('renders the search input', () => {
    renderWithProviders(<Blog />);
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
  });

  it('filters posts when typing in the search input', () => {
    renderWithProviders(<Blog />);
    const published = getAllPublished();
    const targetPost = published[0];

    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: targetPost.title.slice(0, 8) } });

    expect(screen.getByText(targetPost.title)).toBeInTheDocument();
  });

  it('shows no-results indicator when search matches nothing', () => {
    renderWithProviders(<Blog />);
    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: 'xyzzy_nada_aqui_99999' } });
    expect(screen.getByText(/SIN_RESULTADOS/)).toBeInTheDocument();
  });

  it('hides the clear button after clicking it (query cleared)', () => {
    renderWithProviders(<Blog />);
    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: 'typescript' } });

    const clearBtn = screen.getByRole('button', { name: /limpiar/i });
    fireEvent.click(clearBtn);

    // Once query is cleared the button is unmounted
    expect(screen.queryByRole('button', { name: /limpiar/i })).not.toBeInTheDocument();
  });

  it('renders the donations section with Cafecito', () => {
    renderWithProviders(<Blog />);
    expect(screen.getAllByText(/cafecito/i).length).toBeGreaterThan(0);
  });
});
