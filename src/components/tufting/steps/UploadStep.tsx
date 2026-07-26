import React, { useCallback, useRef, useState } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { ImageHeaderInfo } from '../../../utils/imageFormat';
import { normalizeToPng } from '../../../utils/imageProbe';
import type { CalculatorAction, UploadState } from '../../../hooks/useCalculatorState';

/** Tamaño máximo del archivo. Arriba de esto el navegador sufre al decodificar. */
export const MAX_FILE_BYTES = 15 * 1024 * 1024;

/** Lado máximo aceptado. Safari en iOS falla en silencio con canvas muy grandes. */
export const MAX_IMAGE_SIDE = 8000;

/** Lado mínimo: menos que esto no alcanza para recortar una silueta decente. */
export const MIN_IMAGE_SIDE = 200;

interface UploadStepProps {
  upload: UploadState | null;
  error: string | null;
  dispatch: React.Dispatch<CalculatorAction>;
}

const formatMb = (bytes: number): string => `${(bytes / 1024 / 1024).toFixed(0)} MB`;

export const UploadStep: React.FC<UploadStepProps> = ({ upload, error, dispatch }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_BYTES) {
        dispatch({
          type: 'file-rejected',
          message: `El archivo pesa ${formatMb(file.size)} y el máximo es ${formatMb(MAX_FILE_BYTES)}. Probá exportarlo más liviano.`,
        });
        return;
      }

      // Se decodifica el archivo y se re-encoda a PNG bajo nuestro control: así el
      // celular no puede colarnos un JPEG sin transparencia ni un formato raro, y
      // el preview/pipeline/subida siempre trabajan sobre un PNG.
      const result = await normalizeToPng(file);

      if (!result.ok || !result.blob) {
        dispatch({
          type: 'file-rejected',
          message:
            result.reason === 'heic'
              ? 'Las fotos de iPhone (y algunos Android) vienen en formato HEIC. Convertila a PNG o JPG y volvé a subirla.'
              : 'No pude abrir este archivo como imagen. Subí un PNG, JPG o WebP.',
        });
        return;
      }

      const width = result.width;
      const height = result.height;
      const side = Math.max(width ?? 0, height ?? 0);
      if (side > MAX_IMAGE_SIDE) {
        dispatch({
          type: 'file-rejected',
          message: `La imagen mide ${width}x${height} px. El máximo por lado es ${MAX_IMAGE_SIDE} px.`,
        });
        return;
      }
      if (side < MIN_IMAGE_SIDE) {
        dispatch({
          type: 'file-rejected',
          message: `La imagen es muy chica (${width}x${height} px). Necesito al menos ${MIN_IMAGE_SIDE} px de lado.`,
        });
        return;
      }

      const info: ImageHeaderInfo = {
        format: 'png',
        width,
        height,
        hasAlphaChannel: !!result.hasAlpha,
      };
      const pngName = file.name.replace(/\.[^.]+$/, '') + '.png';

      dispatch({
        type: 'file-accepted',
        fileName: pngName,
        objectUrl: URL.createObjectURL(result.blob),
        info,
        contourable: !!result.hasAlpha,
      });
    },
    [dispatch],
  );

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-2">Cargá tu diseño</h2>
        <p className="text-secondary text-sm leading-relaxed">
          Elegí el <strong className="text-primary">archivo</strong> de tu diseño desde tu dispositivo
          (mejor un <strong className="text-primary">PNG con fondo transparente</strong> si querés la
          forma contorneada). Lo convierto a PNG automáticamente.
        </p>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center transition-colors',
          dragging ? 'border-accent bg-accent/5' : 'border-line',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          // Sin `accept` de imagen a propósito: en mobile abre el selector de
          // ARCHIVOS (no la cámara/galería, que rompe y re-encoda a JPEG). Lo que
          // no se pueda decodificar como imagen se rechaza con un mensaje claro.
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            // Permite volver a elegir el mismo archivo si antes fue rechazado.
            event.target.value = '';
          }}
        />

        <Upload className="mx-auto mb-4 text-accent" size={32} aria-hidden="true" />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 bg-accent text-on-accent px-6 py-3 rounded-full font-bold transition-opacity hover:opacity-90 min-h-11"
        >
          Elegir archivo
        </button>

        <p className="text-xs text-secondary mt-4">
          O arrastralo acá. PNG, JPG o WebP, hasta {formatMb(MAX_FILE_BYTES)}. Lo paso a PNG solo.
        </p>
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm text-accent">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* La imagen en sí queda prendida en el bastidor: acá solo el veredicto. */}
      {upload && (
        <div className="bg-surface border border-line rounded-2xl p-4 min-w-0">
          <p className="font-semibold truncate">{upload.fileName}</p>
          <p className="text-sm text-secondary">
            {upload.info.width} x {upload.info.height} px · {upload.info.format.toUpperCase()}
          </p>
          <p
            className={cn(
              'flex items-center gap-1.5 text-sm mt-1',
              upload.contourable ? 'text-accent' : 'text-secondary',
            )}
          >
            {upload.contourable ? (
              <>
                <CheckCircle2 size={14} aria-hidden="true" />
                Tiene transparencia: podés pedirla contorneada.
              </>
            ) : (
              <>
                <AlertCircle size={14} aria-hidden="true" />
                Sin transparencia: circular o rectangular.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
