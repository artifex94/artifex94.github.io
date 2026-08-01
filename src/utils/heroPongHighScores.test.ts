import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  parseHighScores,
  qualifies,
  insertScore,
  formatHighScoresMarquee,
  highScoresMarquee,
  localBestScore,
  readLastInitials,
  subscribeHighScores,
  writeGlobalScores,
  writeHighScores,
  writeLastInitials,
  DEFAULT_INITIALS,
  HIGH_SCORES_KEY,
  HIGH_SCORES_LIMIT,
  type HighScoreEntry,
} from './heroPongHighScores';

const entry = (score: number, initials = 'AAA', ts = 1): HighScoreEntry => ({
  initials,
  score,
  ts,
});

/** Tabla llena: 1000, 900, ..., 100. */
const fullList = (): HighScoreEntry[] =>
  Array.from({ length: HIGH_SCORES_LIMIT }, (_, i) => entry((10 - i) * 100, 'ABC'));

describe('parseHighScores', () => {
  it('descarta lo que no es una lista', () => {
    expect(parseHighScores(undefined)).toEqual([]);
    expect(parseHighScores(null)).toEqual([]);
    expect(parseHighScores('nope')).toEqual([]);
    expect(parseHighScores({ score: 1 })).toEqual([]);
  });

  it('filtra entradas rotas y conserva las válidas', () => {
    const parsed = parseHighScores([
      entry(500),
      { initials: 'ab', score: 300, ts: 1 }, // minúsculas: fuera
      { initials: 'ABCD', score: 300, ts: 1 }, // 4 letras: fuera
      { initials: 'XYZ', score: -5, ts: 1 }, // negativo: fuera
      { initials: 'XYZ', score: Infinity, ts: 1 }, // no finito: fuera
      'basura',
      entry(700, 'ZZZ'),
    ]);
    expect(parsed).toEqual([entry(700, 'ZZZ'), entry(500)]);
  });

  it('re-ordena por score descendente y corta al límite', () => {
    const raw = Array.from({ length: 15 }, (_, i) => entry(i + 1));
    const parsed = parseHighScores(raw);
    expect(parsed).toHaveLength(HIGH_SCORES_LIMIT);
    expect(parsed[0].score).toBe(15);
    expect(parsed[parsed.length - 1].score).toBe(6);
  });

  it('normaliza un ts inválido a 0', () => {
    const parsed = parseHighScores([{ initials: 'ABC', score: 10, ts: 'ayer' }]);
    expect(parsed).toEqual([entry(10, 'ABC', 0)]);
  });
});

describe('qualifies', () => {
  it('con lugar libre entra cualquier score positivo', () => {
    expect(qualifies([], 1)).toBe(true);
    expect(qualifies([entry(999)], 1)).toBe(true);
  });

  it('un score de cero no entra nunca', () => {
    expect(qualifies([], 0)).toBe(false);
  });

  it('con la tabla llena hay que superar al último, no empatarlo', () => {
    const list = fullList(); // el último tiene 100
    expect(qualifies(list, 101)).toBe(true);
    expect(qualifies(list, 100)).toBe(false);
    expect(qualifies(list, 99)).toBe(false);
  });
});

describe('insertScore', () => {
  it('inserta en el puesto correcto', () => {
    const { list, rank } = insertScore([entry(300), entry(100)], entry(200, 'NEW'));
    expect(rank).toBe(1);
    expect(list.map((e) => e.score)).toEqual([300, 200, 100]);
    expect(list[1].initials).toBe('NEW');
  });

  it('los empates quedan después de los existentes', () => {
    const { list, rank } = insertScore([entry(300, 'OLD'), entry(100)], entry(300, 'NEW'));
    expect(rank).toBe(1);
    expect(list[0].initials).toBe('OLD');
    expect(list[1].initials).toBe('NEW');
  });

  it('con la tabla llena desplaza al último', () => {
    const { list, rank } = insertScore(fullList(), entry(950, 'NEW'));
    expect(rank).toBe(1);
    expect(list).toHaveLength(HIGH_SCORES_LIMIT);
    expect(list[list.length - 1].score).toBe(200);
  });

  it('devuelve -1 sin tocar la tabla cuando no entra', () => {
    const list = fullList();
    const result = insertScore(list, entry(100, 'NEW'));
    expect(result.rank).toBe(-1);
    expect(result.list).toEqual(list);
  });
});

