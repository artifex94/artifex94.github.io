import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/render';
import { OrderForm } from './OrderForm';
import type { Shape } from '../../../data/tuftingCalculator';

// La regla del taller: el pago online aparece RECIÉN después de enviar el
// encargo, cuando el pedido ya quedó registrado en el panel. Estos tests cubren
// la confirmación post-envío, que es donde vive el único botón de pago.
vi.mock('../../../data/tuftingCheckout', async () => {
  const actual = await vi.importActual<typeof import('../../../data/tuftingCheckout')>(
    '../../../data/tuftingCheckout',
  );
  return {
    ...actual,
    createOrder: vi.fn().mockResolvedValue({ orderId: 'order-1' }),
    payOrderDeposit: vi.fn().mockResolvedValue({ initPoint: 'https://mp/pay' }),
  };
});

const renderForm = (overrides: { shape?: Shape; payByTransfer?: boolean } = {}) =>
  renderWithProviders(
    <OrderForm
      shape={overrides.shape ?? 'rectangular'}
      dimensions={{ widthCm: 100, heightCm: 100 }}
      areaM2={1}
      colors={[]}
      payByTransfer={overrides.payByTransfer ?? false}
      discountCode=""
      total={125_000}
    />,
  );

/** Completa los datos obligatorios y envía el encargo. */
const enviarEncargo = async () => {
  await userEvent.type(screen.getByLabelText(/nombre/i), 'Clienta');
  await userEvent.type(screen.getByLabelText(/email/i), 'clienta@example.com');
  await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
  await screen.findByText(/reservale un turno/i);
};

describe('OrderForm: el pago aparece solo después de enviar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('antes de enviar no hay ningún botón de pago', () => {
    renderForm();
    expect(screen.queryByRole('button', { name: /pagar/i })).toBeNull();
  });

  it('después de enviar aparece el pago del total', async () => {
    renderForm();
    await enviarEncargo();

    expect(screen.getByRole('button', { name: /pagar el total/i })).toBeInTheDocument();
    // Y explica que las cuotas las da la pasarela, no la web.
    expect(screen.getByText(/2 o 3 cuotas con tu tarjeta/i)).toBeInTheDocument();
  });

  it('con transferencia elegida no ofrece el pago con tarjeta ni después de enviar', async () => {
    renderForm({ payByTransfer: true });
    await enviarEncargo();

    expect(screen.queryByRole('button', { name: /pagar/i })).toBeNull();
    expect(screen.getByText(/te escribo por whatsapp/i)).toBeInTheDocument();
  });

  it('la contorneada no ofrece pago online ni después de enviar', async () => {
    renderForm({ shape: 'contorneada' });
    await enviarEncargo();

    expect(screen.queryByRole('button', { name: /pagar/i })).toBeNull();
    expect(screen.getByText(/link de pago por whatsapp/i)).toBeInTheDocument();
  });
});
