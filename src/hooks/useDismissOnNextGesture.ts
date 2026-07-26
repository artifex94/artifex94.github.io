import { useEffect, useRef } from 'react';

/**
 * Cierra algo "efímero" en cuanto el cliente hace su próximo gesto.
 *
 * Pensado para un vistazo temporal (p. ej. maximizar el bastidor en mobile para
 * verlo en detalle): se abre con un toque y desaparece solo apenas el cliente
 * sigue interactuando —scrollea o toca cualquier cosa— para no estorbar el flujo.
 *
 * El gesto que ABRIÓ el vistazo no cuenta: los listeners se registran en el
 * siguiente tick, así el mismo `pointerdown`/click que activó `active` no lo
 * cierra de inmediato. El primer gesto posterior lo cierra (una sola vez).
 *
 * @param active    si el vistazo está abierto.
 * @param onDismiss qué hacer al primer gesto posterior (típicamente cerrarlo).
 */
export function useDismissOnNextGesture(active: boolean, onDismiss: () => void): void {
  // Ref para no re-registrar listeners si el callback cambia de identidad. Se
  // actualiza en un effect (no durante el render) para respetar react-hooks/refs.
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!active || typeof window === 'undefined') return;

    const dismiss = () => dismissRef.current();

    // Registrar en el próximo tick: el evento que abrió el vistazo ya terminó
    // de propagarse, así que no lo atrapamos.
    const timer = window.setTimeout(() => {
      window.addEventListener('scroll', dismiss, { passive: true, once: true });
      window.addEventListener('pointerdown', dismiss, { once: true });
      window.addEventListener('keydown', dismiss, { once: true });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', dismiss);
      window.removeEventListener('pointerdown', dismiss);
      window.removeEventListener('keydown', dismiss);
    };
  }, [active]);
}
