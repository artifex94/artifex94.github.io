import { useState } from 'react';
import { MessageCircle, Mail, X, Code2 } from 'lucide-react';
import { buildMailto, buildWhatsAppUrl, CONTACT_EMAIL } from '../data/contact';

// Contacto centralizado: si el número de WhatsApp no está configurado,
// el CTA degrada a email automáticamente.
const WA = buildWhatsAppUrl('demo');

export const DemoBadge = ({ label, raised = false }: { label: string; raised?: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Badge fijo */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed ${raised ? 'bottom-20 md:bottom-6' : 'bottom-6'} right-6 z-50 flex items-center gap-2 bg-black text-white text-xs font-bold px-4 py-2 shadow-xl border border-white/20 hover:bg-neutral-800 transition-all`}
      >
        <Code2 className="w-4 h-4 text-[#E67E32]" />
        Demo — Artifex
      </button>

      {/* Modal CTA */}
      {open && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <p className="text-xs text-[#E67E32] font-bold uppercase tracking-widest mb-2">Demo interactivo</p>
            <h3 className="text-2xl font-extrabold text-black mb-3">
              ¿Querés un sitio así para tu {label}?
            </h3>
            <p className="text-neutral-500 text-sm mb-6">
              Este es un demo desarrollado por <strong>Artifex</strong>. Podemos construir algo igual o mejor,
              a medida para tu negocio, en 1 a 2 semanas.
            </p>
            {WA ? (
              <a
                href={WA}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white font-bold py-4 hover:bg-[#1ebe5d] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Consultar por WhatsApp
              </a>
            ) : (
              <a
                href={buildMailto('Consulta - Demo para mi negocio')}
                className="flex items-center justify-center gap-3 w-full bg-black text-white font-bold py-4 hover:bg-neutral-800 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Consultar por email
              </a>
            )}
            <p className="text-center text-xs text-neutral-400 mt-4">
              Primera consulta sin cargo — <strong>{CONTACT_EMAIL}</strong>
            </p>
          </div>
        </div>
      )}
    </>
  );
};
