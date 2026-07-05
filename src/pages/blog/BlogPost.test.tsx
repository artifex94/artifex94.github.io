import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../test/render';
import { BlogPost } from './BlogPost';
import { getAllPublished, categories, posts } from '../../data/blog';

function renderPost(categorySlug: string, postSlug: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/blog/:categorySlug/:postSlug" element={<BlogPost />} />
      <Route path="/blog" element={<div>blog-index</div>} />
    </Routes>,
    { routerProps: { initialEntries: [`/blog/${categorySlug}/${postSlug}`] } }
  );
}

describe('BlogPost', () => {
  it('redirects to /blog for an unknown category', () => {
    renderPost('categoria-inexistente', 'slug-inexistente');
    expect(screen.getByText('blog-index')).toBeInTheDocument();
  });

  it('redirects to /blog for an unknown post slug', () => {
    renderPost('ingenieria', 'slug-que-no-existe');
    expect(screen.getByText('blog-index')).toBeInTheDocument();
  });

  it('renders the post title for a valid published post', () => {
    const post = getAllPublished()[0];
    renderPost(post.category, post.slug);
    expect(screen.getByRole('heading', { level: 1, name: post.title })).toBeInTheDocument();
  });

  it('renders the post summary', () => {
    const post = getAllPublished()[0];
    renderPost(post.category, post.slug);
    expect(screen.getByText(post.summary)).toBeInTheDocument();
  });

  it('shows "CONTENT_PENDING" for a post with empty content', () => {
    const draft = posts.find(p => p.content.length === 0);
    if (!draft) return;
    renderPost(draft.category, draft.slug);
    expect(screen.getByText(/CONTENT_PENDING/)).toBeInTheDocument();
  });

  it('renders a breadcrumb link to the category page', () => {
    const post = getAllPublished()[0];
    const cat = categories.find(c => c.slug === post.category)!;
    const { container } = renderPost(post.category, post.slug);
    const catLink = container.querySelector(`a[href="/blog/${cat.slug}"]`);
    expect(catLink).not.toBeNull();
  });

  it('renders a "back to blog" breadcrumb link', () => {
    const post = getAllPublished()[0];
    const { container } = renderPost(post.category, post.slug);
    const blogLink = container.querySelector('a[href="/blog"]');
    expect(blogLink).not.toBeNull();
  });
});
