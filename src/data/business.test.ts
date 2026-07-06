import { describe, it, expect } from 'vitest';
import {
  segments,
  presenciaLevels,
  sistemaTier,
  RETAINER_PRICE,
  procesoSteps,
  differentiators,
} from './business';

describe('business content model', () => {
  it('has six segments with unique, lowercase, non-empty slugs', () => {
    expect(segments).toHaveLength(6);
    const slugs = segments.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(6);
    for (const segment of segments) {
      expect(segment.slug).toMatch(/^[a-z]+$/);
      expect(segment.title.trim().length).toBeGreaterThan(0);
      expect(segment.hook.trim().length).toBeGreaterThan(0);
      expect(segment.pain.trim().length).toBeGreaterThan(0);
    }
  });

  it('has three presencia levels with unique ids and prices', () => {
    expect(presenciaLevels).toHaveLength(3);
    expect(new Set(presenciaLevels.map((l) => l.id)).size).toBe(3);
    expect(new Set(presenciaLevels.map((l) => l.price)).size).toBe(3);
    for (const level of presenciaLevels) {
      expect(level.features.length).toBeGreaterThan(0);
    }
  });

  it('never repeats the retainer figure inside any tier feature', () => {
    const allFeatures = [...presenciaLevels.flatMap((l) => l.features), ...sistemaTier.features];
    for (const feature of allFeatures) {
      expect(feature).not.toContain(RETAINER_PRICE);
      expect(feature).not.toContain('50.000');
    }
  });

  it('has four process steps and three differentiators', () => {
    expect(procesoSteps).toHaveLength(4);
    expect(differentiators).toHaveLength(3);
  });
});
