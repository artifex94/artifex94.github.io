import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();

  const [time, setTime] = useState(new Date());

  // Actualizar la hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Formateamos la fecha (DD/MM/YYYY)
  const dateStr = time.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Formateamos la hora (HH:MM:SS) asegurando 2 dígitos siempre
  const timeStr = time.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const [hh, mm, ss] = timeStr.split(':');

  return (
    <nav className="w-full border-b border-dashed border-line bg-base/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        
        <div className="flex items-center gap-2 md:gap-4 z-10">
          <span className="text-accent font-bold text-xl">&gt; Artifex</span>
          {/* Se oculta en móviles pequeños para que no colapse el menú */}
          <span className="text-secondary text-sm hidden md:inline-block">
            // System_Date: {dateStr}
          </span>
        </div>

        {/* Reloj Digital LED (Estilo Despertador) - Centrado */}
        <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-digital text-accent bg-[#050200] px-3 py-1 rounded border border-accent/20 overflow-hidden items-center justify-center select-none shadow-[inset_0_0_10px_rgba(255,107,0,0.05)] z-0">
          {/* Brillo tenue interno del display */}
          <span className="absolute inset-0 bg-accent/5 blur-[2px]"></span>
          
          {/* Base de segmentos "apagados" (88:88:88) */}
          <span className="absolute text-accent/15 tracking-[0.1em] text-xl">
            88:88:88
          </span>
          
          {/* Hora real con efecto de brillo neón y dos puntos titilantes */}
          <span 
            className="relative z-10 tracking-[0.1em] text-xl flex items-center" 
            style={{ textShadow: '0 0 8px rgba(255, 107, 0, 0.8), 0 0 12px rgba(255, 107, 0, 0.4)' }}
          >
            {hh}<span className={time.getSeconds() % 2 === 0 ? "opacity-100" : "opacity-0"}>:</span>{mm}<span className={time.getSeconds() % 2 === 0 ? "opacity-100" : "opacity-0"}>:</span>{ss}
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 z-10">
          <div className="flex gap-4 sm:gap-6">
            <Link
              to="/"
              className={`text-sm font-mono transition-colors ${location.pathname === '/' ? 'text-accent' : 'text-secondary hover:text-primary'}`}
            >
              ./Portfolio
            </Link>
            <Link
              to="/business"
              className={`text-sm font-mono transition-colors ${location.pathname.startsWith('/business') ? 'text-accent' : 'text-secondary hover:text-primary'}`}
            >
              ./Business
            </Link>
            <Link
              to="/blog"
              className={`text-sm font-mono transition-colors ${location.pathname.startsWith('/blog') ? 'text-accent' : 'text-secondary hover:text-primary'}`}
            >
              ./Blog
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};
