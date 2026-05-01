import { useRef, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useTransform, useVelocity, animate } from 'framer-motion';
import type { PlatziCert } from '../data/data';
import rawCerts from '../data/platzi-certs.json';

const certs = rawCerts as PlatziCert[];

// Card: w-44 (176px) + gap-2 (8px) = 184px per slot
const CARD_PX         = 184;
const TRACK_WIDTH     = certs.length * CARD_PX;
const AUTO_PX_PER_SEC = 35;

// ── school → border/text color ─────────────────────────────────────────────
const SCHOOL_COLORS: Record<string, string> = {
  'Escuela de JavaScript':     'border-yellow-500/60 text-yellow-400',
  'Escuela de Python':         'border-blue-500/60   text-blue-400',
  'Escuela de Java':           'border-orange-500/60 text-orange-400',
  'Escuela de Desarrollo Web': 'border-accent/60     text-accent',
  'Escuela de Datos':          'border-purple-500/60 text-purple-400',
  'Escuela de Diseño':         'border-pink-500/60   text-pink-400',
  'Escuela de DevOps':         'border-cyan-500/60   text-cyan-400',
  'Escuela de Inglés':         'border-green-500/60  text-green-400',
  'Escuela de Negocios':       'border-amber-500/60  text-amber-400',
  'Escuela de IA':             'border-violet-500/60 text-violet-400',
  'Electrónica':               'border-red-500/60    text-red-400',
  'Blockchain & Web3':         'border-emerald-500/60 text-emerald-400',
  'Fundamentos':               'border-sky-500/60    text-sky-400',
  'Habilidades Blandas':       'border-rose-500/60   text-rose-400',
};
const schoolColor = (s: string) => SCHOOL_COLORS[s] ?? 'border-secondary/40 text-secondary';

function formatDate(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'short' });
}

// ── Diploma card ───────────────────────────────────────────────────────────

interface DiplomaCardProps {
  cert:  PlatziCert;
  'aria-hidden'?: boolean;
}

function DiplomaCard({ cert, 'aria-hidden': ariaHidden }: DiplomaCardProps) {
  const color = schoolColor(cert.school);
  const date  = formatDate(cert.completedAt);

  return (
    <article
      className={`
        w-44 h-60 shrink-0 relative
        border border-dashed border-line
        hover:border-accent/60
        transition-colors duration-300
        select-none group/card overflow-hidden
        ${cert.url ? 'cursor-pointer' : ''}
      `}
      data-name={cert.name}
      data-url={cert.url || undefined}
      aria-hidden={ariaHidden}
      role="listitem"
    >
      <span aria-hidden="true" className="absolute top-0 left-0   text-accent/50 text-[10px] leading-none pointer-events-none">+</span>
      <span aria-hidden="true" className="absolute top-0 right-0  text-accent/50 text-[10px] leading-none pointer-events-none">+</span>
      <span aria-hidden="true" className="absolute bottom-0 left-0  text-accent/50 text-[10px] leading-none pointer-events-none">+</span>
      <span aria-hidden="true" className="absolute bottom-0 right-0 text-accent/50 text-[10px] leading-none pointer-events-none">+</span>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,107,0,0.06) 0%, transparent 70%)' }}
      />
      <div className="absolute inset-[5px] border border-secondary/10 pointer-events-none" />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between px-3 py-3">
        <div className="w-full flex items-center gap-1.5 shrink-0">
          <span className="flex-1 border-t border-secondary/25" />
          <span className="text-[7px] font-mono uppercase tracking-[0.25em] text-secondary/50">diploma</span>
          <span className="flex-1 border-t border-secondary/25" />
        </div>

        <div className="flex-1 flex items-center justify-center py-1">
          {cert.imageUrl ? (
            <img
              src={cert.imageUrl}
              alt={`Logo ${cert.name}`}
              loading="lazy"
              draggable={false}
              className="w-14 h-14 object-contain opacity-75 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-300"
            />
          ) : (
            <div className="w-14 h-14 border border-dashed border-accent/25 flex items-center justify-center">
              <span className="text-accent/30 text-xs font-mono">PLZ</span>
            </div>
          )}
        </div>

        <p className="text-[11px] font-bold text-primary leading-snug line-clamp-3 text-center w-full group-hover/card:text-accent transition-colors duration-200 shrink-0">
          {cert.name}
        </p>

        <div className="w-full flex items-center gap-1.5 my-1.5 shrink-0">
          <span className="flex-1 border-t border-dashed border-secondary/20" />
          <span className="text-secondary/35 text-[8px]">◆</span>
          <span className="flex-1 border-t border-dashed border-secondary/20" />
        </div>

        <span className={`text-[8px] font-mono uppercase tracking-wider border px-1.5 py-0.75 leading-none text-center max-w-full line-clamp-1 shrink-0 ${color}`}>
          {cert.school}
        </span>

        <span className="text-[9px] font-mono text-secondary/55 mt-1.5 shrink-0">
          {date ?? '✓ Completado'}
        </span>
      </div>
    </article>
  );
}

