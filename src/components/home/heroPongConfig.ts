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
/** Cuánto acelera con cada golpe al borde del header. */
export const SPEED_STEP = 1.07;
/** Techo de velocidad: sin esto la pelota terminaría atravesando las letras. */
export const MAX_SPEED = 1300;
/** Apertura máxima del rebote en la paleta (60°). */
export const MAX_BOUNCE_ANGLE = Math.PI / 3;

/** Margen del HUD, alineado con el `px-4` de la página. */
export const HUD_INSET = 16;
export const HUD_FONT_SIZE = 12;
/** Distancia del borde inferior del header a la línea de base del HUD. */
export const HUD_TOP_GAP = 22;

/** Cuánto puede invadir el padding lateral una letra desplazada. */
export const DODGE_OVERFLOW = 6;
/** Aire vertical extra para que una línea empiece a esquivar antes del contacto. */
export const DODGE_GATE_PAD = 8;

/** Gravedad de las letras que vuelven a su lugar, en px/s². */
export const LETTER_FALL_GRAVITY = 900;
/** Velocidad inicial de caída, para que no arranque congelada. */
export const LETTER_FALL_START = 60;
