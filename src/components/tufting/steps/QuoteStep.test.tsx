import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/render';
import { QuoteStep } from './QuoteStep';
import { initialCalculatorState, type CalculatorState } from '../../../hooks/useCalculatorState';
import { computePrice, formatARS, DISCOUNT_LABELS } from '../../../data/tuftingPricing';
import type { DetectedColor } from '../../../utils/tuftingPipeline';

/**
 * Busca un monto en pantalla ignorando el espacio duro que mete es-AR entre el
 * símbolo y el número. getByText normaliza espacios comunes pero no U+00A0.
 */
const buscarMonto = (monto: string) => {
  const normalizar = (texto: string) => texto.replace(/\u00A0/g, ' ').trim();
  // getAllByText porque AnimatedPrice envuelve el monto en dos spans anidados:
  // ambos tienen el mismo textContent y alcanza con que exista alguno.
  return screen.getAllByText(
    (_, element) => normalizar(element?.textContent ?? '') === normalizar(monto),
    { selector: 'span,p,dd,strong' },
  )[0];
};

const estadoConPresupuesto = (overrides: Partial<CalculatorState> = {}): CalculatorState => ({
  ...initialCalculatorState,
  step: 'quote',
  upload: {
    fileName: 'diseño.png',
    objectUrl: 'blob:fake',
    info: { format: 'png', width: 1000, height: 800, hasAlphaChannel: true },
    contourable: true,
  },
  shape: 'rectangular',
  dimensions: { widthCm: 100, heightCm: 100 },
  ...overrides,
});

const renderQuote = (
  state: CalculatorState,
  dispatch = vi.fn(),
  detectedColors: readonly DetectedColor[] = [],
) => renderWithProviders(<QuoteStep state={state} dispatch={dispatch} detectedColors={detectedColors} />);

describe('QuoteStep', () => {
  it('muestra el total calculado', () => {
    renderQuote(estadoConPresupuesto());

    const esperado = computePrice({ areaM2: 1, discounts: [] });
    expect(buscarMonto(formatARS(esperado.total))).toBeInTheDocument();
  });

  it('NO muestra el desglose de costos', () => {
    // El requisito es que el cliente vea un total y nada más. Este test existe
    // para que nadie agregue "materiales: $X" en un refactor bienintencionado.
    const state = estadoConPresupuesto({ discounts: ['transferencia'] });
    const { container } = renderQuote(state);
    const texto = container.textContent ?? '';

    for (const prohibido of [/margen/i, /ganancia/i, /mano de obra/i, /costo de/i, /por m²:/i]) {
      expect(texto, `apareció "${prohibido}" en pantalla`).not.toMatch(prohibido);
    }

    // Ni el costo del material ni el precio por m² pueden llegar a la pantalla.
    expect(texto).not.toContain('75.000');
    expect(texto).not.toContain('132.35');
  });

  it('muestra el resumen de forma, medidas y superficie', () => {
    renderQuote(estadoConPresupuesto());

    expect(screen.getByText('Rectangular')).toBeInTheDocument();
    expect(screen.getByText('100 x 100 cm')).toBeInTheDocument();
    expect(screen.getByText('1.00 m²')).toBeInTheDocument();
  });

  it('lista los colores detectados y el color del borde', () => {
    const detected: DetectedColor[] = [
      { rgb: [194, 94, 76], lab: [0, 0, 0], name: 'Terracota' },
      { rgb: [232, 220, 196], lab: [0, 0, 0], name: 'Crema' },
    ];
    renderQuote(estadoConPresupuesto(), vi.fn(), detected);

    expect(screen.getByText('Terracota, Crema')).toBeInTheDocument();
    // El borde por defecto es Negro.
    expect(screen.getByText('Negro')).toBeInTheDocument();
  });

  it('tacha el precio de lista cuando hay descuento', () => {
    const state = estadoConPresupuesto({ discounts: ['transferencia'] });
    renderQuote(state);

    const price = computePrice({ areaM2: 1, discounts: ['transferencia'] });
    expect(buscarMonto(formatARS(price.listTotal))).toBeInTheDocument();
    expect(buscarMonto(formatARS(price.total))).toBeInTheDocument();
  });

  it('avisa que los descuentos no se acumulan', () => {
    renderQuote(estadoConPresupuesto());
    expect(screen.getByText(/no se acumulan/i)).toBeInTheDocument();
  });

  it('ofrece cuotas con débito automático, sin descuento', () => {
    renderQuote(estadoConPresupuesto());

    expect(screen.getByText(/cuotas con débito automático/i)).toBeInTheDocument();
    expect(screen.getByText(/sin descuento/i)).toBeInTheDocument();
  });

  it('avisa al dispatch cuando se marca un descuento', async () => {
    const dispatch = vi.fn();
    renderQuote(estadoConPresupuesto(), dispatch);

    await userEvent.click(screen.getByLabelText(new RegExp(DISCOUNT_LABELS.transferencia, 'i')));
    expect(dispatch).toHaveBeenCalledWith({ type: 'discount-toggled', discount: 'transferencia' });
  });

  it('arma el link de WhatsApp con el presupuesto adentro', () => {
    const detected: DetectedColor[] = [{ rgb: [194, 94, 76], lab: [0, 0, 0], name: 'Terracota' }];
    renderQuote(estadoConPresupuesto(), vi.fn(), detected);

    const link = screen.getByRole('link', { name: /whatsapp/i });
    const texto = decodeURIComponent(link.getAttribute('href')?.split('?text=')[1] ?? '');
    expect(texto).toContain('Rectangular');
    expect(texto).toContain('100 x 100 cm');
    expect(texto).toContain('Terracota');
    expect(texto).toContain('Borde: Negro');
  });

  it('ofrece pagar online las formas que el servidor puede verificar', () => {
    renderQuote(estadoConPresupuesto());

    expect(screen.getByRole('button', { name: /pagar \$/i })).toBeInTheDocument();
    expect(screen.getByText(/pagarlo en cuotas/i)).toBeInTheDocument();
  });

  it('NO ofrece pago online en una pieza contorneada', () => {
    // El servidor no puede recalcular su área sin la máscara de la imagen, así
    // que no puede verificar el precio: esos pedidos se cierran a mano.
    const state = estadoConPresupuesto({
      shape: 'contorneada',
      dimensions: { feretCm: 80 },
      measuredAreaM2: 0.91,
    });
    renderQuote(state);

    expect(screen.queryByRole('button', { name: /pagar \$/i })).toBeNull();
    expect(screen.getByRole('link', { name: /whatsapp/i })).toBeInTheDocument();
  });

  it('pide volver atrás si todavía no hay medidas', () => {
    const state = estadoConPresupuesto({ shape: null, dimensions: {} });
    renderQuote(state);

    expect(screen.getByText(/completá las medidas/i)).toBeInTheDocument();
  });
});
