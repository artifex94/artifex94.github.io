import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Lightbox } from './Lightbox';
import {
  photoCategories,
  type GalleryPhoto,
  type PhotoCategory,
} from '../../data/photography';

interface GalleryGridProps {
  photos: GalleryPhoto[];
  className?: string;
}

// Masonry con CSS columns: sin librerías. Cada imagen reserva su
// aspect-ratio (width/height del data file) para no mover el layout.
export const GalleryGrid: React.FC<GalleryGridProps> = ({ photos, className }) => {
  const [filter, setFilter] = useState<PhotoCategory | 'todas'>('todas');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visiblePhotos = useMemo(
    () => (filter === 'todas' ? photos : photos.filter((p) => p.category === filter)),
    [photos, filter]
  );

  // Solo mostrar chips de categorías que tienen fotos
  const availableCategories = useMemo(
    () => photoCategories.filter((c) => photos.some((p) => p.category === c.key)),
    [photos]
  );

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
      {availableCategories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {(['todas', ...availableCategories.map((c) => c.key)] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFilter(key);
                setLightboxIndex(null);
              }}
              className={cn(
                'px-4 py-2 text-sm border transition-colors',
                filter === key
                  ? 'border-accent text-accent'
                  : 'border-line text-secondary hover:text-primary hover:border-primary'
              )}
            >
              {key === 'todas'
                ? 'Todas'
                : photoCategories.find((c) => c.key === key)?.label}
            </button>
          ))}
        </div>
      )}

      <div className="columns-2 md:columns-3 gap-4 [column-fill:balance]">
        {visiblePhotos.map((photo, index) => (
          <motion.button
            key={photo.src}
            type="button"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5 }}
            onClick={() => setLightboxIndex(index)}
            className="block w-full mb-4 break-inside-avoid group cursor-zoom-in"
            aria-label={`Ampliar: ${photo.alt}`}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
              className="w-full h-auto object-cover bg-surface transition-opacity duration-300 group-hover:opacity-85"
            />
          </motion.button>
        ))}
      </div>

      <Lightbox
        photos={visiblePhotos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
};
