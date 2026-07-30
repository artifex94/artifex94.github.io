import { useEffect, useState } from 'react';

/** Breakpoint `md` de Tailwind: debajo de esto el sitio está en su versión móvil. */
export const MOBILE_QUERY = '(max-width: 767px)';

/**
 * Viewport móvil, reactivo a rotación y resize.
 *
 * Arranca en `false` a propósito: en el primer render (y en el prerender por
 * Chromium, que corre en viewport desktop) no hay forma de saberlo, y es más
 * seguro no montar nada que montar y desmontar.
 */
export const useIsMobile = (query: string = MOBILE_QUERY): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(query);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);

  return isMobile;
};
