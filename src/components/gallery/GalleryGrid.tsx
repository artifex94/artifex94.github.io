import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Lightbox } from './Lightbox';
import type { GalleryPhoto } from '../../data/photography';

interface GalleryGridProps {
  photos: GalleryPhoto[];
  className?: string;
}

interface GalleryTileProps {
  photo: GalleryPhoto;
  index: number;
  onOpen: () => void;
}

// Capped appearance delay: past the first 8 photos there's no point adding
// more delay, it would feel sluggish in large galleries.
const STAGGER_STEP = 0.05;
const STAGGER_CAP = 8;

// A single grid tile: LQIP as background, the real thumb fades in on load
// (blur-up), plus a collection-credit overlay on hover.
const GalleryTile: React.FC<GalleryTileProps> = ({ photo, index, onOpen }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: Math.min(index, STAGGER_CAP) * STAGGER_STEP }}
      onClick={onOpen}
      className="relative block w-full mb-4 break-inside-avoid overflow-hidden group cursor-zoom-in"
      aria-label={`Ampliar: ${photo.alt}`}
    >
      <div
        className="relative w-full bg-surface"
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      >
        {photo.lqip && (
          <div
            aria-hidden="true"
            data-testid="gallery-tile-lqip"
            className="absolute inset-0 bg-cover bg-center scale-105 blur-sm"
            style={{ backgroundImage: `url(${photo.lqip})` }}
          />
        )}
        <img
          src={photo.thumbSrc}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>

      {photo.collection && (
        <figcaption className="absolute inset-x-0 bottom-0 px-3 py-2 text-left text-xs text-white bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {photo.collection}
        </figcaption>
      )}
    </motion.button>
  );
};

// Masonry via CSS columns: no libraries needed. Each image reserves its
// aspect-ratio (width/height from the data file) to avoid layout shift.
export const GalleryGrid: React.FC<GalleryGridProps> = ({ photos, className }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className={cn('text-center py-16 border border-dashed border-line', className)}>
        <Camera size={32} className="mx-auto text-accent mb-4" />
        <p className="text-primary font-bold mb-2">Galería en curaduría</p>
        <p className="text-sm text-secondary max-w-md mx-auto">
          Estoy seleccionando las mejores tomas. Mientras tanto, escribime y te comparto el book
          completo del rubro que te interese.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="columns-2 md:columns-3 gap-4 [column-fill:balance]">
        {photos.map((photo, index) => (
          <GalleryTile
            key={photo.fullSrc}
            photo={photo}
            index={index}
            onOpen={() => setLightboxIndex(index)}
          />
        ))}
      </div>

      <Lightbox
        photos={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
};
