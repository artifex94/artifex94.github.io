import React, { useState } from 'react';
import { Loader2, PackageCheck, Send } from 'lucide-react';
import { cn } from '../../../utils/cn';
import {
  createOrder,
  getDesignUploadUrl,
  uploadDesign,
  type DesignImageType,
} from '../../../data/tuftingCheckout';
import type { Dimensions, Shape } from '../../../data/tuftingCalculator';

interface OrderFormProps {
  shape: Shape;
  dimensions: Dimensions;
  /** Área final de la pieza (para contorneada, la que declaró el cliente). */
  areaM2: number | null;
  /** Colores detectados en el diseño, por nombre. */
  colors: readonly string[];
  /** Nombre del color de borde elegido. */
  borderName?: string;
  /** URL temporal del diseño subido: de ahí se saca el blob para subir a Storage. */
  designObjectUrl?: string;
  payByTransfer: boolean;
  discountCode: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED: readonly string[] = ['image/png', 'image/jpeg', 'image/webp'];

// Envía el encargo al taller: sube el diseño al bucket privado y crea el registro
// que aparece en el panel admin (con aviso por email). Funciona para las tres
// formas — es el único camino estructurado para la contorneada, que no se paga
// online.
export const OrderForm: React.FC<OrderFormProps> = ({
  shape,
  dimensions,
  areaM2,
  colors,
  borderName,
  designObjectUrl,
  payByTransfer,
  discountCode,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const canSend = name.trim().length > 0 && EMAIL_RE.test(email.trim()) && !busy;

  const submit = async () => {
    setError(null);
    if (!canSend) return;
    setBusy(true);
    try {
      let designImagePath: string | undefined;

      // Subir el diseño, si hay uno prendido en el bastidor.
      if (designObjectUrl) {
        const blob = await fetch(designObjectUrl).then((response) => response.blob());
        if (!ALLOWED.includes(blob.type)) {
          throw new Error('El diseño tiene que ser PNG, JPG o WebP.');
        }
        const upload = await getDesignUploadUrl(blob.type as DesignImageType);
        await uploadDesign(upload.signedUrl, blob);
        designImagePath = upload.path;
      }

      // El color del borde no tiene columna propia: viaja en la nota.
      const noteParts = [];
      if (borderName) noteParts.push(`Borde: ${borderName}`);
      if (note.trim()) noteParts.push(note.trim());

      await createOrder({
        shape,
        diameterCm: dimensions.diameterCm,
        widthCm: dimensions.widthCm,
        heightCm: dimensions.heightCm,
        // Solo la contorneada manda área; en las simples el server la recalcula.
        areaM2: shape === 'contorneada' ? (areaM2 ?? undefined) : undefined,
        colors,
        designImagePath,
        customerNote: noteParts.join('\n\n') || undefined,
        contact: { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined },
        payByTransfer,
        discountCode: discountCode.trim() || undefined,
      });

      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pude enviar el encargo.');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-accent/40 bg-accent/5 p-6 text-center">
        <PackageCheck size={28} className="text-accent" aria-hidden="true" />
        <p className="font-display text-lg font-semibold">¡Encargo enviado!</p>
        <p className="text-sm text-secondary leading-relaxed">
          Me llegó tu diseño y tus medidas. Te escribo a la brevedad para confirmar todo y coordinar.
        </p>
      </div>
    );
  }

  const field =
    'bg-surface border border-line rounded-lg px-3 py-2 min-h-11 text-primary w-full';

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-lg font-semibold">Enviá tu encargo</h3>
        <p className="text-sm text-secondary leading-relaxed">
          Te pido tus datos para pasarte el presupuesto en firme y coordinar. Me llega tu diseño y
          las medidas tal cual las armaste.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="order-name" className="text-sm font-semibold">
            Tu nombre
          </label>
          <input
            id="order-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={field}
            autoComplete="name"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="order-email" className="text-sm font-semibold">
            Tu email
          </label>
          <input
            id="order-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={field}
            autoComplete="email"
            placeholder="vos@email.com"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="order-phone" className="text-sm font-semibold">
          WhatsApp <span className="text-secondary font-normal">(opcional)</span>
        </label>
        <input
          id="order-phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className={field}
          autoComplete="tel"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="order-note" className="text-sm font-semibold">
          Nota <span className="text-secondary font-normal">(opcional)</span>
        </label>
        <textarea
          id="order-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          className={cn(field, 'resize-y')}
          placeholder="Alguna aclaración sobre colores, referencias o plazos."
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        className={cn(
          'inline-flex items-center justify-center gap-2 bg-accent text-on-accent px-8 py-4 rounded-full font-bold transition-opacity min-h-11',
          canSend ? 'hover:opacity-90' : 'opacity-40 cursor-not-allowed',
        )}
      >
        {busy ? (
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        ) : (
          <Send size={18} aria-hidden="true" />
        )}
        Enviar encargo
      </button>
    </div>
  );
};
