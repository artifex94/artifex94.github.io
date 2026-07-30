import React from 'react';
import { useReducedMotion } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  BALL_SIZE,
  BAND_HEIGHT,
  PADDLE_HEIGHT,
  PADDLE_TOP,
  PADDLE_WIDTH,
} from './heroPongConfig';

// La franja del hero-pong: una paleta y una pelota, nada más.
//
// Vive DENTRO de la <section> del hero, posicionada en absoluto sobre el
// `gap-16` que el home ya deja vacío entre el hero y las cards. Es la única
// forma de agregarla sin correr nada: un hermano más en el flex-col sumaría
// otro gap de 64px y empujaría toda la página.
//
// Solo móvil, y nunca con prefers-reduced-motion: una pelota rebotando es
// movimiento, y ahí el sitio tiene que quedar exactamente como está.

export const HeroPongBand: React.FC = () => {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();

  if (!isMobile || reduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      // md:hidden además del gate por JS: si el viewport cruza el breakpoint
      // antes de que corra el efecto, el CSS ya la esconde.
      className="md:hidden absolute left-0 right-0 top-full select-none"
      style={{ height: BAND_HEIGHT, touchAction: 'pan-y' }}
    >
      <div
        className="absolute bg-secondary"
        style={{
          width: PADDLE_WIDTH,
          height: PADDLE_HEIGHT,
          top: PADDLE_TOP,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      <div
        className="absolute bg-secondary"
        style={{
          width: BALL_SIZE,
          height: BALL_SIZE,
          top: PADDLE_TOP - BALL_SIZE,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
};
