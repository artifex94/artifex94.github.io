import React from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import '@fontsource-variable/fraunces/index.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import { buildWhatsAppUrl } from '../data/contact';
import { usePageMeta } from '../hooks/usePageMeta';

// Página de vuelta desde MercadoPago.
//
// El estado que llega por query string es solo informativo: la verdad la
// establece el webhook, que consulta el pago contra la API de MercadoPago con
// nuestro token. Acá no se marca nada como pagado ni se dispara ninguna acción,
// justamente para que manipular la URL no tenga ningún efecto.
type Outcome = 'approved' | 'subscribed' | 'pending' | 'failure';

const OUTCOMES: Record<Outcome, { icon: typeof CheckCircle2; title: string; body: string }> = {
  approved: {
    icon: CheckCircle2,
    title: '¡Listo! Tu alfombra ya tiene turno en el bastidor',
    // No se afirma que el pago esté acreditado: eso lo confirma el webhook, no
    // la URL de vuelta.
    body: 'Tu pago quedó registrado en MercadoPago. En cuanto se acredite te escribo por WhatsApp para afinar los últimos detalles del diseño y contarte los tiempos de entrega — lo tejido a mano lleva su tiempo, y ese tiempo se nota.',
  },
  subscribed: {
    icon: CheckCircle2,
    title: '¡Listo! El débito automático quedó activado',
    body: 'La primera cuota hace de seña, y con eso tu pieza entra al bastidor. Las que quedan se debitan solas, mes a mes. Te escribo por WhatsApp para afinar los detalles del diseño.',
  },
  pending: {
    icon: Clock,
    title: 'Tu pago viene en camino',
    body: 'MercadoPago todavía lo está procesando. En cuanto se acredite te aviso y la pieza entra al bastidor.',
  },
  failure: {
    icon: XCircle,
    title: 'El pago no se completó',
    body: 'No se hizo ningún cargo. Podés volver al bastidor e intentarlo de nuevo, o escribirme y lo resolvemos por otro lado.',
  },
};

/**
 * Interpreta la vuelta de MercadoPago.
 *
 * El caso `preapproval_id`/`authorized` es robustez de lectura: el sitio ya no
 * crea suscripciones, pero un link de débito automático armado a mano desde
 * MercadoPago puede volver acá, y sin este caso quien lo autorizó leería "El
 * pago no se completó. No se hizo ningún cargo" — falso en las dos frases.
 */
const readOutcome = (status: string | null, preapprovalId: string | null): Outcome => {
  if (preapprovalId || status === 'authorized') return 'subscribed';
  if (status === 'approved') return 'approved';
  if (status === 'pending' || status === 'in_process') return 'pending';
  return 'failure';
};

export const TuftingGracias: React.FC = () => {
  const [params] = useSearchParams();
  const outcome = readOutcome(
    params.get('status') ?? params.get('collection_status'),
    params.get('preapproval_id'),
  );
  const { icon: Icon, title, body } = OUTCOMES[outcome];

  usePageMeta({
    title: 'Gracias por tu encargo | Artifex',
    description: 'Confirmación de tu encargo de alfombra artesanal de tufting.',
    canonicalPath: '/servicios/tufting/calculadora/gracias',
    // No tiene sentido que esta página aparezca en buscadores.
    noindex: true,
  });

  const whatsappUrl = buildWhatsAppUrl('tufting');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      data-theme="tufting"
      className="min-h-screen w-full bg-tufting-warm py-20 px-4 sm:px-6 lg:px-8 text-primary"
    >
      <div className="max-w-xl mx-auto text-center flex flex-col gap-6">
        <Icon size={48} className="mx-auto text-accent" aria-hidden="true" />

        <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">{title}</h1>

        <p className="text-secondary leading-relaxed">{body}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-on-accent px-8 py-4 rounded-full font-bold transition-opacity hover:opacity-90 min-h-11"
            >
              Escribime por WhatsApp
            </a>
          )}
          <Link
            to="/servicios/tufting/calculadora"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-line font-semibold transition-colors hover:border-accent hover:text-accent min-h-11"
          >
            Volver al bastidor
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
