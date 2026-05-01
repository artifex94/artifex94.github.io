import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/render';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders the brand name', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText(/Artifex/)).toBeInTheDocument();
  });

  it('renders the three navigation links', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('link', { name: /Portfolio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Business/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Blog/i })).toBeInTheDocument();
  });

  it('Portfolio link points to /', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('link', { name: /Portfolio/i })).toHaveAttribute('href', '/');
  });

  it('Business link points to /business', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('link', { name: /Business/i })).toHaveAttribute('href', '/business');
  });

  it('Blog link points to /blog', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('link', { name: /Blog/i })).toHaveAttribute('href', '/blog');
  });

  it('Portfolio link is active (text-accent class) when on /', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/'] } });
    const portfolioLink = screen.getByRole('link', { name: /Portfolio/i });
    expect(portfolioLink.className).toContain('text-accent');
  });

  it('Business link is active when on /business', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/business'] } });
    const businessLink = screen.getByRole('link', { name: /Business/i });
    expect(businessLink.className).toContain('text-accent');
  });

  it('Blog link is active when on /blog/category/post', () => {
    renderWithProviders(<Navbar />, { routerProps: { initialEntries: ['/blog/ingenieria/some-post'] } });
    const blogLink = screen.getByRole('link', { name: /Blog/i });
    expect(blogLink.className).toContain('text-accent');
  });
});
