import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import { buildMailto, buildWhatsAppUrl, type ServiceKey } from '../data/contact';

interface ContactCTAProps {
  service: ServiceKey;
  emailSubject: string;
  /** Texto del botón principal (WhatsApp si hay número; email si no). */
  label?: string;
  className?: string;
  /** Bordes redondeados para los temas artesanales (tufting). */
  rounded?: boolean;
}

// Par de botones de contacto que hereda los tokens del theme activo:
// dentro de [data-theme='...'] toma los colores de ese servicio.
export const ContactCTA: React.FC<ContactCTAProps> = ({
  service,
  emailSubject,
  label = 'Escribime por WhatsApp',
  className,
  rounded = false,
}) => {
  const whatsappUrl = buildWhatsAppUrl(service);
  const radius = rounded ? 'rounded-full' : '';

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-center gap-4', className)}>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-2 bg-accent text-on-accent px-8 py-4 font-bold transition-all duration-300 hover:opacity-90 hover:shadow-lg',
            radius
          )}
        >
          <MessageCircle size={18} /> {label}
        </a>
      )}
      <a
        href={buildMailto(emailSubject)}
        className={cn(
          'inline-flex items-center gap-2 px-8 py-4 font-bold border border-line text-primary transition-all duration-300 hover:border-accent hover:text-accent',
          !whatsappUrl && 'bg-accent text-on-accent border-accent hover:opacity-90 hover:text-on-accent',
          radius
        )}
      >
        <Mail size={18} /> {whatsappUrl ? 'O por email' : 'Escribime por email'}
      </a>
    </div>
  );
};
