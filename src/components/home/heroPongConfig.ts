// Medidas y tuning del hero-pong, en un solo lugar: las comparten el band (que
// dibuja el reposo en DOM) y el engine (que dibuja la partida en canvas), así no
// hay dos fuentes de verdad para la geometría.

/** Alto de la franja de juego: es exactamente el `gap-16` que el home ya deja vacío. */
export const BAND_HEIGHT = 64;

export const PADDLE_WIDTH = 64;
export const PADDLE_HEIGHT = 4;
/** Distancia del tope de la franja a la paleta: la deja centrada en el hueco. */
export const PADDLE_TOP = 30;

export const BALL_SIZE = 8;
export const BALL_RADIUS = BALL_SIZE / 2;

/** Velocidad inicial, en px/s. */
export const START_SPEED = 300;
/** Cuánto acelera por cada nivel Fibonacci de golpes al header (1, 2, 3, 5, 8, ...). */
export const SPEED_STEP = 1.12;
/** Techo de velocidad: sin esto la pelota terminaría atravesando las letras. */
export const MAX_SPEED = 1300;
/** Apertura máxima del rebote en la paleta (60°). */
export const MAX_BOUNCE_ANGLE = Math.PI / 3;

/** Margen del HUD, alineado con el `px-4` de la página. */
export const HUD_INSET = 16;
export const HUD_FONT_SIZE = 12;
/** Distancia del borde inferior del header a la línea de base del HUD. */
export const HUD_TOP_GAP = 22;

/**
 * Cuánto puede invadir el padding lateral una letra desplazada. El home tiene
 * `px-4` (16px), así que 12px se mantiene dentro de la pantalla.
 */
export const DODGE_OVERFLOW = 12;
/** Aire vertical extra para que una línea empiece a esquivar antes del contacto. */
export const DODGE_GATE_PAD = 8;

/* --- Ticker del top-10: la fila que desfila debajo de la paleta, en reposo --- */

/** La paleta termina en 34 (PADDLE_TOP + PADDLE_HEIGHT): el ticker va debajo. */
export const MARQUEE_TOP = 46;
export const MARQUEE_HEIGHT = 12;
/** Más chico que el HUD (12): el ticker es un detalle, no información de partida. */
export const MARQUEE_FONT_SIZE = 10;
/** Avance nominal de un carácter mono a MARQUEE_FONT_SIZE (0.6em). */
export const MARQUEE_CHAR_WIDTH = 6;
/** Velocidad del desfile, en px/s. */
export const MARQUEE_SPEED = 32;
/**
 * Ancho que media vuelta tiene que cubrir sí o sí. 768 es el breakpoint `md`:
 * arriba de eso la franja no existe, así que sirve para cualquier viewport y
 * cualquier orientación sin leer el DOM ni escuchar `resize`.
 */
export const MARQUEE_COVER_WIDTH = 768;

/**
 * Cuántas copias de la secuencia entran en media vuelta del track.
 *
 * El track se duplica y viaja -50%: la mitad tiene que ser MÁS ANCHA que la
 * franja o queda un hueco al final de cada vuelta. Con una sola entrada
 * ("TOP 10 · 1 BAA 240 · ", ~22 chars ≈ 132px) hacen falta ~7 copias para tapar
 * los 768px, y ese es el caso normal: el del primer score registrado.
 *
 * La `+1` cubre el error de MARQUEE_CHAR_WIDTH: la pila de fuentes mono va de
 * 0.55em (Consolas) a 0.602em (Menlo). No afecta la velocidad percibida, porque
 * la duración se deriva de este mismo número.
 */
export const marqueeCopies = (length: number): number =>
  length > 0 ? Math.ceil(MARQUEE_COVER_WIDTH / (length * MARQUEE_CHAR_WIDTH)) + 1 : 0;

/**
 * Cuánto tarda una vuelta, en segundos. Una vuelta es MEDIA anchura del track
 * (el -50% del keyframe), así que el desfile mantiene la misma velocidad en
 * px/s con uno o con diez scores.
 */
export const marqueeDuration = (length: number): number =>
  (marqueeCopies(length) * length * MARQUEE_CHAR_WIDTH) / MARQUEE_SPEED;

/** Gravedad de las letras que vuelven a su lugar, en px/s². */
export const LETTER_FALL_GRAVITY = 900;
/** Velocidad inicial de caída, para que no arranque congelada. */
export const LETTER_FALL_START = 60;
