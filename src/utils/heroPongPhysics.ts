// Física del hero-pong: círculo contra cajas, sin estado y sin DOM.
//
// La pelota se dibuja cuadrada (estética Pong) pero colisiona como círculo:
// contra las cajas de las letras un círculo no se traba en las esquinas.
// Todo acá es puro para poder testear el rebote sin montar un canvas.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Radio de colisión (la mitad del lado dibujado). */
  r: number;
}

export type HitSide = 'top' | 'bottom' | 'left' | 'right';

export interface Hit {
  /** Cara del rectángulo por la que entró la pelota. */
  side: HitSide;
  /** Cuánto se metió, en px: se usa para despegarla y que no quede pegada. */
  penetration: number;
}

/** Empujón extra al despegar: sin esto la pelota re-colisiona en el frame siguiente. */
const UNSTICK = 0.5;

/** Techo de sub-pasos por frame: más que esto no compra precisión, solo CPU. */
export const MAX_SUBSTEPS = 8;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Colisión círculo-AABB resuelta por el eje de MENOR penetración, que es el eje
 * por el que la pelota entró. Devuelve `null` si no se tocan.
 */
export function circleRectHit(ball: Ball, rect: Rect): Hit | null {
  const nearestX = clamp(ball.x, rect.x, rect.x + rect.w);
  const nearestY = clamp(ball.y, rect.y, rect.y + rect.h);
  const dx = ball.x - nearestX;
  const dy = ball.y - nearestY;
  if (dx * dx + dy * dy > ball.r * ball.r) return null;

  const centerX = rect.x + rect.w / 2;
  const centerY = rect.y + rect.h / 2;
  const penetrationX = rect.w / 2 + ball.r - Math.abs(ball.x - centerX);
  const penetrationY = rect.h / 2 + ball.r - Math.abs(ball.y - centerY);

  if (penetrationX < penetrationY) {
    return { side: ball.x < centerX ? 'left' : 'right', penetration: penetrationX };
  }
  return { side: ball.y < centerY ? 'top' : 'bottom', penetration: penetrationY };
}

/**
 * Rebote sobre la cara golpeada: invierte el eje, despega la pelota fuera del
 * rectángulo y escala la velocidad.
 *
 * Fuerza el signo con `Math.abs` en vez de negar: si por un sub-paso raro la
 * velocidad ya apuntaba hacia afuera, negarla la volvería a meter.
 */
export function reflect(ball: Ball, hit: Hit, speedMultiplier = 1): Ball {
  const push = hit.penetration + UNSTICK;
  const vx = ball.vx * speedMultiplier;
  const vy = ball.vy * speedMultiplier;

  switch (hit.side) {
    case 'top':
      return { ...ball, y: ball.y - push, vx, vy: -Math.abs(vy) };
    case 'bottom':
      return { ...ball, y: ball.y + push, vx, vy: Math.abs(vy) };
    case 'left':
      return { ...ball, x: ball.x - push, vx: -Math.abs(vx), vy };
    default:
      return { ...ball, x: ball.x + push, vx: Math.abs(vx), vy };
  }
}

/**
 * Rebote de paleta estilo Pong: el ángulo de salida lo decide DÓNDE pegó, no
 * la dirección de llegada. El centro devuelve vertical, los extremos abren
 * hasta `maxAngleRad`. La velocidad se conserva (acelerar es tarea del techo).
 */
export function paddleBounce(ball: Ball, paddle: Rect, maxAngleRad: number, speed: number): Ball {
  const half = paddle.w / 2;
  const offset = half > 0 ? clamp((ball.x - (paddle.x + half)) / half, -1, 1) : 0;
  const angle = offset * maxAngleRad;
  return {
    ...ball,
    y: paddle.y - ball.r - UNSTICK,
    vx: Math.sin(angle) * speed,
    vy: -Math.abs(Math.cos(angle) * speed),
  };
}

/**
 * Sub-pasos necesarios para que la pelota no atraviese el obstáculo más chico
 * de un salto. Con la velocidad creciendo en cada golpe al techo, integrar en
 * un solo paso terminaría en tunneling.
 */
export function subStepCount(speed: number, dtMs: number, minObstacleSize: number): number {
  const travel = (Math.abs(speed) * dtMs) / 1000;
  const safeStep = Math.max(minObstacleSize, 1) / 2;
  return clamp(Math.ceil(travel / safeStep), 1, MAX_SUBSTEPS);
}

/**
 * Cajas de los dígitos del contador. En monoespaciada el avance es constante,
 * así que alcanza con medir un dígito una vez y derivar el resto.
 */
export function digitBoxes(
  originX: number,
  y: number,
  count: number,
  advance: number,
  height: number,
): Rect[] {
  const boxes: Rect[] = [];
  for (let i = 0; i < count; i += 1) {
    boxes.push({ x: originX + i * advance, y, w: advance, h: height });
  }
  return boxes;
}

/** Centro de la paleta limitado a la pista, incluso si la pista es más angosta que la paleta. */
export function clampPaddleX(
  desiredCenter: number,
  halfWidth: number,
  min: number,
  max: number,
): number {
  const low = min + halfWidth;
  const high = max - halfWidth;
  if (high < low) return (min + max) / 2;
  return clamp(desiredCenter, low, high);
}
