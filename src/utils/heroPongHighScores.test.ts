import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  parseGlobalScores,
  formatHighScoresMarquee,
  highScoresMarquee,
  readBestScore,
  readGlobalScores,
  readLastInitials,
  saveBestScore,
  subscribeHighScores,
  writeGlobalScores,
  writeLastInitials,
  BEST_SCORE_KEY,
  DEFAULT_INITIALS,
  GLOBAL_SCORES_KEY,
  type GlobalScore,
} from './heroPongHighScores';

const entry = (score: number, initials = 'ABC'): GlobalScore => ({ initials, score });

afterEach(() => {
  localStorage.clear();
});

describe('parseGlobalScores', () => {
  it('descarta lo que no es una lista', () => {
    expect(parseGlobalScores(undefined)).toEqual([]);
    expect(parseGlobalScores('nope')).toEqual([]);
    expect(parseGlobalScores({ score: 1 })).toEqual([]);
  });

  it('filtra filas rotas y conserva las válidas', () => {
    expect(
      parseGlobalScores([
        entry(500),
        { initials: 'ab', score: 300 },
        { initials: 'ABCD', score: 300 },
        { initials: 'XYZ', score: 0 },
        { initials: 'XYZ', score: Infinity },
        'basura',
        entry(700, 'ZZZ'),
      ]),
    ).toEqual([entry(500), entry(700, 'ZZZ')]);
  });

  it('respeta el orden que mandó el servidor: la tabla la ordena él', () => {
    expect(parseGlobalScores([entry(10, 'LOW'), entry(900, 'TOP')])).toEqual([
      entry(10, 'LOW'),
      entry(900, 'TOP'),
    ]);
  });
});

describe('espejo del ranking', () => {
  it('distingue "nunca consultado" de "está vacío"', () => {
    // Es la diferencia entre decir "sin conexión" y decir "todavía sin marcas".
    expect(readGlobalScores()).toBeNull();
    writeGlobalScores([]);
    expect(readGlobalScores()).toEqual([]);
    writeGlobalScores([entry(900)]);
    expect(readGlobalScores()).toEqual([entry(900)]);
  });
});

describe('la tabla local retirada', () => {
  it('se borra su clave al cargar el módulo', async () => {
    localStorage.setItem('artifex_hero_pong_top10', JSON.stringify([{ initials: 'OLD', score: 9 }]));
    vi.resetModules();
    await import('./heroPongHighScores');
    expect(localStorage.getItem('artifex_hero_pong_top10')).toBeNull();
  });
});

describe('marca personal', () => {
  it('arranca en cero y solo sube', () => {
    expect(readBestScore()).toBe(0);
    expect(saveBestScore(300)).toBe(300);
    expect(saveBestScore(120)).toBe(300);
    expect(saveBestScore(900)).toBe(900);
    expect(readBestScore()).toBe(900);
  });

  it('ignora basura guardada a mano', () => {
    localStorage.setItem(BEST_SCORE_KEY, 'muchísimo');
    expect(readBestScore()).toBe(0);
  });
});

describe('iniciales recordadas', () => {
  it('arranca en AAA y después recuerda las últimas usadas', () => {
    expect(readLastInitials()).toBe(DEFAULT_INITIALS);
    writeLastInitials('RAM');
    expect(readLastInitials()).toBe('RAM');
  });

  it('ignora cualquier cosa que no sean tres letras', () => {
    writeLastInitials('RAM');
    writeLastInitials('ram');
    writeLastInitials('RAMI');
    writeLastInitials('');
    expect(readLastInitials()).toBe('RAM');
  });
});

describe('formatHighScoresMarquee', () => {
  it('sin nada que mostrar no hay ticker', () => {
    expect(formatHighScoresMarquee(null, 0)).toBe('');
    expect(formatHighScoresMarquee([], 0)).toBe('');
  });

  it('con ranking vacío NO inventa un top: solo la marca propia', () => {
    // El bug que motivó todo esto: la tabla local salía rotulada "TOP 10" y el
    // jugador veía sus propios scores creyendo que era el ranking mundial.
    expect(formatHighScoresMarquee([], 320)).toBe('TU MEJOR 320 · ');
    expect(formatHighScoresMarquee(null, 320)).toBe('TU MEJOR 320 · ');
  });

  it('rotula el ranking como GLOBAL y numera del 1 al 10', () => {
    const top = Array.from({ length: 10 }, (_, i) => entry((10 - i) * 100));
    const text = formatHighScoresMarquee(top, 50);
    expect(text.startsWith('TOP 10 GLOBAL · 1 ABC 1000 · ')).toBe(true);
    expect(text).toContain('· 10 ABC 100 · ');
    expect(text.endsWith('TU MEJOR 50 · ')).toBe(true);
  });
});

describe('store del ticker', () => {
  it('devuelve el mismo valor mientras nada cambia', () => {
    writeGlobalScores([entry(900, 'ZZZ')]);
    saveBestScore(500);
    const first = highScoresMarquee();
    expect(first).toBe('TOP 10 GLOBAL · 1 ZZZ 900 · TU MEJOR 500 · ');
    expect(highScoresMarquee()).toBe(first);
  });

  it('se entera de un cambio de la marca propia, no solo del ranking', () => {
    writeGlobalScores([entry(900, 'ZZZ')]);
    highScoresMarquee();
    saveBestScore(700);
    expect(highScoresMarquee()).toContain('TU MEJOR 700');
  });

  it('refleja un cambio del storage aunque nadie haya emitido evento', () => {
    writeGlobalScores([entry(900, 'ZZZ')]);
    highScoresMarquee();
    localStorage.setItem(GLOBAL_SCORES_KEY, JSON.stringify([entry(10, 'AAA')]));
    expect(highScoresMarquee()).toContain('1 AAA 10');
  });

  it('avisa a los suscriptos y deja de avisar al desuscribirse', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeHighScores(onChange);
    writeGlobalScores([entry(500)]);
    expect(onChange).toHaveBeenCalledTimes(1);
    saveBestScore(120);
    expect(onChange).toHaveBeenCalledTimes(2);
    unsubscribe();
    writeGlobalScores([entry(900)]);
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
