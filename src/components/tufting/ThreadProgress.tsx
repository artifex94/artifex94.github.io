import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { woolById } from '../../data/wools';
import { STEPS, type Step } from '../../hooks/useCalculatorState';

interface ThreadProgressProps {
  current: Step;
  /** ¿Se puede saltar a este paso? La regla vive en el reducer; esto es solo UI. */
  canVisit: (step: Step) => boolean;
  onVisit: (step: Step) => void;
  /** Primera lana elegida: el hilo se tiñe de ese color. */
  threadWoolId?: string;
}

const STEP_LABELS: Record<Step, string> = {
  upload: 'El diseño',
  shape: 'La forma',
  colors: 'Las lanas',
  quote: 'La ficha',
};

// Posiciones de los nodos en el viewBox del hilo (una por etapa).
const NODE_X = [50, 150, 250, 350];
const NODE_Y = 12;

// El hilo serpentea entre nodos, como lana floja sobre la mesa.
const THREAD_PATH =
  `M${NODE_X[0]},${NODE_Y} ` +
  `C${NODE_X[0] + 33},4 ${NODE_X[1] - 33},20 ${NODE_X[1]},${NODE_Y} ` +
  `S${NODE_X[2] - 33},4 ${NODE_X[2]},${NODE_Y} ` +
  `S${NODE_X[3] - 33},20 ${NODE_X[3]},${NODE_Y}`;

// El progreso es un hilo de lana que se va tejiendo etapa a etapa.
//
// Reemplaza a la lista numerada de pasos de la v1, que se leía como una
// pasarela de compra. Acá no hay checkout: hay una pieza tomando forma, y el
// hilo marca hasta dónde llegó. Si el cliente ya eligió lanas, el hilo se tiñe
// con la primera: su elección se vuelve parte de la interfaz.
export const ThreadProgress: React.FC<ThreadProgressProps> = ({
  current,
  canVisit,
  onVisit,
  threadWoolId,
}) => {
  const reduce = useReducedMotion();
  const currentIndex = STEPS.indexOf(current);
  const progress = currentIndex / (STEPS.length - 1);
  const threadColor = (threadWoolId && woolById(threadWoolId)?.hex) || 'var(--color-accent)';

  return (
    <nav aria-label="Etapas de tu pieza" className="relative">
      <svg
        viewBox="0 0 400 24"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 w-full h-6 pointer-events-none"
        aria-hidden="true"
      >
        {/* El hilo sin tejer: apenas insinuado. */}
        <path
          d={THREAD_PATH}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* El tramo tejido: crece con cada etapa completada. */}
        <motion.path
          d={THREAD_PATH}
          fill="none"
          stroke={threadColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: Math.max(progress, 0.001) }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, ease: 'easeInOut' }}
        />
        {/* La torsión: un punteado claro sobre el tramo tejido. Es lo que hace
            que se lea como lana hilada y no como una línea de progreso. */}
        <motion.path
          d={THREAD_PATH}
          fill="none"
          stroke="var(--color-surface)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="2.5 6"
          opacity="0.65"
          initial={false}
          animate={{ pathLength: Math.max(progress, 0.001) }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, ease: 'easeInOut' }}
        />
      </svg>

      <ol className="grid grid-cols-4 list-none p-0 m-0">
        {STEPS.map((step, index) => {
          const active = step === current;
          const done = index < currentIndex;
          const reachable = canVisit(step);

          return (
            <li key={step} className="flex flex-col items-center gap-2">
              <button
                type="button"
                aria-current={active ? 'step' : undefined}
                disabled={!reachable && !active}
                onClick={() => onVisit(step)}
                className={cn(
                  'flex flex-col items-center gap-2 pt-0.5 min-h-11 group',
                  !reachable && !active && 'cursor-not-allowed',
                )}
              >
                {/* El nodo: un ovillo. La luz arriba a la izquierda es lo que lo
                    hace esfera de lana en vez de círculo de formulario. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'w-5 h-5 rounded-full border-2 transition-colors',
                    active && 'shadow-[0_0_0_4px_rgba(194,94,76,0.15)]',
                    !done && !active && 'border-line bg-surface',
                  )}
                  style={
                    done || active
                      ? {
                          background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${threadColor} 55%, #fdf9f3), ${threadColor} 70%)`,
                          borderColor: threadColor,
                        }
                      : undefined
                  }
                />
                <span
                  className={cn(
                    'text-xs sm:text-sm transition-colors',
                    active ? 'text-primary font-semibold' : 'text-secondary',
                    done && 'group-hover:text-accent',
                    !reachable && !active && 'opacity-50',
                  )}
                >
                  {STEP_LABELS[step]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
