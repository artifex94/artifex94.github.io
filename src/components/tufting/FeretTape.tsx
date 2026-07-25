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
  // La etiqueta se corre perpendicular a la línea para no taparla.
  const length = Math.hypot(bx - ax, by - ay) || 1;
  const offsetX = (-(by - ay) / length) * (height * 0.06);
  const offsetY = ((bx - ax) / length) * (height * 0.06);

  // Tamaños relativos al viewBox: se ven igual sin importar la resolución.
  const stroke = Math.max(2, width * 0.004);
  const dotRadius = stroke * 2;
  const fontSize = Math.max(12, width * 0.035);

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

      {[
        [ax, ay],
        [bx, by],
      ].map(([x, y], index) => (
        <motion.circle
          key={index}
          cx={x}
          cy={y}
          r={dotRadius}
          fill="var(--color-accent)"
          initial={reduce ? undefined : { scale: 0 }}
          animate={reduce ? undefined : { scale: 1 }}
          transition={{ delay: reduce ? 0 : 0.15 + index * 0.55, duration: 0.25 }}
        />
      ))}

      <motion.text
        x={midX + offsetX}
        y={midY + offsetY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        className="font-mono"
        style={{ fontVariantNumeric: 'tabular-nums' }}
        fill="var(--color-primary)"
        stroke="var(--color-surface)"
        strokeWidth={fontSize * 0.25}
        paintOrder="stroke"
        initial={reduce ? undefined : { opacity: 0 }}
        animate={reduce ? undefined : { opacity: 1 }}
        transition={{ delay: reduce ? 0 : 0.7 }}
      >
        {`${cm} cm`}
      </motion.text>
    </svg>
  );
};
