import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { AnimatedPrice } from '../../dev/AnimatedPrice';
import {
  computePrice,
  formatARS,
  DISCOUNTS,
  DISCOUNT_LABELS,
  INSTALLMENT_DEPOSIT_RATE,
  type DiscountId,
} from '../../../data/tuftingPricing';
import { describeDimensions, describeShape } from '../../../data/tuftingCalculator';
import { buildQuoteWhatsAppUrl } from '../../../data/contact';
import { woolById } from '../../../data/wools';
import { resolveAreaM2, type CalculatorAction, type CalculatorState } from '../../../hooks/useCalculatorState';
import { PaymentActions } from './PaymentActions';

interface QuoteStepProps {
  state: CalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
}

// Muestra el presupuesto. A propósito NO desglosa materiales, horas ni ganancia:
// el cliente ve un total y las formas de pago, nada más. Hay un test que lo
// verifica para que nadie lo agregue sin querer.
export const QuoteStep: React.FC<QuoteStepProps> = ({ state, dispatch }) => {
  const { shape, dimensions, discounts, woolIds } = state;
  const [discountCode, setDiscountCode] = useState('');
  const areaM2 = resolveAreaM2(state);

  if (!shape || areaM2 === null) {
    return (
      <p className="text-secondary">
        Volvé al paso anterior y completá las medidas para ver el presupuesto.
      </p>
    );
  }

  const price = computePrice({ areaM2, discounts });
  const woolNames = woolIds.map((id) => woolById(id)?.name).filter((name): name is string => !!name);

  const whatsappUrl = buildQuoteWhatsAppUrl({
    shape: describeShape(shape),
    dimensions: describeDimensions(shape, dimensions),
    areaM2: price.billableAreaM2.toFixed(2),
    total: formatARS(price.total),
    listTotal: price.appliedDiscount ? formatARS(price.listTotal) : undefined,
    discountLabel: price.appliedDiscount ? DISCOUNT_LABELS[price.appliedDiscount] : undefined,
    wools: woolNames,
  });

  const deposit = Math.ceil((price.total * INSTALLMENT_DEPOSIT_RATE) / 1000) * 1000;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-2">Tu presupuesto</h2>
        <p className="text-secondary text-sm">
          Es una estimación firme para estas medidas. Si querés cambiar algo, volvé atrás.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-4 bg-surface border border-line rounded-2xl p-6 text-sm">
        <dt className="text-secondary">Forma</dt>
        <dd className="text-right font-medium">{describeShape(shape)}</dd>

        <dt className="text-secondary">Medidas</dt>
        <dd className="text-right font-medium">{describeDimensions(shape, dimensions)}</dd>

        <dt className="text-secondary">Superficie</dt>
        <dd className="text-right font-medium">{price.billableAreaM2.toFixed(2)} m²</dd>

        {woolNames.length > 0 && (
          <>
            <dt className="text-secondary">Colores</dt>
            <dd className="text-right font-medium">{woolNames.join(', ')}</dd>
          </>
        )}
      </dl>

      <div className="text-center py-4">
        {price.appliedDiscount && (
          <p className="text-secondary line-through text-lg mb-1">{formatARS(price.listTotal)}</p>
        )}
        <AnimatedPrice
          value={formatARS(price.total)}
          className="font-display text-5xl font-semibold text-accent"
        />
        {price.appliedDiscount && (
          <p className="text-sm text-accent mt-2">
            Con {DISCOUNT_LABELS[price.appliedDiscount].toLowerCase()}
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-display text-lg font-semibold mb-2">Cómo querés pagarlo</legend>

        {(Object.keys(DISCOUNTS) as DiscountId[]).map((id) => {
          const active = discounts.includes(id);
          return (
            <label
              key={id}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors min-h-11',
                active ? 'border-accent bg-accent/5' : 'border-line bg-surface hover:border-accent',
              )}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => dispatch({ type: 'discount-toggled', discount: id })}
                className="accent-current"
              />
              <span className="text-sm">
                <span className="font-semibold">{DISCOUNT_LABELS[id]}</span>
                <span className="text-secondary"> · {Math.round(DISCOUNTS[id] * 100)}% off</span>
              </span>
            </label>
          );
        })}

        <div className="p-4 rounded-xl border border-line bg-surface text-sm">
          <p className="font-semibold mb-1">Cuotas con débito automático</p>
          <p className="text-secondary leading-relaxed">
            Sin descuento, pero lo pagás en partes. Se arranca con un anticipo de{' '}
            <strong className="text-primary">{formatARS(deposit)}</strong> y el resto se debita
            solo, mes a mes.
          </p>
        </div>

        {discounts.includes('instagram') && (
          <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-line bg-surface">
            <label htmlFor="discount-code" className="text-sm font-semibold">
              Tu código de Instagram
            </label>
            <input
              id="discount-code"
              type="text"
              value={discountCode}
              onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
              placeholder="PEDIMELO-POR-DM"
              aria-describedby="discount-code-hint"
              className="bg-base border border-line rounded-lg px-3 py-2 min-h-11 text-primary"
            />
            <p id="discount-code-hint" className="text-xs text-secondary">
              Instagram no me deja verificar solo quién me sigue, así que el código te lo paso yo
              por mensaje directo.
            </p>
          </div>
        )}
      </fieldset>

      <p className="flex items-start gap-2 text-xs text-secondary">
        <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        Los descuentos no se acumulan: se aplica el que más te conviene.
      </p>

      <PaymentActions
        shape={shape}
        dimensions={dimensions}
        woolIds={woolIds}
        payByTransfer={discounts.includes('transferencia')}
        discountCode={discountCode}
        total={price.total}
        whatsappUrl={whatsappUrl}
      />
    </div>
  );
};
