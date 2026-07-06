import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { data } from '../data/data';
import { CONTACT_EMAIL, buildWhatsAppUrl } from '../data/contact';

const serviceLinks = [
  { to: '/servicios/desarrollo', label: 'Desarrollo web' },
  { to: '/servicios/fotografia', label: 'Fotografía' },
  { to: '/servicios/tufting', label: 'Tufting' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/blog', label: 'Blog & Notas' },
];

export const Footer: React.FC = () => {
  const whatsappUrl = buildWhatsAppUrl('general');

  return (
    <footer className="w-full border-t border-dashed border-line bg-base">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Identidad */}
        <div>
          <p className="text-accent font-bold text-lg mb-2">&gt; Artifex</p>
          <p className="text-sm text-secondary leading-relaxed">
            {data.personal.name}. Desarrollo web, fotografía y tufting: tecnología y oficio en un mismo taller.
          </p>
          <p className="mt-3 text-xs text-secondary font-mono">
            Victoria, Entre Ríos · Argentina
          </p>
        </div>

        {/* Servicios */}
        <div>
          <p className="text-xs text-secondary uppercase tracking-widest mb-4">// Servicios</p>
          <ul className="flex flex-col gap-2">
            {serviceLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-primary hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <p className="text-xs text-secondary uppercase tracking-widest mb-4">// Contacto</p>
          <ul className="flex flex-col gap-3">
            <li>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors"
              >
                <Mail size={16} /> {CONTACT_EMAIL}
              </a>
            </li>
            {whatsappUrl && (
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </li>
            )}
            <li className="flex gap-6 mt-1">
              <a
                href={data.personal.social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-primary hover:text-accent transition-colors"
              >
                <Github size={18} />
              </a>
              <a
                href={data.personal.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-primary hover:text-accent transition-colors"
              >
                <Linkedin size={18} />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-dashed border-line">
        <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-secondary font-mono text-center">
          &gt; Artifex Core // System Ready // {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};
