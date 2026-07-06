import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/render';
import { GalleryGrid } from './GalleryGrid';
import type { GalleryPhoto } from '../../data/photography';

// Local fixtures: GalleryGrid/Lightbox tests must not depend on the real
// (currently empty) generated manifest.
const fixturePhotos: GalleryPhoto[] = [
  {
    thumbSrc: 'https://example.supabase.co/storage/v1/object/public/fotografias/coleccion-uno/thumbs/foto-1.webp',
    fullSrc: 'https://example.supabase.co/storage/v1/object/public/fotografias/coleccion-uno/foto-1.webp',
    alt: 'Colección Uno — obra 1',
    width: 1600,
    height: 1200,
    collection: 'Colección Uno',
    lqip: 'data:image/webp;base64,AAAA',
  },
  {
    thumbSrc: 'https://example.supabase.co/storage/v1/object/public/fotografias/varias/thumbs/foto-2.webp',
    fullSrc: 'https://example.supabase.co/storage/v1/object/public/fotografias/varias/foto-2.webp',
    alt: 'Fotografía — obra 1',
    width: 1200,
    height: 1600,
    collection: null,
  },
];

describe('GalleryGrid', () => {
  it('shows the curation placeholder when there are no photos', () => {
    renderWithProviders(<GalleryGrid photos={[]} />);
    expect(screen.getByText('Galería en curaduría')).toBeInTheDocument();
  });

  it('does not show the placeholder when there are photos', () => {
    renderWithProviders(<GalleryGrid photos={fixturePhotos} />);
    expect(screen.queryByText('Galería en curaduría')).not.toBeInTheDocument();
  });

  it('renders one image per photo using the thumb variant', () => {
    renderWithProviders(<GalleryGrid photos={fixturePhotos} />);
    for (const photo of fixturePhotos) {
      const img = screen.getByAltText(photo.alt);
      expect(img).toHaveAttribute('src', photo.thumbSrc);
    }
  });

  it('shows the LQIP placeholder layer only for photos that have one', () => {
    renderWithProviders(<GalleryGrid photos={fixturePhotos} />);
    expect(screen.getAllByTestId('gallery-tile-lqip')).toHaveLength(1);
  });

  it('shows the collection credit only for photos that belong to one', () => {
    renderWithProviders(<GalleryGrid photos={fixturePhotos} />);
    expect(screen.getByText('Colección Uno')).toBeInTheDocument();
    expect(document.querySelectorAll('figcaption')).toHaveLength(1);
  });

  it('opens the lightbox with the clicked photo', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GalleryGrid photos={fixturePhotos} />);

    await user.click(screen.getByRole('button', { name: `Ampliar: ${fixturePhotos[0].alt}` }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', fixturePhotos[0].alt);
  });

  it('closes the lightbox when its close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GalleryGrid photos={fixturePhotos} />);

    await user.click(screen.getByRole('button', { name: `Ampliar: ${fixturePhotos[0].alt}` }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
