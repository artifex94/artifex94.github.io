/** Alto del header sticky del sitio (`h-16` en Navbar.tsx). */
export const NAV_HEIGHT = 64;

/**
 * Borde inferior real del header, en coordenadas de viewport.
 *
 * Mide la barra interna (`nav > div`), NO el `<nav>`: el nav contiene además el
 * panel del menú móvil, así que su rect crece cuando el menú está abierto.
 * Sin DOM (o sin header) devuelve el alto nominal.
 */
export const measureNavBottom = (): number => {
  if (typeof document === 'undefined') return NAV_HEIGHT;
  const bar = document.querySelector('nav > div');
  if (!bar) return NAV_HEIGHT;
  return bar.getBoundingClientRect().bottom;
};
