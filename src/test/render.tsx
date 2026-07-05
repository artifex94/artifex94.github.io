import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

interface CustomRenderOptions extends RenderOptions {
  routerProps?: MemoryRouterProps;
}

// El SEO se maneja con usePageMeta (muta el <head> real), así que no hay
// provider extra: solo el router en memoria.
export function renderWithProviders(
  ui: React.ReactElement,
  { routerProps, ...options }: CustomRenderOptions = {},
) {
  return render(<MemoryRouter {...routerProps}>{ui}</MemoryRouter>, options);
}
