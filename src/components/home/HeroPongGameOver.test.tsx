import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HeroPongGameOver } from './HeroPongGameOver';
import { GLOBAL_SCORES_KEY, readBestScore } from '../../utils/heroPongHighScores';
import type { HeroPongSummary } from '../../utils/heroPongState';

// Este archivo existe por un bug que llegó a producción: después de registrar un
// score aparecía la tabla y enseguida volvía a pedir las iniciales, así que el
// jugador cargaba la MISMA partida dos veces. La causa era la consulta del
// ranking hecha al abrir la pantalla: resolvía DESPUÉS del registro, con la
// tabla vieja, y devolvía la vista a las iniciales.

const summary: HeroPongSummary = {
  score: 450,
  ceilingHits: 50,
  lettersDestroyed: 4,
  boardsCleared: 0,
  // Fraccionario a propósito: es como lo produce requestAnimationFrame.
  elapsedMs: 42318.399999,
};

/** Una promesa que se resuelve cuando el test lo decide. */
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

const okJson = (body: unknown) => ({ ok: true, json: () => Promise.resolve(body) });

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('registro del score', () => {
  it('no vuelve a pedir iniciales cuando el ranking contesta tarde', async () => {
    const late = deferred<unknown>();
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      // El GET del montaje queda pendiente; el POST del registro contesta ya.
      if (!init || init.method === 'GET') return late.promise;
      return Promise.resolve(okJson({ top: [{ initials: 'AAA', score: 450 }], rank: 0 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const { baseElement } = render(<HeroPongGameOver summary={summary} onClose={() => {}} />);

    // Con el espejo vacío la marca entra, así que se ofrecen las iniciales.
    const ok = await screen.findByRole('button', { name: 'OK' });
    fireEvent.click(ok);

    // Registrada: aparece la tabla.
    await waitFor(() => expect(screen.queryByRole('button', { name: 'OK' })).toBeNull());

    // Recién ahora contesta el GET del montaje, con la tabla PREVIA al registro.
    late.resolve(okJson({ top: [] }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    // La pantalla no puede volver a pedir iniciales ni perder la tabla nueva.
    expect(screen.queryByRole('button', { name: 'OK' })).toBeNull();
    expect(baseElement.textContent).toContain('AAA');
    expect(baseElement.textContent).not.toContain('todavía sin marcas');
  });

  it('manda la partida una sola vez aunque se toque OK dos veces', async () => {
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (!init || init.method === 'GET') return Promise.resolve(okJson({ top: [] }));
      return Promise.resolve(okJson({ top: [{ initials: 'AAA', score: 450 }], rank: 0 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<HeroPongGameOver summary={summary} onClose={() => {}} />);
    const ok = await screen.findByRole('button', { name: 'OK' });
    fireEvent.click(ok);
    fireEvent.click(ok);

    await waitFor(() => expect(screen.queryByRole('button', { name: 'OK' })).toBeNull());
    const posts = fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');
    expect(posts).toHaveLength(1);
  });

  it('guarda la marca personal aunque el ranking no responda', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    render(<HeroPongGameOver summary={summary} onClose={() => {}} />);
    fireEvent.click(await screen.findByRole('button', { name: 'OK' }));

    await waitFor(() => expect(readBestScore()).toBe(450));
    expect(screen.getByText('TU MEJOR')).toBeTruthy();
  });

  it('con el ranking vacío lo dice, en vez de mostrar datos propios como ranking', async () => {
    localStorage.setItem(GLOBAL_SCORES_KEY, JSON.stringify([]));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okJson({ top: [] })));

    // Una partida de un segundo no es registrable: va derecho a la tabla.
    render(<HeroPongGameOver summary={{ ...summary, elapsedMs: 900 }} onClose={() => {}} />);

    expect(screen.queryByRole('button', { name: 'OK' })).toBeNull();
    expect(screen.getByText('todavía sin marcas')).toBeTruthy();
  });
});
