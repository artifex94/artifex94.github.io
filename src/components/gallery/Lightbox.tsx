import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryPhoto } from '../../data/photography';

interface LightboxProps {
  photos: GalleryPhoto[];
  /** Index of the open photo within `photos`, or null when closed. */
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

// The subset of framer-motion's PanInfo we actually need: just the
// horizontal drag offset.
interface DragOffsetInfo {
  offset: { x: number; y: number };
}

// Pixels of drag needed to trigger swipe navigation.
const SWIPE_THRESHOLD = 80;

export const Lightbox: React.FC<LightboxProps> = ({ photos, index, onClose, onNavigate }) => {
  const isOpen = index !== null && photos.length > 0;
  const [loaded, setLoaded] = useState(false);
  // Tracks the last index we reset `loaded` for, so the fade-in flag only
  // resets once per photo change (see render-time state adjustment below).
  const [loadedForIndex, setLoadedForIndex] = useState<number | null>(null);

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
    // Locks background scroll while the lightbox is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose, goPrev, goNext]);

  // Reset the fade-in flag synchronously during render whenever the active
  // photo changes (React's supported "adjust state during render" pattern —
  // avoids the extra render a `useEffect(() => setLoaded(false), [index])`
  // would cause).
  if (isOpen && index !== loadedForIndex) {
    setLoadedForIndex(index);
    setLoaded(false);
  }

  // Preload adjacent photos so arrow/swipe navigation doesn't show a blank
  // gap while the next full-res image downloads. Pure side effect, no
  // setState here — belongs in an effect.
  useEffect(() => {
    if (!isOpen || index === null) return;

    const nextIndex = (index + 1) % photos.length;
    const prevIndex = (index - 1 + photos.length) % photos.length;
    for (const i of [nextIndex, prevIndex]) {
      const preload = new Image();
      preload.src = photos[i].fullSrc;
    }
  }, [isOpen, index, photos]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: DragOffsetInfo
  ) => {
    const offsetX = info?.offset?.x ?? 0;
    if (offsetX > SWIPE_THRESHOLD) {
      goPrev();
    } else if (offsetX < -SWIPE_THRESHOLD) {
      goNext();
    }
  };

  const photo = isOpen && index !== null ? photos[index] : null;

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

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* Anti-flash layer: the thumb is already browser-cached (it came
                from the grid), so it fills the gap while the full image loads. */}
            <img
              src={photo.thumbSrc}
              alt=""
              aria-hidden="true"
              data-testid="lightbox-thumb-layer"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <motion.img
              key={photo.fullSrc}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: loaded ? 1 : 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={photo.fullSrc}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              onLoad={() => setLoaded(true)}
              className="relative max-w-full max-h-[85vh] object-contain select-none touch-none"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center px-4">
            {photo.collection && (
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">
                {photo.collection}
              </p>
            )}
            <p className="text-white/50 text-xs font-mono">
              {(index ?? 0) + 1} / {photos.length}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
