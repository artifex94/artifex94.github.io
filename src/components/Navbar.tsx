import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/', label: './Inicio' },
  { to: '/servicios/desarrollo', label: './Desarrollo' },
  { to: '/servicios/fotografia', label: './Fotografía' },
  { to: '/servicios/tufting', label: './Tufting' },
  { to: '/portfolio', label: './Portfolio' },
  { to: '/blog', label: './Blog' },
];

const isActive = (pathname: string, to: string) =>
  to === '/' ? pathname === '/' : pathname.startsWith(to);

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = (to: string) =>
    `text-sm font-mono transition-colors ${
      isActive(location.pathname, to) ? 'text-accent' : 'text-secondary hover:text-primary'
    }`;

  return (
    <nav className="w-full border-b border-dashed border-line bg-base/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="text-accent font-bold text-xl">&gt; Artifex</span>
          <span className="text-secondary text-sm hidden sm:inline-block">// System_Core</span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={linkClass(item.to)}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Toggle mobile */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden text-secondary hover:text-accent transition-colors"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Panel mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-t border-dashed border-line bg-base/95"
          >
            <div className="flex flex-col px-4 py-4 gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={linkClass(item.to)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
