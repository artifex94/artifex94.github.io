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
    expect(screen.getByRole('link', { name: /Portfolio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Blog/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Business$/i })).not.toBeInTheDocument();
  });

  it('Portfolio link points to /about when on /', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/'] } });
    expect(screen.getByRole('link', { name: /Portfolio/i })).toHaveAttribute('href', '/about');
  });

  it('Blog link points to /blog', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/'] } });
    expect(screen.getByRole('link', { name: /Blog/i })).toHaveAttribute('href', '/blog');
  });

  it('Business link points to / when on /about', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/about'] } });
    expect(screen.getByRole('link', { name: /^Business$/i })).toHaveAttribute('href', '/');
  });

  it('active section is shown in the brand area, not as a link', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/'] } });
    expect(screen.getByText('/Business')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Business$/i })).not.toBeInTheDocument();
  });

  it('brand area shows /Portfolio when on /about', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/about'] } });
    expect(screen.getByText('/Portfolio')).toBeInTheDocument();
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
