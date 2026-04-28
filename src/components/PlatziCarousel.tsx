import { useState } from 'react';
import type { PlatziCert } from '../data/data';
import rawCerts from '../data/platzi-certs.json';

const certs = rawCerts as PlatziCert[];

// Card: w-44 (176px) + gap-2 (8px) = 184px per slot
const CARD_PX      = 184;
const PX_PER_SEC   = 35;
const DURATION_S   = Math.round((certs.length * CARD_PX) / PX_PER_SEC);

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

function DiplomaCard({ cert }: { cert: PlatziCert }) {
  const color = schoolColor(cert.school);
  const date  = formatDate(cert.completedAt);

  const card = (
    /*
     * Fixed portrait size — all cards identical: w-44 × h-60 (176 × 240 px).
     * Double-border: outer dashed (line) + inner faint (secondary/10) to
     * evoke the layered frame of a physical diploma.
     */
    <article
      className={`
        w-44 h-60 shrink-0 relative
        border border-dashed border-line
        hover:border-accent/60
        transition-colors duration-300
        cursor-pointer select-none
        group/card
        overflow-hidden
      `}
    >
      {/* Blueprint corner marks — same motif as BlueprintBox */}
      <span className="absolute top-0 left-0   text-accent/50 text-[10px] leading-none pointer-events-none">+</span>
      <span className="absolute top-0 right-0  text-accent/50 text-[10px] leading-none pointer-events-none">+</span>
      <span className="absolute bottom-0 left-0  text-accent/50 text-[10px] leading-none pointer-events-none">+</span>
      <span className="absolute bottom-0 right-0 text-accent/50 text-[10px] leading-none pointer-events-none">+</span>

      {/* Subtle accent glow from top — gives depth like parchment */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,107,0,0.06) 0%, transparent 70%)' }}
      />

      {/* Inner frame */}
      <div className="absolute inset-[5px] border border-secondary/10 pointer-events-none" />

      {/* Content — flex column fills the full card */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between px-3 py-3">

        {/* ── Header: "D I P L O M A" ── */}
        <div className="w-full flex items-center gap-1.5 shrink-0">
          <span className="flex-1 border-t border-secondary/25" />
          <span className="text-[7px] font-mono uppercase tracking-[0.25em] text-secondary/50">
            diploma
          </span>
          <span className="flex-1 border-t border-secondary/25" />
        </div>

        {/* ── Badge image ── */}
        <div className="flex-1 flex items-center justify-center py-1">
          {cert.imageUrl ? (
            <img
              src={cert.imageUrl}
              alt=""
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

        {/* ── Course name ── */}
        <p className="text-[11px] font-bold text-primary leading-snug line-clamp-3 text-center w-full group-hover/card:text-accent transition-colors duration-200 shrink-0">
          {cert.name}
        </p>

        {/* ── Decorative divider ── */}
        <div className="w-full flex items-center gap-1.5 my-1.5 shrink-0">
          <span className="flex-1 border-t border-dashed border-secondary/20" />
          <span className="text-secondary/35 text-[8px]">◆</span>
          <span className="flex-1 border-t border-dashed border-secondary/20" />
        </div>

        {/* ── School label ── */}
        <span
          className={`text-[8px] font-mono uppercase tracking-wider border px-1.5 py-[3px] leading-none text-center max-w-full line-clamp-1 shrink-0 ${color}`}
        >
          {cert.school}
        </span>

        {/* ── Date ── */}
        <span className="text-[9px] font-mono text-secondary/55 mt-1.5 shrink-0">
          {date ?? '✓ Completado'}
        </span>

      </div>
    </article>
  );

  return cert.url ? (
    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
      {card}
    </a>
  ) : card;
}

// ── Infinite marquee ───────────────────────────────────────────────────────

export function PlatziCarousel() {
  const [paused, setPaused] = useState(false);

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
        <span className="text-[9px] font-mono text-secondary/40 select-none">
          {paused ? '⏸ pausado' : '▶ auto'}
        </span>
      </div>

      {/*
       * Marquee wrapper — overflow:hidden clips the track.
       * Hover pauses the CSS animation via the class toggle.
       * The duplicated array makes the loop seamless: when the track reaches
       * -50% of its own width it looks identical to 0%, so the reset is invisible.
       */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        title="Hover para pausar"
      >
        <div
          className={`flex gap-2 w-max animate-platzi-marquee ${paused ? 'animate-platzi-marquee-paused' : ''}`}
          style={{ '--marquee-duration': `${DURATION_S}s` } as React.CSSProperties}
        >
          {doubled.map((cert, i) => (
            <DiplomaCard key={i} cert={cert} />
          ))}
        </div>
      </div>

    </div>
  );
}
