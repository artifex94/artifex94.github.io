import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  fetchGlobalTop,
  qualifiesGlobal,
  submitGlobalScore,
  type GlobalScore,
} from './heroPongLeaderboard';
import type { HeroPongSummary } from './heroPongState';

const summary: HeroPongSummary = {
  score: 450,
  ceilingHits: 50,
  lettersDestroyed: 4,
  boardsCleared: 0,
  elapsedMs: 42_000,
};

const mockFetch = (implementation: () => Promise<unknown> | never): void => {
  vi.stubGlobal('fetch', vi.fn().mockImplementation(implementation));
};

const ok = (body: unknown) => ({
  ok: true,
  json: () => Promise.resolve(body),
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fetchGlobalTop', () => {
  it('devuelve la tabla que sirvió el servidor', async () => {
    mockFetch(() => Promise.resolve(ok({ top: [{ initials: 'ABC', score: 900 }] })));
    expect(await fetchGlobalTop()).toEqual([{ initials: 'ABC', score: 900 }]);
  });

  it('descarta filas rotas sin tirar abajo la tabla', async () => {
    mockFetch(() =>
      Promise.resolve(
        ok({
          top: [
            { initials: 'ABC', score: 900 },
            { initials: 'ab', score: 800 },
            { initials: 'XYZ', score: 'mucho' },
            null,
          ],
        }),
      ),
    );
    expect(await fetchGlobalTop()).toEqual([{ initials: 'ABC', score: 900 }]);
  });

  it('devuelve null si la red falla, para poder caer a lo local', async () => {
    mockFetch(() => Promise.reject(new Error('offline')));
    expect(await fetchGlobalTop()).toBeNull();
  });

  it('devuelve null ante una respuesta con error o sin forma esperada', async () => {
    mockFetch(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }));
    expect(await fetchGlobalTop()).toBeNull();
    mockFetch(() => Promise.resolve(ok({ nope: true })));
    expect(await fetchGlobalTop()).toBeNull();
  });
});

describe('submitGlobalScore', () => {
  it('manda la traza cruda de la partida, no solo el score', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ top: [], rank: -1 }));
    vi.stubGlobal('fetch', fetchMock);

    await submitGlobalScore('RAM', summary);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      initials: 'RAM',
      score: 450,
      ceilingHits: 50,
      lettersDestroyed: 4,
      boardsCleared: 0,
      elapsedMs: 42_000,
    });
  });

  it('devuelve la tabla actualizada y el puesto', async () => {
    mockFetch(() => Promise.resolve(ok({ top: [{ initials: 'RAM', score: 450 }], rank: 0 })));
    expect(await submitGlobalScore('RAM', summary)).toEqual({
      top: [{ initials: 'RAM', score: 450 }],
      rank: 0,
    });
  });

  it('trata un rank ausente como "no clasificó"', async () => {
    mockFetch(() => Promise.resolve(ok({ top: [] })));
    expect(await submitGlobalScore('RAM', summary)).toEqual({ top: [], rank: -1 });
  });

  it('devuelve null si el ranking no está disponible', async () => {
    mockFetch(() => Promise.reject(new Error('offline')));
    expect(await submitGlobalScore('RAM', summary)).toBeNull();
  });
});

describe('qualifiesGlobal', () => {
  const full = (): GlobalScore[] =>
    Array.from({ length: 10 }, (_, i) => ({ initials: 'ABC', score: (10 - i) * 100 }));

  it('con lugar libre entra cualquier score positivo', () => {
    expect(qualifiesGlobal([], 1)).toBe(true);
    expect(qualifiesGlobal([], 0)).toBe(false);
  });

  it('con la tabla llena hay que superar al último, no empatarlo', () => {
    expect(qualifiesGlobal(full(), 101)).toBe(true);
    expect(qualifiesGlobal(full(), 100)).toBe(false);
  });
});
