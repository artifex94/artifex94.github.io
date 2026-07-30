import { describe, it, expect } from 'vitest';
import {
  buildDodgeLut,
  dodgeOffsetAt,
  verticalGate,
  DEFAULT_DODGE_CONFIG,
  type DodgeConfig,
  type GlyphMetric,
} from './heroDodge';

// Una línea monoespaciada de 10 glifos de 20px, arrancando en x=0.
const makeLine = (count = 10, line = 0, advance = 20): GlyphMetric[] =>
  Array.from({ length: count }, (_, i) => ({
    char: 'x',
    line,
    x: i * advance,
    y: line * 40,
    w: advance,
    h: 30,
  }));

const config = (over: Partial<DodgeConfig> = {}): DodgeConfig => ({
  ...DEFAULT_DODGE_CONFIG,
  track: [0, 200],
  bounds: [-40, 240],
  ...over,
});

describe('buildDodgeLut', () => {
  it('dimensiona la tabla como glifos × columnas', () => {
    const glyphs = makeLine();
    const cfg = config({ columns: 16 });
    expect(buildDodgeLut(glyphs, [200], cfg)).toHaveLength(10 * 16);
  });

  it('no mueve las letras lejos del obstáculo', () => {
    const glyphs = makeLine();
    const cfg = config({ falloff: 40 });
    const lut = buildDodgeLut(glyphs, [200], cfg);
    // Obstáculo al inicio del recorrido (t=0, x=0): el último glifo está a 190px.
    expect(dodgeOffsetAt(lut, cfg.columns, 9, 0)).toBe(0);
  });

  it('empuja hacia afuera: a la izquierda del obstáculo se va a la izquierda', () => {
    const glyphs = makeLine();
    const cfg = config();
    const lut = buildDodgeLut(glyphs, [200], cfg);
    // Obstáculo al medio del recorrido (t=0.5 ⇒ x=100).
    const left = dodgeOffsetAt(lut, cfg.columns, 3, 0.5); // centro 70
    const right = dodgeOffsetAt(lut, cfg.columns, 6, 0.5); // centro 130
    expect(left).toBeLessThan(0);
    expect(right).toBeGreaterThan(0);
  });

  it('es simétrico respecto del obstáculo', () => {
    const glyphs = makeLine();
    const cfg = config();
    const lut = buildDodgeLut(glyphs, [400], cfg);
    const left = dodgeOffsetAt(lut, cfg.columns, 3, 0.5);
    const right = dodgeOffsetAt(lut, cfg.columns, 6, 0.5);
    expect(Math.abs(left)).toBeCloseTo(Math.abs(right), 4);
  });

  it('decae de forma monótona al alejarse del obstáculo', () => {
    const glyphs = makeLine(10, 0, 10);
    const cfg = config({ falloff: 100, track: [0, 100], bounds: [-100, 200] });
    const lut = buildDodgeLut(glyphs, [400], cfg);
    // Obstáculo en x=0: los glifos a la derecha se alejan progresivamente.
    const shifts = [2, 4, 6, 8].map((g) => dodgeOffsetAt(lut, cfg.columns, g, 0));
    for (let i = 1; i < shifts.length; i += 1) {
      expect(shifts[i]).toBeLessThanOrEqual(shifts[i - 1] + 1e-6);
    }
  });

  it('abre un hueco cómodo para el paso de la pelota', () => {
    const BALL_SIZE = 8;
    const glyphs = makeLine(10, 0, 20);
    const cfg = config();
    const lut = buildDodgeLut(glyphs, [400], cfg);
    // Obstáculo justo entre el glifo 4 (80..100) y el 5 (100..120).
    const t = (100 - cfg.track[0]) / (cfg.track[1] - cfg.track[0]);
    const leftEdge = glyphs[4].x + glyphs[4].w + dodgeOffsetAt(lut, cfg.columns, 4, t);
    const rightEdge = glyphs[5].x + dodgeOffsetAt(lut, cfg.columns, 5, t);
    // El suavizado hace que el hueco real sea algo menor que `corridor`; lo que
    // importa es que la pelota pase con aire de sobra.
    expect(rightEdge - leftEdge).toBeGreaterThanOrEqual(BALL_SIZE * 2);
    expect(rightEdge - leftEdge).toBeLessThanOrEqual(cfg.corridor + 0.001);
  });

  it('recorre el desplazamiento sin saltos (nada de teleports visibles)', () => {
    const glyphs = makeLine(12, 0, 20);
    const maxJump = (columns: number): number => {
      const cfg = config({ columns, track: [0, 240], bounds: [-40, 280] });
      const lut = buildDodgeLut(glyphs, [400], cfg);
      let worst = 0;
      for (let g = 0; g < glyphs.length; g += 1) {
        for (let k = 1; k < columns; k += 1) {
          const previous = dodgeOffsetAt(lut, columns, g, (k - 1) / (columns - 1));
          const current = dodgeOffsetAt(lut, columns, g, k / (columns - 1));
          worst = Math.max(worst, Math.abs(current - previous));
        }
      }
      return worst;
    };
    // Con un perfil continuo, refinar la resolución reduce el salto máximo de
    // forma proporcional. Una discontinuidad lo dejaría igual sin importar la
    // cantidad de columnas — que es justo el glitch que hay que evitar.
    const coarse = maxJump(16);
    const fine = maxJump(64);
    expect(fine).toBeLessThan(coarse * 0.5);
  });

  it('nunca saca un glifo de los límites duros', () => {
    const glyphs = makeLine(10, 0, 20);
    const cfg = config({ bounds: [0, 200], corridor: 60, maxShift: 60, falloff: 200 });
    const lut = buildDodgeLut(glyphs, [400], cfg);
    for (let g = 0; g < glyphs.length; g += 1) {
      for (let k = 0; k < cfg.columns; k += 1) {
        const t = k / (cfg.columns - 1);
        const dx = dodgeOffsetAt(lut, cfg.columns, g, t);
        expect(glyphs[g].x + dx).toBeGreaterThanOrEqual(cfg.bounds[0] - 0.001);
        expect(glyphs[g].x + glyphs[g].w + dx).toBeLessThanOrEqual(cfg.bounds[1] + 0.001);
      }
    }
  });

  it('sin aire ni desborde permitido, la línea no se mueve de su caja', () => {
    const glyphs = makeLine(10, 0, 20); // ocupa 0..200
    const cfg = config({ bounds: [-40, 240], corridor: 40, maxShift: 40, overflow: 0 });
    const lut = buildDodgeLut(glyphs, [0], cfg);
    for (let k = 0; k < cfg.columns; k += 1) {
      const t = k / (cfg.columns - 1);
      expect(glyphs[0].x + dodgeOffsetAt(lut, cfg.columns, 0, t)).toBeGreaterThanOrEqual(-0.001);
      expect(glyphs[9].x + glyphs[9].w + dodgeOffsetAt(lut, cfg.columns, 9, t)).toBeLessThanOrEqual(200.001);
    }
  });

  it('el desborde permitido deja esquivar incluso a una línea llena', () => {
    // El eyebrow del hero ocupa todo el ancho: sin desborde no esquivaría nada.
    const glyphs = makeLine(10, 0, 20);
    const cfg = config({ bounds: [-40, 240], overflow: 12 });
    const lut = buildDodgeLut(glyphs, [0], cfg);
    let worst = 0;
    for (let k = 0; k < cfg.columns; k += 1) {
      const t = k / (cfg.columns - 1);
      worst = Math.max(worst, Math.abs(dodgeOffsetAt(lut, cfg.columns, 9, t)));
      // Nunca más allá del desborde permitido.
      expect(glyphs[9].x + glyphs[9].w + dodgeOffsetAt(lut, cfg.columns, 9, t)).toBeLessThanOrEqual(212.001);
    }
    expect(worst).toBeGreaterThan(6);
  });

  it('trata cada línea con su propio aire', () => {
    // Dos líneas idénticas (0..100), una sin aire y otra con aire de sobra.
    const glyphs = [...makeLine(5, 0, 20), ...makeLine(5, 1, 20)];
    const cfg = config({ overflow: 0 });
    const lut = buildDodgeLut(glyphs, [0, 400], cfg);
    // Obstáculo en x=77, a `spread` del centro del último glifo (90): es donde
    // el empuje hacia la derecha es máximo.
    const t = 77 / 200;
    const tight = dodgeOffsetAt(lut, cfg.columns, 4, t); // línea sin aire
    const loose = dodgeOffsetAt(lut, cfg.columns, 9, t); // línea con aire
    expect(loose).toBeGreaterThan(0);
    expect(tight).toBe(0);
  });

  it('no explota sin glifos', () => {
    expect(buildDodgeLut([], [], config())).toHaveLength(0);
  });
});

