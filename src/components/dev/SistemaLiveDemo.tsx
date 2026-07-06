import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { LayoutDashboard, Users, Package, BarChart3 } from 'lucide-react';
import { AnimatedPrice } from './AnimatedPrice';

// Plausible management figures that tick over time — a GESTIÓN panel (turnos,
// clientes, cobranzas), not an e-commerce dashboard, so it reads distinct from
// the Tienda tier.
const TURNOS = [14, 12, 15, 13, 16, 14];
const CLIENTES = [208, 210, 209, 212, 211, 214];
const COBRANZAS = ['812.400', '834.900', '847.500', '861.200', '855.000', '872.300'];
const CHART = [
  [40, 62, 48, 70, 55, 82, 64],
  [46, 58, 52, 66, 60, 78, 72],
  [38, 66, 44, 74, 58, 86, 68],
];

// A living mini-dashboard rendered in JSX + motion. Numbers flip, the chart
// shifts and a "live" dot pulses — but only while it is on screen and the user
// hasn't asked for reduced motion. It replaces the old static demo GIF.
export const SistemaLiveDemo: React.FC = () => {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const active = inView && !reduce;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, [active]);

  const turnos = TURNOS[tick % TURNOS.length];
  const clientes = CLIENTES[tick % CLIENTES.length];
  const cobranzas = COBRANZAS[tick % COBRANZAS.length];
  const bars = CHART[tick % CHART.length];

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-sm border border-line bg-base"
      aria-label="Demostración de un panel de administración a medida"
      role="img"
    >
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-14 shrink-0 flex-col items-center gap-5 border-r border-line/70 py-4 sm:flex">
          <LayoutDashboard className="h-5 w-5 text-accent" aria-hidden="true" />
          <Users className="h-5 w-5 text-secondary" aria-hidden="true" />
          <Package className="h-5 w-5 text-secondary" aria-hidden="true" />
          <BarChart3 className="h-5 w-5 text-secondary" aria-hidden="true" />
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold text-white">Panel de control</span>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-secondary">
              <motion.span
                animate={active ? { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] } : {}}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="h-2 w-2 rounded-full bg-accent"
              />
              En vivo
            </span>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="border border-line bg-surface p-3">
              <div className="mb-1 text-[11px] text-secondary">Turnos hoy</div>
              <AnimatedPrice value={String(turnos)} className="text-xl font-bold text-white" />
            </div>
            <div className="border border-line bg-surface p-3">
              <div className="mb-1 text-[11px] text-secondary">Clientes activos</div>
              <AnimatedPrice value={String(clientes)} className="text-xl font-bold text-white" />
            </div>
            <div className="border border-line bg-surface p-3">
              <div className="mb-1 text-[11px] text-secondary">Cobranzas</div>
              <div className="flex items-baseline gap-0.5 text-xl font-bold text-accent">
                <span className="text-sm">$</span>
                <AnimatedPrice value={cobranzas} />
              </div>
            </div>
          </div>

          {/* Chart — baseline ties the bars to the KPIs above */}
          <div className="relative mt-4 flex h-24 items-end gap-2 border-b border-t border-line/60 pb-px pt-3">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t-sm bg-accent/80"
                initial={reduce ? false : { height: 0 }}
                animate={{ height: `${h}%` }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 200, damping: 22, delay: active ? 0 : i * 0.05 }
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
