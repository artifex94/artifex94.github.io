import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Un pequeño timeout asegura que React haya terminado de montar
    // el nuevo DOM de la demo antes de forzar el scroll al inicio.
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};