// ── Confirmation dialog — portal escapes BlueprintBox 3D transform context ──

interface DiplomaDialogProps {
  name:    string;
  url:     string;
  onClose: () => void;
}

function DiplomaDialog({ name, url, onClose }: DiplomaDialogProps) {
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

      <motion.div
        className="relative z-10 w-full max-w-sm bg-[#0d0d0d] border border-dashed border-accent/50 p-6"
        initial={{ scale: 0.95, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <span aria-hidden="true" className="absolute -top-px -left-px  text-accent text-xs leading-none">+</span>
        <span aria-hidden="true" className="absolute -top-px -right-px text-accent text-xs leading-none">+</span>
        <span aria-hidden="true" className="absolute -bottom-px -left-px  text-accent text-xs leading-none">+</span>
        <span aria-hidden="true" className="absolute -bottom-px -right-px text-accent text-xs leading-none">+</span>

        <div aria-hidden="true" className="absolute -top-3 right-4 bg-[#0d0d0d] px-2 text-[9px] text-secondary border border-dashed border-line tracking-wider font-mono">
          [diploma]
        </div>

        <p className="text-[9px] font-mono text-secondary/50 uppercase tracking-widest mb-2">
          // Ver certificado
        </p>
        <p className="text-sm font-bold text-primary leading-snug mb-6">
          {name}
        </p>

        <div className="flex items-center gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-accent text-black text-sm font-bold py-2.5 text-center hover:bg-white transition-colors duration-200"
            onClick={onClose}
          >
            Abrir diploma ↗
          </a>
          <button
            className="text-sm font-mono text-secondary hover:text-primary transition-colors px-3 py-2.5"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ── Draggable infinite carousel ────────────────────────────────────────────

export function PlatziCarousel() {
  const rawX        = useMotionValue(0);
  const rawVelocity = useVelocity(rawX);
  const displayX    = useTransform(rawX, (v) => {
    if (TRACK_WIDTH === 0) return 0;
    let mod = v % -TRACK_WIDTH;
    if (mod > 0) mod -= TRACK_WIDTH;
    return mod;
  });

  const autoAnim   = useRef<ReturnType<typeof animate> | null>(null);
  const isDragging = useRef(false);
  const isHovered  = useRef(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ptrStartX  = useRef(0);
  const rawStartX  = useRef(0);
  const hasDragged = useRef(false);
  const pressedTarget = useRef<EventTarget | null>(null);

  const [pendingDiploma, setPendingDiploma] = useState<{ name: string; url: string } | null>(null);

  const startAutoScroll = useCallback(() => {
    if (isHovered.current) return;
    autoAnim.current?.stop();
    const cur     = rawX.get();
    const totalPx = TRACK_WIDTH * 200;
    autoAnim.current = animate(rawX, cur - totalPx, {
      ease:     'linear',
      duration: totalPx / AUTO_PX_PER_SEC,
    });
  }, [rawX]);

  const startAutoScrollGradual = useCallback(() => {
    if (isHovered.current) return;
    autoAnim.current?.stop();
    const cur      = rawX.get();
    const warmupPx = AUTO_PX_PER_SEC * 2;
    autoAnim.current = animate(rawX, cur - warmupPx, {
      ease:       [0, 0, 0.4, 1],
      duration:   2.2,
      onComplete: startAutoScroll,
    });
  }, [rawX, startAutoScroll]);

  useEffect(() => {
    startAutoScroll();
    return () => {
      autoAnim.current?.stop();
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, [startAutoScroll]);

  // ── Hover pause / gradual resume ──────────────────────────────────────
  const onMouseEnter = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    isHovered.current = true;
    if (!isDragging.current) autoAnim.current?.stop();
  }, []);

  const onMouseLeave = useCallback(() => {
    isHovered.current = false;
    if (!isDragging.current) {
      hoverTimer.current = setTimeout(startAutoScrollGradual, 500);
    }
  }, [startAutoScrollGradual]);

  // ── Pointer drag handlers ─────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    autoAnim.current?.stop();
    isDragging.current = true;
    hasDragged.current = false;
    ptrStartX.current  = e.clientX;
    rawStartX.current  = rawX.get();
    pressedTarget.current = e.target;
  }, [rawX]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - ptrStartX.current;
    if (Math.abs(dx) > 6) hasDragged.current = true;
    rawX.set(rawStartX.current + dx);
  }, [rawX]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    isDragging.current = false;

    if (!hasDragged.current && pressedTarget.current) {
      const article = (pressedTarget.current as Element).closest('article');
      if (article) {
        const url = article.getAttribute('data-url');
        const name = article.getAttribute('data-name');
        if (url && name) {
          setPendingDiploma({ name, url });
        }
      }
    }
    pressedTarget.current = null;

    const vel    = rawVelocity.get();
    const absVel = Math.abs(vel);

    if (absVel > 30) {
      const distance = vel * 0.4;
      const duration = Math.min(Math.max(absVel / 1200, 0.3), 3);
      autoAnim.current = animate(rawX, rawX.get() + distance, {
        ease:       [0.16, 1, 0.3, 1],
        duration,
        onComplete: startAutoScroll,
      });
    } else {
      startAutoScroll();
    }
  }, [rawX, rawVelocity, startAutoScroll]);

  if (certs.length === 0) return null;

  const doubled = [...certs, ...certs];

  return (
    <div className="mt-6 border-t border-dashed border-line/50 pt-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <a
          href="https://platzi.com/p/Ramiroesc18/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 group"
        >
          <span className="w-2 h-2 rounded-full bg-[#98ca3f] group-hover:shadow-[0_0_6px_2px_rgba(152,202,63,0.5)] transition-shadow" />
          <span className="text-[10px] font-mono text-secondary group-hover:text-accent transition-colors">
            platzi.com/p/Ramiroesc18
          </span>
        </a>
        <span className="text-[9px] font-mono text-secondary/35 select-none">
          ↔ arrastrá para explorar
        </span>
      </div>

      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDragStart={(e) => e.preventDefault()}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        <motion.div className="flex gap-2 w-max" style={{ x: displayX }} role="list" aria-label="Certificados Platzi">
          {doubled.map((cert, i) => (
            <DiplomaCard
              key={i}
              cert={cert}
              aria-hidden={i >= certs.length}
            />
          ))}
        </motion.div>
      </div>

      {pendingDiploma && (
        <DiplomaDialog
          name={pendingDiploma.name}
          url={pendingDiploma.url}
          onClose={() => setPendingDiploma(null)}
        />
      )}

    </div>
  );
}
