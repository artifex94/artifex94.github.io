import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/render';
import { Home } from './Home';
import { services } from '../data/services';

// Estos tests son el guardián del requisito duro del hero-pong: en reposo el
// home tiene que ser EXACTAMENTE el de antes. jsdom reporta matchMedia con
// matches:false (src/test/setup.ts), así que acá el juego nunca se monta —
// que es justo el estado que hay que blindar.
describe('Home en reposo (el juego no debe existir)', () => {
  // Visitante recurrente: Typewriter pinta el título completo de una y sin
  // cursor, igual que en el prerender (scripts/prerender.mjs).
  beforeEach(() => {
    sessionStorage.setItem('artifex_system_init', 'true');
  });

  it('deja el título como un único nodo de texto, sin partir en glifos', () => {
    renderWithProviders(<Home />);
    const h1 = screen.getByRole('heading', { level: 1 });
    // Typewriter mete un <span>; adentro solo puede haber texto.
    const inner = h1.querySelector('span');
    expect(inner).not.toBeNull();
    expect(inner!.querySelectorAll('span').length).toBe(0);
    expect(h1.textContent).toBe('Un taller, tres oficios.');
  });

  it('no deja capas aria-hidden ni canvas en el hero', () => {
    const { container } = renderWithProviders(<Home />);
    const hero = container.querySelector('section');
    expect(hero).not.toBeNull();
    expect(hero!.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('no toca la visibilidad ni el flujo del texto del hero', () => {
    const { container } = renderWithProviders(<Home />);
    const hero = container.querySelector('section')!;
    for (const el of hero.querySelectorAll('span, p, h1')) {
      const style = (el as HTMLElement).style;
      expect(style.display).toBe('');
      expect(style.position).toBe('');
      expect(style.visibility).toBe('');
      expect(style.color).toBe('');
    }
    // sr-only colapsaría la caja del bloque y correría todo lo de abajo.
    expect(hero.innerHTML).not.toContain('sr-only');
  });

  it('mantiene el grid de servicios como hermano directo del hero', () => {
    const { container } = renderWithProviders(<Home />);
    const column = container.querySelector('.max-w-6xl');
    expect(column).not.toBeNull();
    // El juego NO puede agregar un hijo acá: el flex-col tiene gap-16 y un
    // hermano más correría todo 64px hacia abajo.
    const sections = column!.querySelectorAll(':scope > section');
    expect(sections.length).toBe(4);
    expect(column!.children.length).toBe(4);
  });

  it('conserva el orden móvil de las cards (tufting, fotografía, desarrollo)', () => {
    const { container } = renderWithProviders(<Home />);
    const grid = container.querySelectorAll('section')[1];
    const order = [...grid.children].map((card) => {
      const href = card.querySelector('a')!.getAttribute('href');
      return services.find((s) => s.href === href)!.id;
    });
    // El DOM mantiene el orden del array; el reordenamiento es CSS puro.
    expect(order).toEqual(['desarrollo', 'fotografia', 'tufting']);
    const orderClasses = [...grid.children].map((card) => card.className);
    expect(orderClasses[0]).toContain('order-3');
    expect(orderClasses[1]).toContain('order-2');
    expect(orderClasses[2]).toContain('order-1');
    orderClasses.forEach((cls) => expect(cls).toContain('md:order-none'));
  });
});
