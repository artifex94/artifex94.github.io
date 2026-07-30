import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { Typewriter } from './Typewriter';

// `onComplete` avisa que el texto quedó en su lugar DEFINITIVO, y de eso depende
// que el hero-pong mida bien: el cursor ocupa ancho y el título está centrado,
// así que mientras parpadea todo el texto está corrido unos píxeles.
describe('Typewriter onComplete', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it('en la primera visita no avisa hasta que el cursor desaparece', () => {
    const onComplete = vi.fn();
    // speed fast: la misma velocidad que usa el hero del home.
    render(<Typewriter text="Hola mundo" speed="fast" onComplete={onComplete} />);

    // Tiempo de sobra para tipear las 10 letras (10-15ms cada una), pero el
    // cursor sigue puesto y el título todavía está corrido.
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onComplete).not.toHaveBeenCalled();

    // El cursor se retira un segundo después de terminar de tipear.
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(onComplete).toHaveBeenCalled();
  });

  it('para quien ya visitó, avisa en cuanto pinta el texto completo', () => {
    sessionStorage.setItem('artifex_system_init', 'true');
    const onComplete = vi.fn();
    // speed fast: la misma velocidad que usa el hero del home.
    render(<Typewriter text="Hola mundo" speed="fast" onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(onComplete).toHaveBeenCalled();
  });

  it('no explota sin el callback', () => {
    expect(() => {
      render(<Typewriter text="Hola" />);
      act(() => {
        vi.advanceTimersByTime(2000);
      });
    }).not.toThrow();
  });
});
