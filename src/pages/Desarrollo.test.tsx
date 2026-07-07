import { describe, it, expect } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { renderWithProviders } from '../test/render';
import { Desarrollo } from './Desarrollo';
import { segments, differentiators } from '../data/business';
import { services } from '../data/services';
import { buildWhatsAppUrl } from '../data/contact';

const countOccurrences = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1;

describe('Desarrollo page', () => {
  it('renders the new hero heading', () => {
    renderWithProviders(<Desarrollo />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/Construyo la máquina/i);
  });

  it('links every segment to its live demo at /business/<slug>', () => {
    const { container } = renderWithProviders(<Desarrollo />);
    for (const segment of segments) {
      expect(container.querySelector(`a[href="/business/${segment.slug}"]`)).not.toBeNull();
    }
  });

  it('mentions the retainer figure exactly once', () => {
    const { container } = renderWithProviders(<Desarrollo />);
    expect(countOccurrences(container.textContent ?? '', '$50.000')).toBe(1);
  });

  it('does not lean on the "80% celular" cliché', () => {
    const { container } = renderWithProviders(<Desarrollo />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/80\s?%/);
    expect((text.match(/celular/gi) ?? []).length).toBeLessThanOrEqual(1);
  });

  it('does not echo the services.ts hub description verbatim', () => {
    const { container } = renderWithProviders(<Desarrollo />);
    const devDescription = services.find((s) => s.id === 'desarrollo')!.description;
    expect(container.textContent ?? '').not.toContain(devDescription);
  });

  it('switches price and pitch when a different presencia level is selected', () => {
    renderWithProviders(<Desarrollo />);
    expect(screen.getByText('$200.000')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Contenido' }));

    expect(screen.getByText('$400.000')).toBeInTheDocument();
    expect(screen.queryByText('$200.000')).not.toBeInTheDocument();
    expect(screen.getByText(/Todo lo de Esencial, más un blog/)).toBeInTheDocument();
  });

  it('expands a segment card via aria-expanded on click', () => {
    renderWithProviders(<Desarrollo />);
    expect(screen.getByRole('button', { name: /Inmobiliarias/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    fireEvent.click(screen.getByRole('button', { name: /Inmobiliarias/ }));
    expect(screen.getByRole('button', { name: /Inmobiliarias/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('shows the three differentiators', () => {
    renderWithProviders(<Desarrollo />);
    for (const item of differentiators) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it('renders the mobile WhatsApp FAB in the DOM with the desarrollo href', () => {
    const { container } = renderWithProviders(<Desarrollo />);
    const fab = container.querySelector('a[aria-label="Consultar por WhatsApp"]');
    expect(fab).not.toBeNull();
    expect(fab).toHaveAttribute('href', buildWhatsAppUrl('desarrollo'));
  });

  it('closes with the final CTA and a discreet client-portal link', () => {
    const { container } = renderWithProviders(<Desarrollo />);
    expect(screen.getByText('¿Tenés algo en mente?')).toBeInTheDocument();
    const portal = container.querySelector('a[href="https://portal.artifex.click"]');
    expect(portal).not.toBeNull();
    expect(within(portal as HTMLElement).getByText(/Acceso clientes/)).toBeInTheDocument();
  });
});
