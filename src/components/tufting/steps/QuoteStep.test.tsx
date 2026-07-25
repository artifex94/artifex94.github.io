import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/render';
import { QuoteStep } from './QuoteStep';
import { initialCalculatorState, type CalculatorState } from '../../../hooks/useCalculatorState';
import { computePrice, formatARS, DISCOUNT_LABELS } from '../../../data/tuftingPricing';
import { wools } from '../../../data/wools';

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
  woolIds: [wools[0].id, wools[5].id],
  ...overrides,
});

describe('QuoteStep', () => {
  it('muestra el total calculado', () => {
    const state = estadoConPresupuesto();
    renderWithProviders(<QuoteStep state={state} dispatch={vi.fn()} />);

    const esperado = computePrice({ areaM2: 1, discounts: [] });
    expect(buscarMonto(formatARS(esperado.total))).toBeInTheDocument();
  });

  it('NO muestra el desglose de costos', () => {
    // El requisito es que el cliente vea un total y nada más. Este test existe
    // para que nadie agregue "materiales: $X" en un refactor bienintencionado.
    const state = estadoConPresupuesto({ discounts: ['transferencia'] });
    renderWithProviders(<QuoteStep state={state} dispatch={vi.fn()} />);

    for (const prohibido of [/materiales/i, /mano de obra/i, /margen/i, /ganancia/i, /costo/i]) {
      expect(screen.queryByText(prohibido)).toBeNull();
    }
    // Y el número del costo de material tampoco puede aparecer en pantalla.
    expect(screen.queryByText(/75\.000/)).toBeNull();
  });

  it('muestra el resumen de forma, medidas y superficie', () => {
    renderWithProviders(<QuoteStep state={estadoConPresupuesto()} dispatch={vi.fn()} />);

    expect(screen.getByText('Rectangular')).toBeInTheDocument();
    expect(screen.getByText('100 x 100 cm')).toBeInTheDocument();
    expect(screen.getByText('1.00 m²')).toBeInTheDocument();
  });

  it('tacha el precio de lista cuando hay descuento', () => {
    const state = estadoConPresupuesto({ discounts: ['transferencia'] });
    renderWithProviders(<QuoteStep state={state} dispatch={vi.fn()} />);

    const price = computePrice({ areaM2: 1, discounts: ['transferencia'] });
    expect(buscarMonto(formatARS(price.listTotal))).toBeInTheDocument();
    expect(buscarMonto(formatARS(price.total))).toBeInTheDocument();
  });

  it('avisa que los descuentos no se acumulan', () => {
    renderWithProviders(<QuoteStep state={estadoConPresupuesto()} dispatch={vi.fn()} />);
    expect(screen.getByText(/no se acumulan/i)).toBeInTheDocument();
  });

  it('ofrece cuotas con débito automático, sin descuento', () => {
    renderWithProviders(<QuoteStep state={estadoConPresupuesto()} dispatch={vi.fn()} />);

    expect(screen.getByText(/cuotas con débito automático/i)).toBeInTheDocument();
    expect(screen.getByText(/sin descuento/i)).toBeInTheDocument();
  });

  it('avisa al dispatch cuando se marca un descuento', async () => {
    const dispatch = vi.fn();
    renderWithProviders(<QuoteStep state={estadoConPresupuesto()} dispatch={dispatch} />);

    await userEvent.click(screen.getByLabelText(new RegExp(DISCOUNT_LABELS.transferencia, 'i')));
    expect(dispatch).toHaveBeenCalledWith({ type: 'discount-toggled', discount: 'transferencia' });
  });

  it('arma el link de WhatsApp con el presupuesto adentro', () => {
    renderWithProviders(<QuoteStep state={estadoConPresupuesto()} dispatch={vi.fn()} />);

    const link = screen.getByRole('link', { name: /encargarlo por whatsapp/i });
    const texto = decodeURIComponent(link.getAttribute('href')?.split('?text=')[1] ?? '');
    expect(texto).toContain('Rectangular');
    expect(texto).toContain('100 x 100 cm');
  });

  it('pide volver atrás si todavía no hay medidas', () => {
    const state = estadoConPresupuesto({ shape: null, dimensions: {} });
    renderWithProviders(<QuoteStep state={state} dispatch={vi.fn()} />);

    expect(screen.getByText(/completá las medidas/i)).toBeInTheDocument();
  });
});
