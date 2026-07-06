import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/render';
import { Lightbox } from './Lightbox';
import type { GalleryPhoto } from '../../data/photography';

const photos: GalleryPhoto[] = [
  {
    thumbSrc: 'https://example.supabase.co/storage/v1/object/public/fotografias/coleccion-uno/thumbs/foto-1.webp',
    fullSrc: 'https://example.supabase.co/storage/v1/object/public/fotografias/coleccion-uno/foto-1.webp',
    alt: 'Colección Uno — obra 1',
    width: 1600,
    height: 1200,
    collection: 'Colección Uno',
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

describe('Lightbox', () => {
  it('renders nothing when index is null', () => {
    renderWithProviders(
      <Lightbox photos={photos} index={null} onClose={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog with the full-size image when open', () => {
    renderWithProviders(
      <Lightbox photos={photos} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', photos[0].alt);

    const fullImg = screen.getByAltText(photos[0].alt);
    expect(fullImg).toHaveAttribute('src', photos[0].fullSrc);
  });

  it('renders an anti-flash thumb layer behind the full image', () => {
    renderWithProviders(
      <Lightbox photos={photos} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(screen.getByTestId('lightbox-thumb-layer')).toHaveAttribute('src', photos[0].thumbSrc);
  });

  it('shows the collection credit when present', () => {
    renderWithProviders(
      <Lightbox photos={photos} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(screen.getByText('Colección Uno')).toBeInTheDocument();
  });

  it('does not show a collection credit for loose photos', () => {
    renderWithProviders(
      <Lightbox photos={photos} index={1} onClose={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(screen.queryByText('Colección Uno')).not.toBeInTheDocument();
  });

  it('shows the photo counter', () => {
    renderWithProviders(
      <Lightbox photos={photos} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <Lightbox photos={photos} index={0} onClose={onClose} onNavigate={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not close when clicking the image itself', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <Lightbox photos={photos} index={0} onClose={onClose} onNavigate={vi.fn()} />
    );
    fireEvent.click(screen.getByAltText(photos[0].alt));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('navigates to the next photo when clicking the next button', () => {
    const onNavigate = vi.fn();
    renderWithProviders(
      <Lightbox photos={photos} index={0} onClose={vi.fn()} onNavigate={onNavigate} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('wraps to the last photo when clicking prev from the first one', () => {
    const onNavigate = vi.fn();
    renderWithProviders(
      <Lightbox photos={photos} index={0} onClose={vi.fn()} onNavigate={onNavigate} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Foto anterior' }));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('does not render prev/next controls with a single photo', () => {
    renderWithProviders(
      <Lightbox photos={[photos[0]]} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(screen.queryByRole('button', { name: 'Foto siguiente' })).not.toBeInTheDocument();
  });

  it('navigates with keyboard arrows and closes on Escape', () => {
    const onNavigate = vi.fn();
    const onClose = vi.fn();
    renderWithProviders(
      <Lightbox photos={photos} index={0} onClose={onClose} onNavigate={onNavigate} />
    );

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onNavigate).toHaveBeenCalledWith(1);

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onNavigate).toHaveBeenCalledWith(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('locks body scroll while open and restores it on unmount', () => {
    const { unmount } = renderWithProviders(
      <Lightbox photos={photos} index={0} onClose={vi.fn()} onNavigate={vi.fn()} />
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
