import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { AnimatedPrice } from '../../dev/AnimatedPrice';
import {
  computePrice,
  formatARS,
  instalmentAmountArs,
  DISCOUNTS,
  DISCOUNT_LABELS,
  DISCOUNT_MIN_LIST_ARS,
  MAX_INSTALMENTS,
  type DiscountId,
} from '../../../data/tuftingPricing';
import { canPayOnline } from '../../../data/tuftingCheckout';
import { describeDimensions, describeShape, minorAxisCm } from '../../../data/tuftingCalculator';
import { buildQuoteWhatsAppUrl } from '../../../data/contact';
import { woolById } from '../../../data/wools';
import type { DetectedColor } from '../../../utils/tuftingPipeline';
import { resolveAreaM2, type CalculatorAction, type CalculatorState } from '../../../hooks/useCalculatorState';
import { PaymentActions } from './PaymentActions';
import { OrderForm } from './OrderForm';

interface QuoteStepProps {
  state: CalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
  /** Colores del diseño ya llevados a lana. */
  detectedColors: readonly DetectedColor[];
}

// Muestra el presupuesto. A propósito NO desglosa materiales, horas ni ganancia:
// el cliente ve un total y las formas de pago, nada más. Hay un test que lo
// verifica para que nadie lo agregue sin querer.
export const QuoteStep: React.FC<QuoteStepProps> = ({ state, dispatch, detectedColors }) => {
  const {
    shape,
    dimensions,
    discounts,
    borderWoolId,
    fillWoolId,
    borderSameAsFill,
    borderThick,
    rotationDeg,
  } = state;
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
  const colorNames = detectedColors.map((color) => color.name);
  const fillColor = woolById(fillWoolId)?.hex ?? '#f4f1ea';
  const borderColor = borderSameAsFill ? fillColor : (woolById(borderWoolId)?.hex ?? '#1a1a1a');
  const borderName = borderSameAsFill ? woolById(fillWoolId)?.name : woolById(borderWoolId)?.name;
  const pieceWidthCm =
    shape === 'circular' ? dimensions.diameterCm : shape === 'rectangular' ? dimensions.widthCm : undefined;
  const pieceHeightCm =
    shape === 'circular' && dimensions.diameterCm
      ? minorAxisCm(dimensions.diameterCm, dimensions.ovalRatio)
      : shape === 'rectangular'
        ? dimensions.heightCm
        : undefined;

  const whatsappUrl = buildQuoteWhatsAppUrl({
    shape: describeShape(shape),
    dimensions: describeDimensions(shape, dimensions),
    areaM2: price.billableAreaM2.toFixed(2),
    total: formatARS(price.total),
    listTotal: price.appliedDiscount ? formatARS(price.listTotal) : undefined,
    discountLabel: price.appliedDiscount ? DISCOUNT_LABELS[price.appliedDiscount] : undefined,
    wools: colorNames,
    border: borderName,
  });

  // La primera cuota hace de seña. Se estima con el plan más largo, que es el de
  // la cuota más baja; el paso de pago deja elegir entre INSTALMENT_OPTIONS.
  const smallestInstalment = instalmentAmountArs(price.total, MAX_INSTALMENTS);
  const online = canPayOnline(shape);
  // El código de Instagram solo se le ofrece a quien llega al mínimo: mostrarlo
  // en una pieza de $30.000 sería prometer un descuento que no se va a aplicar.
  const offeredDiscounts = (Object.keys(DISCOUNTS) as DiscountId[]).filter(
    (id) => price.listTotal >= DISCOUNT_MIN_LIST_ARS[id],
  );
  const instagramOffered = offeredDiscounts.includes('instagram');

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div>
        <h2 className="font-display text-2xl font-semibold mb-2">La ficha de tu pieza</h2>
        <p className="text-secondary text-sm">
          {price.requiresManualQuote
            ? 'Una pieza de este tamaño la cotizo a mano: escribime y lo vemos juntos.'
            : 'Un presupuesto firme para estas medidas. Si algo no cierra, el bastidor sigue ahí: volvé y ajustá.'}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,248,240,0.8))] p-4 text-sm shadow-[0_14px_30px_rgba(112,70,52,0.09),inset_0_1px_0_rgba(255,255,255,0.9)] sm:gap-4 sm:p-6">
        <dt className="text-secondary">Forma</dt>
        <dd className="text-right font-medium">{describeShape(shape)}</dd>

        <dt className="text-secondary">Medidas</dt>
        <dd className="text-right font-medium">{describeDimensions(shape, dimensions)}</dd>

        <dt className="text-secondary">Superficie</dt>
        <dd className="text-right font-medium">
          {areaM2.toFixed(2)} m²
          {price.billableAreaM2 > areaM2 && (
            // El área chica se cobra como el mínimo facturable: mostrar ese
            // número como si fuera la medida real sería mentirle al cliente.
            <span className="block text-xs font-normal text-secondary">
              se cobra el mínimo de {price.billableAreaM2.toFixed(2)} m²
            </span>
          )}
        </dd>

        {colorNames.length > 0 && (
          <>
            <dt className="text-secondary">Colores</dt>
            <dd className="text-right font-medium">{colorNames.join(', ')}</dd>
          </>
        )}

        {borderName && (
          <>
            <dt className="text-secondary">Borde</dt>
            <dd className="text-right font-medium">{borderName}</dd>
          </>
        )}
      </dl>

      <div className="py-2 text-center sm:py-4">
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

        {offeredDiscounts.map((id) => {
          const active = discounts.includes(id);
          const minimum = DISCOUNT_MIN_LIST_ARS[id];
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
                {minimum > 0 && (
                  <span className="text-secondary"> · en piezas desde {formatARS(minimum)}</span>
                )}
              </span>
            </label>
          );
        })}

        <div className="rounded-xl border border-line bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,248,240,0.74))] p-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <p className="font-semibold mb-1">Cuotas con débito automático</p>
          <p className="text-secondary leading-relaxed">
            {online ? (
              <>
                Podés pagar el total, o señar la propuesta pagando la primera cuota (desde{' '}
                <strong className="text-primary">{formatARS(smallestInstalment)}</strong> en{' '}
                {MAX_INSTALMENTS}) para que el trabajo arranque. Las que quedan se debitan solas,
                mes a mes. Sin descuento.
              </>
            ) : (
              <>
                Las piezas contorneadas también se pueden pagar en 2 o 3 cuotas: las coordinamos por
                WhatsApp cuando confirmemos el diseño y las medidas finales.
              </>
            )}
          </p>
        </div>

        {discounts.includes('instagram') && instagramOffered && (
          <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,248,240,0.74))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
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
              por mensaje directo. Vale para piezas desde{' '}
              {formatARS(DISCOUNT_MIN_LIST_ARS.instagram)}.
            </p>
          </div>
        )}
      </fieldset>

      <p className="flex items-start gap-2 text-xs text-secondary">
        <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        Los descuentos no se acumulan: se aplica el que más te conviene.
      </p>

      <div className="border-t border-line pt-6">
        <OrderForm
          shape={shape}
          dimensions={dimensions}
          areaM2={areaM2}
          colors={colorNames}
          borderName={borderName}
          designObjectUrl={state.upload?.objectUrl}
          fillColor={fillColor}
          borderColor={borderColor}
          borderThick={borderThick}
          rotationDeg={rotationDeg}
          pieceWidthCm={pieceWidthCm}
          pieceHeightCm={pieceHeightCm}
          payByTransfer={discounts.includes('transferencia')}
          discountCode={discountCode}
          total={price.total}
        />
      </div>

      <div className="border-t border-line pt-6">
        <p className="text-center text-xs text-secondary uppercase tracking-widest mb-4">
          {online ? 'o cerralo ahora mismo' : 'o seguilo por WhatsApp'}
        </p>
        <PaymentActions
          shape={shape}
          dimensions={dimensions}
          colors={colorNames}
          payByTransfer={discounts.includes('transferencia')}
          discountCode={discountCode}
          total={price.total}
          whatsappUrl={whatsappUrl}
        />
      </div>
    </div>
  );
};
