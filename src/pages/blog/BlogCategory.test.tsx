import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { renderWithProviders } from '../../test/render';
import { BlogCategory } from './BlogCategory';
import { categories, getPostsByCategory } from '../../data/blog';

function renderCategory(slug: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/blog/:categorySlug" element={<BlogCategory />} />
      <Route path="/blog" element={<div>blog-index</div>} />
    </Routes>,
    { routerProps: { initialEntries: [`/blog/${slug}`] } }
  );
}

describe('BlogCategory', () => {
  it('redirects to /blog for an unknown category slug', () => {
    renderCategory('categoria-que-no-existe');
    expect(screen.getByText('blog-index')).toBeInTheDocument();
  });

  it('renders the category title for a valid slug', () => {
    const cat = categories[0];
    renderCategory(cat.slug);
    expect(screen.getByRole('heading', { name: cat.title })).toBeInTheDocument();
  });

  it('renders the category description', () => {
    const cat = categories[0];
    renderCategory(cat.slug);
    expect(screen.getByText(cat.description)).toBeInTheDocument();
  });

  it('shows published post titles', () => {
    const cat = categories.find(c => getPostsByCategory(c.slug).length > 0)!;
    renderCategory(cat.slug);
    const published = getPostsByCategory(cat.slug);
    expect(screen.getByText(published[0].title)).toBeInTheDocument();
  });

  it('renders breadcrumb link back to /blog', () => {
    const cat = categories[0];
    renderCategory(cat.slug);
    const backLink = screen.getByRole('link', { name: /Blog/i });
    expect(backLink).toHaveAttribute('href', '/blog');
  });

  it('renders links to other categories', () => {
    const cat = categories[0];
    renderCategory(cat.slug);
    const otherCats = categories.filter(c => c.slug !== cat.slug);
    // At least one other category link should be present
    expect(
      screen.getAllByRole('link').some(l =>
        otherCats.some(c => l.getAttribute('href') === `/blog/${c.slug}`)
      )
    ).toBe(true);
  });
});
