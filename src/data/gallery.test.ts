import { describe, it, expect } from 'vitest';
import { galleryManifest } from './gallery.generated';

describe('gallery manifest', () => {
  it('is an array (empty until `npm run photos:sync` populates it)', () => {
    expect(Array.isArray(galleryManifest)).toBe(true);
  });

  it('every photo has the required GalleryPhoto shape', () => {
    for (const photo of galleryManifest) {
      expect(photo.thumbSrc.trim().length).toBeGreaterThan(0);
      expect(photo.fullSrc.trim().length).toBeGreaterThan(0);
      expect(photo.alt.trim().length).toBeGreaterThan(0);
      expect(photo.width).toBeGreaterThan(0);
      expect(photo.height).toBeGreaterThan(0);
      expect(photo.collection === null || typeof photo.collection === 'string').toBe(true);
      if (photo.lqip !== undefined) {
        expect(photo.lqip.startsWith('data:image/')).toBe(true);
      }
    }
  });

  it('every thumbSrc and fullSrc is an https URL', () => {
    for (const photo of galleryManifest) {
      expect(photo.thumbSrc).toMatch(/^https:\/\//);
      expect(photo.fullSrc).toMatch(/^https:\/\//);
    }
  });

  it('every alt text is unique', () => {
    const seen = new Set<string>();
    for (const photo of galleryManifest) {
      expect(seen.has(photo.alt), `Duplicate alt text "${photo.alt}"`).toBe(false);
      seen.add(photo.alt);
    }
  });
});
