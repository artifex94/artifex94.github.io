import React, { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageCircle, Send, Sparkles } from 'lucide-react';
import '@fontsource-variable/fraunces/index.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import { AtelierFeltPanel, AtelierIconBadge, AtelierWoodFrame } from '../components/tufting/Atelier';
import {
  atelierFeltPanelClass,
  atelierPillClass,
  atelierPrimaryTagClass,
} from '../components/tufting/atelierMaterials';
import { FileteadoCardRule, FileteadoCorner, FileteadoDivider } from '../components/tufting/Fileteado';
import { sendTuftingCollaboration } from '../data/tuftingStore';
import { WHATSAPP_NUMBER } from '../data/contact';
import { breadcrumb } from '../data/structuredData';
import { usePageMeta } from '../hooks/usePageMeta';
import { cn } from '../utils/cn';

const field =
  'atelier-felt w-full min-h-11 rounded-2xl border border-dashed border-accent/40 bg-[color:var(--color-base)] px-4 py-3 text-primary shadow-[0_8px_18px_rgba(112,70,52,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-secondary/70 focus-visible:border-accent focus-visible:bg-surface';

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
  const reduceMotion = useReducedMotion();

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
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
      data-theme="tufting"
      className="min-h-screen w-full overflow-x-hidden bg-atelier-cloth py-12 px-4 sm:px-6 lg:px-8 text-primary"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        <header className="relative text-center">
          <div aria-hidden="true" className="absolute inset-x-5 top-9 atelier-thread-rule md:inset-x-20" />
          <AtelierWoodFrame className="mx-auto max-w-3xl rounded-[2.6rem] p-2.5 sm:p-3.5">
            <div className={cn(atelierFeltPanelClass, 'px-5 py-8 sm:px-10 md:py-10')}>
              <div className="relative z-10">
                <Link
                  to="/servicios/tufting"
                  className={cn(atelierPillClass, 'mb-6 min-h-0 px-4 py-2 text-secondary')}
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
              </div>
            </div>
          </AtelierWoodFrame>
        </header>

        <AtelierFeltPanel framed className="p-5 md:p-9" aria-labelledby="collab-form-title">
          <FileteadoCorner className="pointer-events-none absolute -left-5 -top-5 h-20 w-20 opacity-35" />
          <FileteadoCorner className="pointer-events-none absolute -bottom-5 -right-5 h-20 w-20 opacity-30" flip="both" />
          {sent ? (
            <div className="text-center">
              <AtelierIconBadge className="mx-auto mb-4">
                <Sparkles size={28} aria-hidden="true" />
              </AtelierIconBadge>
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
                  className={atelierPrimaryTagClass}
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  Seguir por WhatsApp
                </a>
              )}
            </div>
          ) : (
            <form onSubmit={submit} className="relative z-10 flex flex-col gap-5">
              <div>
                <FileteadoCardRule className="mb-3 max-w-44 opacity-65" />
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
                  <label htmlFor="collab-name" className="text-sm font-bold text-primary">Nombre</label>
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
                  <label htmlFor="collab-contact" className="text-sm font-bold text-primary">Contacto</label>
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
                <label htmlFor="collab-proposal" className="text-sm font-bold text-primary">Propuesta</label>
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
                <label htmlFor="collab-references" className="text-sm font-bold text-primary">
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

              {error && <p role="alert" className={cn(atelierPillClass, 'justify-start text-accent')}>{error}</p>}

              <button
                type="submit"
                disabled={!canSend}
                className={cn(
                  atelierPrimaryTagClass,
                  'w-full sm:w-auto sm:self-start px-8 py-4',
                  canSend ? '' : 'cursor-not-allowed opacity-45',
                )}
              >
                {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
                Enviar propuesta
              </button>
            </form>
          )}
        </AtelierFeltPanel>
      </div>
    </motion.div>
  );
};
