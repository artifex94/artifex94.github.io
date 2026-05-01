import React, { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
const PREFIX_TARGET = 'cd ../';

const getSectionName = (pathname: string): string => {
  if (pathname.startsWith('/business')) return 'Business';
  if (pathname.startsWith('/blog')) return 'Blog';
  return 'Portfolio';
};

const NAV_LINKS = [
  { to: '/', label: 'Portfolio', isActive: (p: string) => p === '/' },
  { to: '/business', label: 'Business', isActive: (p: string) => p.startsWith('/business') },
  { to: '/blog', label: 'Blog', isActive: (p: string) => p.startsWith('/blog') },
];

export const Navbar = () => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [displayedSection, setDisplayedSection] = useState(() => getSectionName(location.pathname));
  const [prefixState, setPrefixState] = useState<{ label: string; display: string } | null>(null);
  const [newLinksState, setNewLinksState] = useState<Record<string, string>>({});
  const prefixIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathnameRef = useRef(location.pathname);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (animRef.current) { clearInterval(animRef.current); animRef.current = null; }
    if (prefixIntervalRef.current) { clearInterval(prefixIntervalRef.current); prefixIntervalRef.current = null; }
    setPrefixState(null);
    setNewLinksState({});

    const prevSection = getSectionName(prevPathnameRef.current);
    const targetSection = getSectionName(location.pathname);
    const prevInactive = NAV_LINKS.filter(link => !link.isActive(prevPathnameRef.current));
    prevPathnameRef.current = location.pathname;

    if (prevSection === targetSection) {
      setDisplayedSection(targetSection);
      return;
    }

    // Izquierda: unwrite prevSection + scramble-in targetSection
    const leftUnwrite = prevSection.length;
    const leftWrite  = targetSection.length * 3;
    const leftTotal  = leftUnwrite + leftWrite;

    // Derecha: solo animar links cuyo label cambió respecto al mismo slot anterior
    const rightLinks = NAV_LINKS.filter(link => !link.isActive(location.pathname));
    const linksToAnimate = rightLinks.filter((link, idx) => prevInactive[idx]?.label !== link.label);
    const rightMaxTotal = linksToAnimate.length > 0
      ? Math.max(...linksToAnimate.map(l => l.label.length * 3))
      : 0;

    const maxFrames = Math.max(leftTotal, rightMaxTotal);
    let frame = 0;

    const id = setInterval(() => {
      flushSync(() => {
        // — izquierda —
        if (frame < leftTotal) {
          if (frame < leftUnwrite) {
            setDisplayedSection(prevSection.slice(0, prevSection.length - frame - 1));
          } else {
            const wf = frame - leftUnwrite;
            const settled = Math.floor(wf / 3);
            const scrambling = settled < targetSection.length
              ? SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
              : '';
            setDisplayedSection(targetSection.slice(0, settled) + scrambling);
          }
          if (frame === leftTotal - 1) setDisplayedSection(targetSection);
        }

        // — derecha: solo los links que cambiaron de slot —
        const displays: Record<string, string> = {};
        linksToAnimate.forEach(link => {
          const linkTotal = link.label.length * 3;
          if (frame < linkTotal) {
            const settled = Math.floor(frame / 3);
            const scrambling = settled < link.label.length
              ? SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
              : '';
            displays[link.label] = link.label.slice(0, settled) + scrambling;
          }
        });
        setNewLinksState(displays);
      });

      frame++;
      if (frame >= maxFrames) {
        clearInterval(id);
        if (animRef.current === id) {
          animRef.current = null;
          setDisplayedSection(targetSection);
          setNewLinksState({});
        }
      }
    }, 50);

    animRef.current = id;
    return () => { clearInterval(id); if (animRef.current === id) animRef.current = null; };
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
      if (prefixIntervalRef.current) clearInterval(prefixIntervalRef.current);
    };
  }, []);

  const handleHoverStart = (label: string) => {
    if (prefixIntervalRef.current) clearInterval(prefixIntervalRef.current);
    let frame = 0;
    const totalFrames = PREFIX_TARGET.length * 2;

    prefixIntervalRef.current = setInterval(() => {
      const settled = Math.floor(frame / 2);
      const scrambling = settled < PREFIX_TARGET.length
        ? SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        : '';
      setPrefixState({ label, display: PREFIX_TARGET.slice(0, settled) + scrambling });
      frame++;
      if (frame >= totalFrames) {
        clearInterval(prefixIntervalRef.current!);
        prefixIntervalRef.current = null;
        setPrefixState({ label, display: PREFIX_TARGET });
      }
    }, 40);
  };

  const handleHoverEnd = () => {
    if (prefixIntervalRef.current) {
      clearInterval(prefixIntervalRef.current);
      prefixIntervalRef.current = null;
    }
    setPrefixState(null);
  };

  const dateStr = time.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const timeStr = time.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const [hh, mm, ss] = timeStr.split(':');

  const inactiveLinks = NAV_LINKS.filter(link => !link.isActive(location.pathname));

  return (
    <nav className="w-full border-b border-dashed border-line bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between relative">

        {/* Left: > Artifex/Section */}
        <div className="flex items-center z-10 min-w-0">
          <span className="inline-flex items-center text-accent font-bold text-base sm:text-xl truncate">
            <span className="shrink-0">&gt; Artifex</span>
            <span className="font-mono truncate">/{displayedSection}</span>
          </span>
        </div>

        {/* Right: secciones accesibles + reloj + System_Date */}
        <div className="flex items-center gap-3 sm:gap-6 z-10 shrink-0 ml-3 sm:ml-0">

          {/* Secciones navegables */}
          <div className="flex items-center gap-2 sm:gap-3">
            {inactiveLinks.map((link, idx) => {
              const displayLabel = newLinksState[link.label] ?? link.label;

              return (
                <React.Fragment key={link.to}>
                  {idx > 0 && <span className="text-secondary/40 select-none text-sm">|</span>}
                  <span
                    className="relative inline-flex items-center sm:ml-13 sm:w-[9ch]"
                    onMouseEnter={() => handleHoverStart(link.label)}
                    onMouseLeave={handleHoverEnd}
                  >
                    <span className="absolute right-full inset-y-0 hidden sm:flex items-center font-mono text-sm text-secondary/50 whitespace-nowrap pointer-events-none">
                      {prefixState?.label === link.label ? prefixState.display : ''}
                    </span>
                    <Link
                      to={link.to}
                      className="text-sm font-mono text-secondary hover:text-primary transition-colors py-1"
                    >
                      {displayLabel}
                    </Link>
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Reloj Digital LED */}
          <div className="hidden sm:flex font-digital text-accent items-center justify-center select-none">
            <div className="relative text-xl leading-none">
              <div className="absolute top-0 left-0 flex items-center text-accent/15 pointer-events-none">
                {['8','8',':','8','8',':','8','8'].map((ch, i) => (
                  <span key={i} className={`inline-block text-right ${ch === ':' ? 'w-[0.5ch]' : 'w-[1ch]'}`}>{ch}</span>
                ))}
              </div>
              <div
                className="relative z-10 flex items-center"
                style={{ textShadow: '0 0 8px rgba(255, 107, 0, 0.8), 0 0 12px rgba(255, 107, 0, 0.4)' }}
              >
                {[hh[0], hh[1], ':', mm[0], mm[1], ':', ss[0], ss[1]].map((ch, i) => (
                  ch === ':'
                    ? <span key={i} className={`inline-block text-right w-[0.5ch] ${time.getSeconds() % 2 === 0 ? 'opacity-100' : 'opacity-0'}`}>:</span>
                    : <span key={i} className="inline-block text-right w-[1ch]">{ch}</span>
                ))}
              </div>
            </div>
          </div>

          {/* System_Date */}
          <span className="text-secondary text-sm hidden md:inline-block">
            // System_Date: {dateStr}
          </span>

        </div>

      </div>
    </nav>
  );
};
