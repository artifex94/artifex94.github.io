import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils/cn';
import { buildMailto, buildWhatsAppUrl, type ServiceKey } from '../data/contact';

interface PackageCardProps {
  name: string;
  target: string;
  price: string;
  includes: string[];
  isFeatured?: boolean;
  service: ServiceKey;
  /** Bordes redondeados para los temas artesanales. */
  rounded?: boolean;
}

// Card de paquete/precio genérica: consume solo los tokens del theme activo,
// así sirve igual en fotografía (oscuro dorado) que en tufting (claro terracota).
export const PackageCard: React.FC<PackageCardProps> = ({
  name,
  target,
  price,
  includes,
  isFeatured,
  service,
  rounded = false,
}) => {
  const whatsappUrl = buildWhatsAppUrl(service);
  const contactUrl = whatsappUrl ?? buildMailto(`Consulta - ${name}`);

  return (
    <div
      className={cn(
        'relative flex flex-col p-8 bg-surface border transition-colors duration-300 hover:border-accent',
        isFeatured ? 'border-accent' : 'border-line',
        rounded && 'rounded-2xl'
      )}
    >
      {isFeatured && (
        <div
          className={cn(
            'absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-accent text-on-accent text-xs font-bold uppercase tracking-widest',
            rounded && 'rounded-full'
          )}
        >
          Más pedido
        </div>
      )}

      <h4 className="text-2xl font-bold text-primary mb-2">{name}</h4>
      <p className="text-sm text-secondary mb-6 leading-relaxed min-h-[40px]">{target}</p>
      <p className="text-3xl font-bold text-accent mb-8">{price}</p>

      <ul className="flex flex-col gap-3 mb-10 flex-grow">
        {includes.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-primary">
            <Check size={16} className="text-accent mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <a
        href={contactUrl}
        {...(whatsappUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={cn(
          'mt-auto w-full py-3 text-sm font-bold tracking-wide text-center transition-all duration-300',
          isFeatured
            ? 'bg-accent text-on-accent hover:opacity-90'
            : 'border border-line text-primary hover:border-accent hover:text-accent',
          rounded && 'rounded-full'
        )}
      >
        Consultar
      </a>
    </div>
  );
};
