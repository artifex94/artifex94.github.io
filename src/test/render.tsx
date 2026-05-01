import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

interface CustomRenderOptions extends RenderOptions {
  routerProps?: MemoryRouterProps;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { routerProps, ...options }: CustomRenderOptions = {},
) {
  return render(
    <HelmetProvider>
      <MemoryRouter {...routerProps}>{ui}</MemoryRouter>
    </HelmetProvider>,
    options,
  );
}
