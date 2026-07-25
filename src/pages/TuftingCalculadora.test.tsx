import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/render';
import { TuftingCalculadora } from './TuftingCalculadora';

describe('TuftingCalculadora', () => {
  it('renderiza el encabezado y el stepper', () => {
    renderWithProviders(<TuftingCalculadora />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/cuánto sale/i);
    expect(screen.getByRole('heading', { name: /subí tu diseño/i })).toBeInTheDocument();
  });

  it('setea title y canonical propios de la ruta', () => {
    // usePageMeta actualiza el canonical existente pero no lo crea: en el sitio
    // real viene en index.html, así que hay que sembrarlo como en su propio test.
    document.head.innerHTML = '<link rel="canonical" href="old" />';
    renderWithProviders(<TuftingCalculadora />);

    expect(document.title).toContain('Calculá el precio');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain(
      '/servicios/tufting/calculadora',
    );
  });

  it('arranca en el primer paso, con los siguientes bloqueados', () => {
    renderWithProviders(<TuftingCalculadora />);

    expect(screen.getByRole('button', { name: /1\. diseño/i })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByRole('button', { name: /4\. presupuesto/i })).toBeDisabled();
  });

  it('no deja seguir hasta que haya un archivo', () => {
    renderWithProviders(<TuftingCalculadora />);
    expect(screen.getByRole('button', { name: /seguir/i })).toBeDisabled();
  });

  it('deja volver a la página de tufting', () => {
    renderWithProviders(<TuftingCalculadora />);

    expect(screen.getByRole('link', { name: /volver a tufting/i })).toHaveAttribute(
      'href',
      '/servicios/tufting',
    );
  });

  it('aclara que el resultado final puede variar respecto de la pantalla', () => {
    // La lana es peluda y el color lee distinto en pelo: conviene decirlo.
    renderWithProviders(<TuftingCalculadora />);
    expect(screen.getByText(/pueden variar/i)).toBeInTheDocument();
  });
});
