import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeretTape } from './FeretTape';

describe('FeretTape', () => {
  const LINE = { ax: 10, ay: 50, bx: 90, by: 50 };

  it('dibuja la línea entre los extremos dados', () => {
    const { container } = render(<FeretTape line={LINE} width={100} height={100} cm={80} />);

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

  it('marca los dos extremos', () => {
    const { container } = render(<FeretTape line={LINE} width={100} height={100} cm={80} />);
    expect(container.querySelectorAll('circle')).toHaveLength(2);
  });
});
