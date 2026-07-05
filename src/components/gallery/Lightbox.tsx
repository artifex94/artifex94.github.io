import React, { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryPhoto } from '../../data/photography';

interface LightboxProps {
  photos: GalleryPhoto[];
  /** Índice de la foto abierta dentro de `photos`, o null si está cerrado. */
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ photos, index, onClose, onNavigate }) => {
  const isOpen = index !== null && photos.length > 0;

  const goPrev = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + photos.length) % photos.length);
  }, [index, photos.length, onNavigate]);

  const goNext = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % photos.length);
  }, [index, photos.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };

    window.addEventListener('keydown', handleKey);
    // Bloquea el scroll del fondo mientras el lightbox está abierto
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose, goPrev, goNext]);

  const photo = isOpen ? photos[index] : null;

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={photo.alt}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
          >
            <X size={28} />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Foto anterior"
                className="absolute left-2 sm:left-6 text-white/70 hover:text-white transition-colors z-10 p-2"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Foto siguiente"
                className="absolute right-2 sm:right-6 text-white/70 hover:text-white transition-colors z-10 p-2"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <motion.img
            key={photo.src}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            src={photo.src}
            alt={photo.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain select-none"
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center px-4">
            <p className="text-white/80 text-sm mb-1">{photo.alt}</p>
            <p className="text-white/50 text-xs font-mono">
              {(index ?? 0) + 1} / {photos.length}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