describe('dodgeOffsetAt', () => {
  it('coincide con la tabla en los bordes del recorrido', () => {
    const glyphs = makeLine();
    const cfg = config({ columns: 8 });
    const lut = buildDodgeLut(glyphs, [200], cfg);
    expect(dodgeOffsetAt(lut, cfg.columns, 4, 0)).toBeCloseTo(lut[4 * cfg.columns], 5);
    expect(dodgeOffsetAt(lut, cfg.columns, 4, 1)).toBeCloseTo(lut[4 * cfg.columns + cfg.columns - 1], 5);
  });

  it('interpola entre dos columnas', () => {
    const lut = new Float32Array([0, 10, 20, 30]);
    expect(dodgeOffsetAt(lut, 4, 0, 1 / 3)).toBeCloseTo(10);
    expect(dodgeOffsetAt(lut, 4, 0, 0.5)).toBeCloseTo(15);
  });

  it('acota t fuera de rango', () => {
    const lut = new Float32Array([5, 10]);
    expect(dodgeOffsetAt(lut, 2, 0, -3)).toBe(5);
    expect(dodgeOffsetAt(lut, 2, 0, 9)).toBe(10);
  });
});

describe('verticalGate', () => {
  it('es cero cuando la pelota está fuera de la banda', () => {
    expect(verticalGate(0, 100, 130, 4, 6)).toBe(0);
    expect(verticalGate(400, 100, 130, 4, 6)).toBe(0);
  });

  it('vale uno en el centro de la banda', () => {
    expect(verticalGate(115, 100, 130, 4, 6)).toBeCloseTo(1);
  });

  it('crece de forma monótona al acercarse al centro', () => {
    const samples = [92, 100, 108, 115].map((y) => verticalGate(y, 100, 130, 4, 6));
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1]);
    }
  });

  it('siempre queda entre 0 y 1', () => {
    for (let y = 60; y < 180; y += 3) {
      const gate = verticalGate(y, 100, 130, 4, 6);
      expect(gate).toBeGreaterThanOrEqual(0);
      expect(gate).toBeLessThanOrEqual(1);
    }
  });

  it('devuelve cero con una banda degenerada', () => {
    expect(verticalGate(10, 100, 100, 0, 0)).toBe(0);
  });
});
