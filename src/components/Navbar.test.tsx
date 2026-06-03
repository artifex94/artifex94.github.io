import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/render';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders the brand name', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText(/Artifex/)).toBeInTheDocument();
  });

  it('shows only the two inactive sections as links when on /', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/'] } });
    expect(screen.getByRole('link', { name: /Business/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Blog/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Portfolio$/i })).not.toBeInTheDocument();
  });

  it('Business link points to /business', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/'] } });
    expect(screen.getByRole('link', { name: /Business/i })).toHaveAttribute('href', '/business');
  });

  it('Blog link points to /blog', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/'] } });
    expect(screen.getByRole('link', { name: /Blog/i })).toHaveAttribute('href', '/blog');
  });

  it('Portfolio link points to / when on /business', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/business'] } });
    expect(screen.getByRole('link', { name: /^Portfolio$/i })).toHaveAttribute('href', '/');
  });

  it('active section is shown in the brand area, not as a link', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/'] } });
    expect(screen.getByText('/Portfolio')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Portfolio$/i })).not.toBeInTheDocument();
  });

  it('brand area shows /Business when on /business', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/business'] } });
    expect(screen.getByText('/Business')).toBeInTheDocument();
  });

  it('brand area shows /Blog when on /blog', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/blog'] } });
    expect(screen.getByText('/Blog')).toBeInTheDocument();
  });

  it('shows Portfolio and Business links when on /blog', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/blog'] } });
    expect(screen.getByRole('link', { name: /^Portfolio$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Business$/i })).toBeInTheDocument();
  });
});
