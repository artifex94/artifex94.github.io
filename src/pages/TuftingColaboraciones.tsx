import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageCircle, Send, Sparkles } from 'lucide-react';
import '@fontsource-variable/fraunces/index.css';
import { puffyCardClass } from '../components/tufting/PuffySurface';
import { FileteadoCorner, FileteadoDivider } from '../components/tufting/Fileteado';
import { sendTuftingCollaboration } from '../data/tuftingStore';
import { WHATSAPP_NUMBER } from '../data/contact';
import { breadcrumb } from '../data/structuredData';
import { usePageMeta } from '../hooks/usePageMeta';
import { cn } from '../utils/cn';

const field =
  'w-full rounded-2xl border border-line bg-surface/85 px-4 py-3 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] min-h-11 placeholder:text-secondary/70';

const buildCollabWhatsAppUrl = (proposal: string, references: string): string | null => {
  if (!WHATSAPP_NUMBER) return null;
  const lines = [
    'Hola Ramiro! Te escribo por una colaboración de tufting.',
    '',
    `Propuesta: ${proposal.trim()}`,
  ];
  if (references.trim()) lines.push('', `Referencias: ${references.trim()}`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
};

export const TuftingColaboraciones: React.FC = () => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [proposal, setProposal] = useState('');
  const [references, setReferences] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  usePageMeta({
    title: 'Colaboraciones de tufting para artistas | Artifex',
    description:
      'Formulario cálido para proponer colaboraciones de tufting: llevá tu ilustración, obra o idea textil a una pieza de lana hecha a mano.',
    canonicalPath: '/servicios/tufting/colaboraciones',
    jsonLd: breadcrumb([
      { name: 'Inicio', path: '/' },
      { name: 'Tufting', path: '/servicios/tufting' },
      { name: 'Colaboraciones', path: '/servicios/tufting/colaboraciones' },
    ]),
  });

  const whatsappUrl = useMemo(
    () => buildCollabWhatsAppUrl(proposal, references),
    [proposal, references],
  );

  const canSend = name.trim().length > 0 && contact.trim().length > 0 && proposal.trim().length > 0 && !busy;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) return;
    setBusy(true);
    setError(null);
    try {
      await sendTuftingCollaboration({
        name: name.trim(),
        contact: contact.trim(),
        proposal: proposal.trim(),
        references: references.trim() || undefined,
      });
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pude enviar la propuesta. Probá de nuevo en un rato.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      data-theme="tufting"
      className="min-h-screen w-full bg-tufting-warm bg-fileteado-hebras py-12 px-4 sm:px-6 lg:px-8 text-primary"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        <header className="text-center">
          <Link
            to="/servicios/tufting"
            className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Volver a Tufting
          </Link>
          <span className="text-accent uppercase tracking-widest text-xs font-bold mb-3 block">
            Colaboraciones con artistas
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4 leading-tight">
            Tu obra tiene <span className="text-accent italic">una versión en lana</span>
          </h1>
          <p className="text-secondary leading-relaxed max-w-2xl mx-auto">
            Toda ilustración, personaje o textura guarda una versión tejida esperando que alguien la
            encuentre. Si la tuya te anda dando vueltas, contame por acá: la buscamos juntos, con
            criterio artesanal y cariño por el detalle.
          </p>
          <FileteadoDivider className="mx-auto mt-7 max-w-sm" />
        </header>

        <section className={cn(puffyCardClass, 'p-5 ring-1 ring-white/35 md:p-9')} aria-labelledby="collab-form-title">
          <FileteadoCorner className="pointer-events-none absolute -left-5 -top-5 h-20 w-20 opacity-35" />
          <FileteadoCorner className="pointer-events-none absolute -bottom-5 -right-5 h-20 w-20 opacity-30" flip="both" />
          {sent ? (
            <div className="text-center">
              <Sparkles size={34} className="mx-auto mb-4 text-accent" aria-hidden="true" />
              <h2 id="collab-form-title" className="font-display text-2xl font-semibold mb-3">
                ¡Propuesta enviada!
              </h2>
              <p className="text-secondary leading-relaxed max-w-2xl mx-auto mb-7">
                Tu idea ya está en el taller. La voy a mirar con tiempo — el tiempo del taller, que es
                más lento y más honesto — y te escribo para hablar de materialidad, medidas, tiempos
                y formato.
              </p>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 font-bold text-on-accent transition-opacity hover:opacity-90"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  Seguir por WhatsApp
                </a>
              )}
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-5">
              <div>
                <h2 id="collab-form-title" className="font-display text-2xl font-semibold mb-2">
                  Contame la colaboración
                </h2>
                <p className="text-sm text-secondary leading-relaxed">
                  No hace falta que esté todo resuelto: con una intención, alguna referencia y una forma de
                  contacto ya arrancamos la conversación.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="collab-name" className="text-sm font-semibold">Nombre</label>
                  <input
                    id="collab-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={field}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="collab-contact" className="text-sm font-semibold">Contacto</label>
                  <input
                    id="collab-contact"
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    className={field}
                    placeholder="email, IG o WhatsApp"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="collab-proposal" className="text-sm font-semibold">Propuesta</label>
                <textarea
                  id="collab-proposal"
                  value={proposal}
                  onChange={(event) => setProposal(event.target.value)}
                  rows={5}
                  className={cn(field, 'resize-y')}
                  placeholder="Qué obra querés traducir a tufting, para qué contexto y qué escala imaginás."
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="collab-references" className="text-sm font-semibold">
                  Referencias <span className="font-normal text-secondary">(opcional)</span>
                </label>
                <textarea
                  id="collab-references"
                  value={references}
                  onChange={(event) => setReferences(event.target.value)}
                  rows={3}
                  className={cn(field, 'resize-y')}
                  placeholder="Links, redes, paletas, bocetos o descripciones visuales."
                />
              </div>

              {error && <p role="alert" className="text-sm font-semibold text-accent">{error}</p>}

              <button
                type="submit"
                disabled={!canSend}
                className={cn(
                  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 font-bold text-on-accent transition-opacity',
                  canSend ? 'hover:opacity-90' : 'cursor-not-allowed opacity-45',
                )}
              >
                {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
                Enviar propuesta
              </button>
            </form>
          )}
        </section>
      </div>
    </motion.div>
  );
};
