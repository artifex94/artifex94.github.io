import { describe, it, expect } from 'vitest';
import {
  circleRectHit,
  reflect,
  paddleBounce,
  subStepCount,
  digitBoxes,
  clampPaddleX,
  MAX_SUBSTEPS,
  type Ball,
  type Rect,
} from './heroPongPhysics';

const ball = (over: Partial<Ball> = {}): Ball => ({ x: 0, y: 0, vx: 0, vy: 0, r: 4, ...over });
const rect = (over: Partial<Rect> = {}): Rect => ({ x: 0, y: 0, w: 20, h: 20, ...over });

describe('circleRectHit', () => {
  it('no reporta contacto cuando la pelota está lejos', () => {
    expect(circleRectHit(ball({ x: 100, y: 100 }), rect())).toBeNull();
  });

  it('detecta la cara superior cuando la pelota baja sobre el rectángulo', () => {
    const hit = circleRectHit(ball({ x: 10, y: -2, vy: 200 }), rect());
    expect(hit?.side).toBe('top');
    expect(hit?.penetration).toBeCloseTo(2);
  });

  it('detecta la cara inferior cuando la pelota sube contra el rectángulo', () => {
    const hit = circleRectHit(ball({ x: 10, y: 22, vy: -200 }), rect());
    expect(hit?.side).toBe('bottom');
  });

  it('elige el eje horizontal cuando entra de costado', () => {
    expect(circleRectHit(ball({ x: -2, y: 10 }), rect())?.side).toBe('left');
    expect(circleRectHit(ball({ x: 22, y: 10 }), rect())?.side).toBe('right');
  });

  it('en una esquina resuelve por el eje de menor penetración', () => {
    // Apenas afuera en X y bien afuera en Y ⇒ el eje de entrada es el vertical.
    const hit = circleRectHit(ball({ x: -1, y: -3.5 }), rect());
    expect(hit?.side).toBe('top');
  });

  it('roza la esquina sin tocarla', () => {
    // Distancia a la esquina (0,0) = √(9+9) ≈ 4.24 > r = 4.
    expect(circleRectHit(ball({ x: -3, y: -3 }), rect())).toBeNull();
  });

  it('reporta contacto con el centro dentro del rectángulo', () => {
    expect(circleRectHit(ball({ x: 10, y: 10 }), rect())).not.toBeNull();
  });

  it('funciona con cajas finitas de una letra', () => {
    const glyph = rect({ x: 100, y: 50, w: 12, h: 26 });
    expect(circleRectHit(ball({ x: 106, y: 47 }), glyph)?.side).toBe('top');
    expect(circleRectHit(ball({ x: 106, y: 20 }), glyph)).toBeNull();
  });
});

describe('reflect', () => {
  it('invierte el eje vertical y despega la pelota del rectángulo', () => {
    const before = ball({ x: 10, y: -2, vy: 300 });
    const hit = circleRectHit(before, rect())!;
    const after = reflect(before, hit);
    expect(after.vy).toBeLessThan(0);
    expect(after.y).toBeLessThan(before.y);
    // Despegada: ya no colisiona.
    expect(circleRectHit(after, rect())).toBeNull();
  });

  it('invierte el eje horizontal sin tocar el vertical', () => {
    const before = ball({ x: -2, y: 10, vx: 200, vy: 100 });
    const after = reflect(before, circleRectHit(before, rect())!);
    expect(after.vx).toBeLessThan(0);
    expect(after.vy).toBe(100);
  });

  it('aplica el multiplicador de velocidad', () => {
    const before = ball({ x: 10, y: -2, vx: 100, vy: 200 });
    const after = reflect(before, circleRectHit(before, rect())!, 2);
    expect(after.vx).toBe(200);
    expect(Math.abs(after.vy)).toBe(400);
  });

  it('no re-mete la pelota si ya venía saliendo', () => {
    const before = ball({ x: 10, y: -2, vy: -300 });
    const after = reflect(before, circleRectHit(before, rect())!);
    expect(after.vy).toBeLessThan(0);
  });
});

