import React, { useState } from 'react';
import { Loader2, PackageCheck, Send, CreditCard } from 'lucide-react';
import { cn } from '../../../utils/cn';
import {
  createOrder,
  getDesignUploadUrl,
  uploadDesign,
  payOrderDeposit,
  DepositError,
  type DesignImageType,
  type DepositPortion,
} from '../../../data/tuftingCheckout';
import { formatARS } from '../../../data/tuftingPricing';
import type { Dimensions, Shape } from '../../../data/tuftingCalculator';
import { exportDesignBlob, type ComposeParams } from '../../../utils/shapeComposer';

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
  fillColor?: string;
  borderColor?: string;
  borderThick?: boolean;
  rotationDeg?: number;
  pieceWidthCm?: number;
  pieceHeightCm?: number;
  payByTransfer: boolean;
  discountCode: string;
  /** Total del presupuesto, para calcular y mostrar la seña. */
  total: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED: readonly string[] = ['image/png', 'image/jpeg', 'image/webp'];

const loadHtmlImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No pude preparar la imagen para exportar el diseño.'));
    image.src = url;
  });

const uploadBlob = async (blob: Blob, contentType: DesignImageType): Promise<string> => {
  const upload = await getDesignUploadUrl(contentType);
  await uploadDesign(upload.signedUrl, blob);
  return upload.path;
};

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
  fillColor,
  borderColor,
  borderThick = false,
  rotationDeg = 0,
  pieceWidthCm,
  pieceHeightCm,
  payByTransfer,
  discountCode,
  total,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [depositBusy, setDepositBusy] = useState<DepositPortion | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  const canSend = name.trim().length > 0 && EMAIL_RE.test(email.trim()) && !busy;

  const payDeposit = async (portion: DepositPortion) => {
    if (!orderId) return;
    setDepositError(null);
    setDepositBusy(portion);
    try {
      const { initPoint } = await payOrderDeposit(orderId, portion);
      window.location.href = initPoint;
    } catch (cause) {
      const msg =
        cause instanceof DepositError && cause.code === 'mp_unavailable'
          ? 'El pago online no está disponible en este momento. Te coordino la seña por WhatsApp.'
          : 'No pude iniciar el pago de la seña. Probá de nuevo en un rato.';
      setDepositError(msg);
      setDepositBusy(null);
    }
  };

  const submit = async () => {
    setError(null);
    if (!canSend) return;
    setBusy(true);
    try {
      let designImagePath: string | undefined;
      let referenceImagePath: string | undefined;

      // Subir el diseño, si hay uno prendido en el bastidor.
      if (designObjectUrl) {
        const originalBlob = await fetch(designObjectUrl).then((response) => response.blob());
        if (!ALLOWED.includes(originalBlob.type)) {
          throw new Error('El diseño tiene que ser PNG, JPG o WebP.');
        }

        if (shape === 'circular' || shape === 'rectangular') {
          if (!fillColor || !borderColor || !pieceWidthCm || !pieceHeightCm) {
            throw new Error('Faltan datos del diseño para exportar la pieza.');
          }

          const image = await loadHtmlImage(designObjectUrl);
          const params: ComposeParams = {
            shape,
            pieceWidthCm,
            pieceHeightCm,
            fillColor,
            borderColor,
            borderThick,
            rotationDeg,
            image,
            imageWidth: image.naturalWidth || image.width,
            imageHeight: image.naturalHeight || image.height,
          };
          const composedBlob = await exportDesignBlob(params);
          designImagePath = await uploadBlob(composedBlob, 'image/png');
          referenceImagePath = await uploadBlob(originalBlob, originalBlob.type as DesignImageType);
        } else {
          designImagePath = await uploadBlob(originalBlob, originalBlob.type as DesignImageType);
        }
      }

      // El color y el grosor del borde, la rotación y el óvalo viajan como datos
      // estructurados (no en la nota): así el encargo especifica exactamente lo
      // que la persona armó en el bastidor. La nota queda solo para el cliente.
      const isDesigned = shape === 'circular' || shape === 'rectangular';

      const result = await createOrder({
        shape,
        diameterCm: dimensions.diameterCm,
        ovalRatio: dimensions.ovalRatio,
        widthCm: dimensions.widthCm,
        heightCm: dimensions.heightCm,
        // Solo la contorneada manda área; en las simples el server la recalcula.
        areaM2: shape === 'contorneada' ? (areaM2 ?? undefined) : undefined,
        colors,
        ...(isDesigned ? { borderColor: borderName, borderThick, rotationDeg } : {}),
        designImagePath,
        referenceImagePath,
        customerNote: note.trim() || undefined,
        contact: { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined },
        payByTransfer,
        discountCode: discountCode.trim() || undefined,
      });

      setOrderId(result.orderId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pude enviar el encargo.');
    } finally {
      setBusy(false);
    }
  };

  if (orderId) {
    const depositBtn =
      'inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold transition-opacity min-h-11 disabled:opacity-50 disabled:cursor-not-allowed';
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-accent/40 bg-accent/5 p-6 text-center">
        <PackageCheck size={28} className="text-accent" aria-hidden="true" />
        <p className="font-display text-lg font-semibold">Reservale un turno en el bastidor</p>
        <p className="text-sm text-secondary leading-relaxed">
          Tu diseño y tus medidas ya están en el taller. Te escribo a la brevedad para confirmar
          todo y coordinar.
        </p>

        <div className="flex w-full max-w-md flex-col gap-3 pt-1">
          <button
            type="button"
            onClick={() => payDeposit('full')}
            disabled={depositBusy !== null}
            className={cn(depositBtn, 'bg-accent text-on-accent hover:opacity-90')}
          >
            {depositBusy === 'full' ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <CreditCard size={18} aria-hidden="true" />
            )}
            Pagar el total · {formatARS(total)}
          </button>
        </div>
        <p className="text-xs text-secondary">
          Podés pagar el total y dejarlo cerrado, o señar la propuesta pagando la primera cuota
          para que el trabajo arranque — el resto se debita solo, mes a mes. Las cuotas las
          coordinamos al confirmar el encargo.
        </p>

        {depositError && (
          <p role="alert" className="text-sm text-accent">
            {depositError}
          </p>
        )}
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
          Dejame tus datos para pasarte el presupuesto en firme y coordinar. Tu diseño y tus
          medidas viajan al taller tal cual los armaste en el bastidor.
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
