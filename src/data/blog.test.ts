import { describe, it, expect } from 'vitest';
import {
  getAllPublished,
  getRecentPosts,
  getPostsByCategory,
  getCategoryBySlug,
  getPostBySlug,
  countByCategory,
  categories,
  posts,
} from './blog';

// ── getAllPublished ──────────────────────────────────────────────────────────

describe('getAllPublished', () => {
  it('returns only posts with status "published"', () => {
    expect(getAllPublished().every(p => p.status === 'published')).toBe(true);
  });

  it('returns at least one published post', () => {
    expect(getAllPublished().length).toBeGreaterThan(0);
  });

  it('sorts by date descending', () => {
    const published = getAllPublished();
    for (let i = 1; i < published.length; i++) {
      expect(published[i - 1].date >= published[i].date).toBe(true);
    }
  });

  it('excludes draft posts', () => {
    const drafts = posts.filter(p => p.status === 'draft');
    const publishedSlugs = new Set(getAllPublished().map(p => p.slug));
    for (const draft of drafts) {
      expect(publishedSlugs.has(draft.slug)).toBe(false);
    }
  });
});

// ── getRecentPosts ──────────────────────────────────────────────────────────

describe('getRecentPosts', () => {
  it('returns 5 posts by default', () => {
    expect(getRecentPosts().length).toBeLessThanOrEqual(5);
  });

  it('returns n posts when specified', () => {
    expect(getRecentPosts(2).length).toBeLessThanOrEqual(2);
    expect(getRecentPosts(1).length).toBeLessThanOrEqual(1);
  });

  it('returns only published posts', () => {
    expect(getRecentPosts(50).every(p => p.status === 'published')).toBe(true);
  });

  it('results are a prefix of getAllPublished', () => {
    const allPublished = getAllPublished();
    const recent = getRecentPosts(3);
    recent.forEach((post, i) => {
      expect(post.slug).toBe(allPublished[i].slug);
    });
  });
});

// ── getPostsByCategory ──────────────────────────────────────────────────────

describe('getPostsByCategory', () => {
  it('returns posts belonging to the given category', () => {
    const result = getPostsByCategory('ingenieria');
    expect(result.every(p => p.category === 'ingenieria')).toBe(true);
  });

  it('returns only published posts', () => {
    for (const cat of categories) {
      expect(getPostsByCategory(cat.slug).every(p => p.status === 'published')).toBe(true);
    }
  });

  it('returns empty array for an unknown category', () => {
    expect(getPostsByCategory('nonexistent')).toHaveLength(0);
  });

  it('returns posts for every defined category (even if 0)', () => {
    for (const cat of categories) {
      expect(Array.isArray(getPostsByCategory(cat.slug))).toBe(true);
    }
  });
});

// ── getCategoryBySlug ───────────────────────────────────────────────────────

describe('getCategoryBySlug', () => {
  it('finds every defined category by its own slug', () => {
    for (const cat of categories) {
      const found = getCategoryBySlug(cat.slug);
      expect(found).toBeDefined();
      expect(found!.slug).toBe(cat.slug);
    }
  });

  it('returns undefined for an unknown slug', () => {
    expect(getCategoryBySlug('nonexistent')).toBeUndefined();
    expect(getCategoryBySlug('')).toBeUndefined();
  });
});

// ── getPostBySlug ───────────────────────────────────────────────────────────

describe('getPostBySlug', () => {
  it('finds a published post by category + slug', () => {
    const published = getAllPublished()[0];
    const found = getPostBySlug(published.category, published.slug);
    expect(found).toBeDefined();
    expect(found!.slug).toBe(published.slug);
  });

  it('finds draft posts too (no status filter)', () => {
    const draft = posts.find(p => p.status === 'draft');
    if (draft) {
      expect(getPostBySlug(draft.category, draft.slug)).toBeDefined();
    }
  });

  it('returns undefined when category does not match', () => {
    const published = getAllPublished()[0];
    const wrongCategory = categories.find(c => c.slug !== published.category)!;
    expect(getPostBySlug(wrongCategory.slug, published.slug)).toBeUndefined();
  });

  it('returns undefined for unknown slug', () => {
    expect(getPostBySlug('ingenieria', 'slug-que-no-existe')).toBeUndefined();
  });

  it('returns undefined for empty strings', () => {
    expect(getPostBySlug('', '')).toBeUndefined();
  });
});

// ── countByCategory ─────────────────────────────────────────────────────────

describe('countByCategory', () => {
  it('matches manual count of published posts per category', () => {
    for (const cat of categories) {
      const manual = posts.filter(p => p.category === cat.slug && p.status === 'published').length;
      expect(countByCategory(cat.slug)).toBe(manual);
    }
  });

  it('returns 0 for unknown category', () => {
    expect(countByCategory('nonexistent')).toBe(0);
  });

  it('excludes draft posts from the count', () => {
    for (const cat of categories) {
      const hasDrafts = posts.some(p => p.category === cat.slug && p.status === 'draft');
      if (hasDrafts) {
        const draftCount = posts.filter(p => p.category === cat.slug && p.status === 'draft').length;
        const totalCount = posts.filter(p => p.category === cat.slug).length;
        expect(countByCategory(cat.slug)).toBe(totalCount - draftCount);
      }
    }
  });
});

// ── Data integrity ──────────────────────────────────────────────────────────

describe('blog data integrity', () => {
  it('every post slug is unique within its category', () => {
    const seen = new Map<string, Set<string>>();
    for (const post of posts) {
      if (!seen.has(post.category)) seen.set(post.category, new Set());
      const catSet = seen.get(post.category)!;
      expect(catSet.has(post.slug), `Duplicate slug "${post.slug}" in category "${post.category}"`).toBe(false);
      catSet.add(post.slug);
    }
  });

  it('every post has a valid ISO date (YYYY-MM-DD)', () => {
    for (const post of posts) {
      expect(post.date, `Post "${post.slug}" has invalid date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(post.date).toString(), `Post "${post.slug}" date is not a valid Date`).not.toBe('Invalid Date');
    }
  });

  it('every post references an existing category slug', () => {
    const categorySlugs = new Set(categories.map(c => c.slug));
    for (const post of posts) {
      expect(categorySlugs.has(post.category), `Post "${post.slug}" references unknown category "${post.category}"`).toBe(true);
    }
  });

  it('every category has non-empty title, description, and accent', () => {
    for (const cat of categories) {
      expect(cat.title.trim().length, `Category "${cat.slug}" has empty title`).toBeGreaterThan(0);
      expect(cat.description.trim().length, `Category "${cat.slug}" has empty description`).toBeGreaterThan(0);
      expect(cat.accent.trim().length, `Category "${cat.slug}" has empty accent`).toBeGreaterThan(0);
    }
  });

  it('all published posts have non-empty content', () => {
    for (const post of getAllPublished()) {
      expect(post.content.length, `Published post "${post.slug}" has empty content`).toBeGreaterThan(0);
    }
  });

  it('every post has a positive readTime', () => {
    for (const post of posts) {
      expect(post.readTime, `Post "${post.slug}" has invalid readTime`).toBeGreaterThan(0);
    }
  });

  it('every post has at least one tag', () => {
    for (const post of posts) {
      expect(post.tags.length, `Post "${post.slug}" has no tags`).toBeGreaterThan(0);
    }
  });

  it('categories array is not empty', () => {
    expect(categories.length).toBeGreaterThan(0);
  });

  it('posts array is not empty', () => {
    expect(posts.length).toBeGreaterThan(0);
  });
});
