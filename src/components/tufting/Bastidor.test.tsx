import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/render';
import { Bastidor } from './Bastidor';
import type { UploadState } from '../../hooks/useCalculatorState';
import type { PipelineOutput } from '../../hooks/useTuftingPipeline';

const UPLOAD: UploadState = {
  fileName: 'oso.png',
  objectUrl: 'blob:fake',
  info: { format: 'png', width: 1000, height: 800, hasAlphaChannel: true },
  contourable: true,
};

const RESULT: PipelineOutput = {
  areaM2: 0.91,
  areaWithoutBorderM2: 0.8,
  finalFeretCm: 86,
  warnings: [],
  usedPaletteIndices: [0, 2],
  preview: { rgba: new Uint8ClampedArray(4 * 100), width: 10, height: 10 },
  feretLine: { ax: 1, ay: 5, bx: 9, by: 5 },
};

describe('Bastidor', () => {
  it('vacío: invita a subir el diseño', () => {
    renderWithProviders(
      <Bastidor
        upload={null}
        shape={null}
        dimensions={{}}
        areaM2={null}
        pipelineStatus="idle"
        pipelineResult={null}
      />,
    );

    expect(screen.getByText(/bastidor está vacío/i)).toBeInTheDocument();
  });

  it('con diseño: la imagen queda prendida y visible', () => {
    renderWithProviders(
      <Bastidor
        upload={UPLOAD}
        shape={null}
        dimensions={{}}
        areaM2={null}
        pipelineStatus="idle"
        pipelineResult={null}
      />,
    );

    expect(screen.getByAltText(/tu diseño: oso\.png/i)).toBeInTheDocument();
    expect(screen.getByText(/elegí la forma/i)).toBeInTheDocument();
  });

  it('medida: muestra la cinta métrica con los cm declarados', () => {
    renderWithProviders(
      <Bastidor
        upload={UPLOAD}
        shape="contorneada"
        dimensions={{ feretCm: 80 }}
        areaM2={0.91}
        pipelineStatus="done"
        pipelineResult={RESULT}
      />,
    );

    // La cinta es la referencia visual de QUÉ se está declarando.
    expect(
      screen.getByRole('img', { name: /la distancia más larga.*80 cm/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/86 cm/)).toBeInTheDocument();
  });

  it('la ficha del pie informa el área en vivo', () => {
    renderWithProviders(
      <Bastidor
        upload={UPLOAD}
        shape="circular"
        dimensions={{ diameterCm: 80 }}
        areaM2={0.5}
        pipelineStatus="idle"
        pipelineResult={null}
      />,
    );

    expect(screen.getByText(/0\.50 m²/)).toBeInTheDocument();
    expect(screen.getByText(/80 cm de diámetro/i)).toBeInTheDocument();
  });

  it('propaga las advertencias de la medición', () => {
    renderWithProviders(
      <Bastidor
        upload={UPLOAD}
        shape="contorneada"
        dimensions={{ feretCm: 80 }}
        areaM2={0.91}
        pipelineStatus="done"
        pipelineResult={{ ...RESULT, warnings: ['Tu diseño llega hasta el filo de la imagen.'] }}
      />,
    );

    expect(screen.getByText(/llega hasta el filo/i)).toBeInTheDocument();
  });
});
