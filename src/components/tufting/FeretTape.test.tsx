import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeretTape } from './FeretTape';

describe('FeretTape', () => {
  const LINE = { ax: 10, ay: 50, bx: 90, by: 50 };

  it('dibuja la línea entre los extremos dados', () => {
    const { container } = render(<FeretTape line={LINE} width={100} height={100} cm={80} />);

    // La primera línea es la cota principal; las otras dos son los topes.
    const line = container.querySelector('line');
    expect(line).not.toBeNull();
    expect(line?.getAttribute('x1')).toBe('10');
    expect(line?.getAttribute('x2')).toBe('90');
  });

  it('etiqueta la medida en centímetros', () => {
    render(<FeretTape line={LINE} width={100} height={100} cm={80} />);
    expect(screen.getByText('80 cm')).toBeInTheDocument();
  });

  it('es legible para lectores de pantalla', () => {
    render(<FeretTape line={LINE} width={100} height={100} cm={80} />);
    expect(
      screen.getByRole('img', { name: /distancia más larga.*80 cm/i }),
    ).toBeInTheDocument();
  });

  it('usa el viewBox del preview para escalar con la imagen', () => {
    const { container } = render(<FeretTape line={LINE} width={640} height={480} cm={120} />);
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 640 480');
  });

  it('marca los dos extremos con topes perpendiculares', () => {
    // Los topes son lo que distingue una cota de medición de una línea suelta:
    // la cota principal más un tope en cada punta = tres líneas en total.
    const { container } = render(<FeretTape line={LINE} width={100} height={100} cm={80} />);
    expect(container.querySelectorAll('line')).toHaveLength(3);
  });

  it('la etiqueta va sobre un chip que la despega de la imagen', () => {
    const { container } = render(<FeretTape line={LINE} width={100} height={100} cm={80} />);
    expect(container.querySelector('rect')).not.toBeNull();
  });
});
