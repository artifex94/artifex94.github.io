import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FeretTapeProps {
  /** Extremos de la línea, en el sistema de coordenadas del preview. */
  line: { ax: number; ay: number; bx: number; by: number };
  /** Dimensiones del preview: definen el viewBox, así el SVG escala solo. */
  width: number;
  height: number;
  /** Medida declarada por el cliente, en cm. */
  cm: number;
}

// La cinta métrica: dibuja el diámetro de Feret sobre la imagen.
//
// Es la pieza que le explica al cliente QUÉ está declarando: "esto que ves acá,
// de punta a punta, es lo que mide X cm". Sin esta referencia, el número es
// abstracto y un error de medida (8 por 80) pasa inadvertido.
//
// El SVG usa el viewBox del preview, así que las coordenadas van tal cual y el
// navegador se encarga de escalar junto con la imagen de abajo.
export const FeretTape: React.FC<FeretTapeProps> = ({ line, width, height, cm }) => {
  const reduce = useReducedMotion();
  const { ax, ay, bx, by } = line;

  const midX = (ax + bx) / 2;
  const midY = (ay + by) / 2;
  // Vector unitario perpendicular a la línea: para correr la etiqueta y para
  // dibujar los topes de los extremos.
  const length = Math.hypot(bx - ax, by - ay) || 1;
  const perpX = -(by - ay) / length;
  const perpY = (bx - ax) / length;
  const offsetX = perpX * (height * 0.075);
  const offsetY = perpY * (height * 0.075);

  // Tamaños relativos al viewBox: se ven igual sin importar la resolución.
  const stroke = Math.max(2, width * 0.004);
  // Topes perpendiculares en las puntas, como una cinta métrica de verdad.
  const tick = stroke * 4;
  const fontSize = Math.max(12, width * 0.035);
  const label = `${cm} cm`;
  // El chip de la etiqueta: mono a ~0.62em por carácter alcanza para centrarlo.
  const chipWidth = label.length * fontSize * 0.62 + fontSize;
  const chipHeight = fontSize * 1.55;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      role="img"
      aria-label={`Línea de referencia: la distancia más larga de tu diseño mide ${cm} cm`}
    >
      <motion.line
        x1={ax}
        y1={ay}
        x2={bx}
        y2={by}
        stroke="var(--color-accent)"
        strokeWidth={stroke}
        strokeDasharray={reduce ? undefined : '1 0'}
        initial={reduce ? undefined : { pathLength: 0 }}
        animate={reduce ? undefined : { pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Los topes: rayitas perpendiculares en las puntas, no puntos. Es lo que
          distingue una cota de medición de una línea cualquiera. */}
      {[
        [ax, ay],
        [bx, by],
      ].map(([x, y], index) => (
        <motion.line
          key={index}
          x1={x - perpX * tick}
          y1={y - perpY * tick}
          x2={x + perpX * tick}
          y2={y + perpY * tick}
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={reduce ? undefined : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ delay: reduce ? 0 : 0.15 + index * 0.55, duration: 0.2 }}
        />
      ))}

      {/* La etiqueta va en un chip, como el tab metálico de la cinta. */}
      <motion.g
        initial={reduce ? undefined : { opacity: 0 }}
        animate={reduce ? undefined : { opacity: 1 }}
        transition={{ delay: reduce ? 0 : 0.7 }}
      >
        <rect
          x={midX + offsetX - chipWidth / 2}
          y={midY + offsetY - chipHeight / 2}
          width={chipWidth}
          height={chipHeight}
          rx={chipHeight / 2}
          fill="var(--color-surface)"
          stroke="var(--color-accent)"
          strokeWidth={stroke * 0.5}
        />
        <text
          x={midX + offsetX}
          y={midY + offsetY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          className="font-mono"
          style={{ fontVariantNumeric: 'tabular-nums' }}
          fill="var(--color-primary)"
        >
          {label}
        </text>
      </motion.g>
    </svg>
  );
};