describe('iniciales recordadas', () => {
  afterEach(() => {
    localStorage.clear();
  });

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

describe('mejor marca local', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('es cero sin partidas y después el score más alto', () => {
    expect(localBestScore()).toBe(0);
    writeHighScores([entry(700, 'ABC'), entry(200, 'XYZ')]);
    expect(localBestScore()).toBe(700);
  });
});

describe('formatHighScoresMarquee', () => {
  it('sin nada que mostrar no hay ticker', () => {
    expect(formatHighScoresMarquee([])).toBe('');
    expect(formatHighScoresMarquee([], 0)).toBe('');
  });

  it('muestra la marca propia aunque no haya ranking', () => {
    expect(formatHighScoresMarquee([], 320)).toBe('TU MEJOR 320 · ');
  });

  it('arma la vuelta completa y la cierra con el separador', () => {
    expect(formatHighScoresMarquee([entry(240, 'BAA')])).toBe('TOP 10 · 1 BAA 240 · ');
  });

  it('numera del 1 al 10 sin relleno', () => {
    const text = formatHighScoresMarquee(fullList());
    expect(text.startsWith('TOP 10 · 1 ABC 1000 · ')).toBe(true);
    expect(text).toContain('· 10 ABC 100 · ');
    expect(text.endsWith(' · ')).toBe(true);
  });

  it('respeta el orden recibido: no re-ordena', () => {
    const text = formatHighScoresMarquee([entry(10, 'LOW'), entry(900, 'TOP')]);
    expect(text).toBe('TOP 10 · 1 LOW 10 · 2 TOP 900 · ');
  });

  it('encadenado con parseHighScores solo muestra lo válido', () => {
    const raw = JSON.parse('[{"initials":"ABC","score":50,"ts":1},{"initials":"nope","score":90}]');
    expect(formatHighScoresMarquee(parseHighScores(raw))).toBe('TOP 10 · 1 ABC 50 · ');
  });
});

describe('store del ticker', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('sin ranking global muestra la tabla local y la marca propia', () => {
    writeHighScores([entry(500, 'ABC')]);
    const first = highScoresMarquee();
    expect(first).toBe('TOP 10 · 1 ABC 500 · TU MEJOR 500 · ');
    // Idéntico por referencia: React lo compara en cada render.
    expect(highScoresMarquee()).toBe(first);
  });

  it('con ranking global manda el global, y la marca propia sigue siendo local', () => {
    writeHighScores([entry(500, 'ABC')]);
    writeGlobalScores([{ initials: 'ZZZ', score: 9000 }]);
    expect(highScoresMarquee()).toBe('TOP 10 · 1 ZZZ 9000 · TU MEJOR 500 · ');
  });

  it('refleja un cambio del storage aunque nadie haya emitido evento', () => {
    writeHighScores([entry(500, 'ABC')]);
    highScoresMarquee();
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify([entry(900, 'XYZ')]));
    expect(highScoresMarquee()).toBe('TOP 10 · 1 XYZ 900 · TU MEJOR 900 · ');
  });

  it('vuelve a vacío si se borra la tabla', () => {
    writeHighScores([entry(500, 'ABC')]);
    highScoresMarquee();
    localStorage.clear();
    expect(highScoresMarquee()).toBe('');
  });

  it('avisa a los suscriptos cuando se guarda un score, y deja de avisar al desuscribirse', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeHighScores(onChange);
    writeHighScores([entry(500, 'ABC')]);
    expect(onChange).toHaveBeenCalledTimes(1);
    unsubscribe();
    writeHighScores([entry(900, 'XYZ')]);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