describe('paddleBounce', () => {
  const paddle = rect({ x: 100, y: 500, w: 64, h: 4 });
  const MAX_ANGLE = Math.PI / 3;

  it('devuelve la pelota casi vertical si pega en el centro', () => {
    const out = paddleBounce(ball({ x: 132, y: 498, vy: 300 }), paddle, MAX_ANGLE, 400);
    expect(out.vx).toBeCloseTo(0);
    expect(out.vy).toBeCloseTo(-400);
  });

  it('abre el ángulo hacia el lado del impacto', () => {
    const left = paddleBounce(ball({ x: 100, y: 498 }), paddle, MAX_ANGLE, 400);
    const right = paddleBounce(ball({ x: 164, y: 498 }), paddle, MAX_ANGLE, 400);
    expect(left.vx).toBeLessThan(0);
    expect(right.vx).toBeGreaterThan(0);
    expect(left.vx).toBeCloseTo(-right.vx);
  });

  it('nunca deja la pelota horizontal ni la manda hacia abajo', () => {
    for (const x of [90, 100, 116, 132, 150, 164, 180]) {
      const out = paddleBounce(ball({ x, y: 498 }), paddle, MAX_ANGLE, 400);
      expect(out.vy).toBeLessThan(0);
      // cos(60°) = 0.5 ⇒ al menos la mitad de la velocidad sigue siendo vertical.
      expect(Math.abs(out.vy)).toBeGreaterThanOrEqual(400 * 0.5 - 0.001);
    }
  });

  it('conserva el módulo de la velocidad', () => {
    const out = paddleBounce(ball({ x: 150, y: 498 }), paddle, MAX_ANGLE, 400);
    expect(Math.hypot(out.vx, out.vy)).toBeCloseTo(400);
  });

  it('sube la pelota por encima de la paleta', () => {
    const out = paddleBounce(ball({ x: 132, y: 502 }), paddle, MAX_ANGLE, 400);
    expect(out.y).toBeLessThan(paddle.y);
  });
});

describe('subStepCount', () => {
  it('usa un solo paso a velocidad baja', () => {
    expect(subStepCount(200, 16.7, 26)).toBe(1);
  });

  it('agrega pasos cuando el recorrido supera medio obstáculo', () => {
    expect(subStepCount(1300, 16.7, 26)).toBeGreaterThan(1);
  });

  it('cubre el recorrido de un frame a velocidad máxima', () => {
    const speed = 1300;
    const dt = 32;
    const minSize = 12;
    const steps = subStepCount(speed, dt, minSize);
    const perStep = (speed * dt) / 1000 / steps;
    expect(perStep).toBeLessThanOrEqual(minSize / 2 + 0.001);
  });

  it('nunca baja de 1 ni pasa del techo', () => {
    expect(subStepCount(0, 16.7, 26)).toBe(1);
    expect(subStepCount(100000, 32, 4)).toBe(MAX_SUBSTEPS);
  });
});

describe('digitBoxes', () => {
  it('genera cajas contiguas de ancho constante', () => {
    const boxes = digitBoxes(16, 80, 3, 9, 14);
    expect(boxes).toHaveLength(3);
    expect(boxes[0]).toEqual({ x: 16, y: 80, w: 9, h: 14 });
    expect(boxes[2].x).toBe(16 + 18);
    expect(boxes[1].x).toBe(boxes[0].x + boxes[0].w);
  });

  it('devuelve vacío sin dígitos', () => {
    expect(digitBoxes(16, 80, 0, 9, 14)).toEqual([]);
  });
});

describe('clampPaddleX', () => {
  it('mantiene la paleta dentro de la pista', () => {
    expect(clampPaddleX(-50, 32, 0, 390)).toBe(32);
    expect(clampPaddleX(500, 32, 0, 390)).toBe(358);
    expect(clampPaddleX(200, 32, 0, 390)).toBe(200);
  });

  it('centra la paleta si no entra en la pista', () => {
    expect(clampPaddleX(10, 100, 0, 100)).toBe(50);
  });
});
