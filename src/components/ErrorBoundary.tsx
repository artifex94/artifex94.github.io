import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 font-mono">
          <div className="relative border border-dashed border-accent/50 p-8 max-w-md w-full bg-surface/80 backdrop-blur-sm">
            <span className="absolute -top-px -left-px  text-accent text-xs leading-none" aria-hidden="true">+</span>
            <span className="absolute -top-px -right-px text-accent text-xs leading-none" aria-hidden="true">+</span>
            <span className="absolute -bottom-px -left-px  text-accent text-xs leading-none" aria-hidden="true">+</span>
            <span className="absolute -bottom-px -right-px text-accent text-xs leading-none" aria-hidden="true">+</span>
            <div
              className="absolute -top-3 right-4 bg-surface px-2 text-[9px] text-secondary border border-dashed border-line tracking-wider"
              aria-hidden="true"
            >
              [error]
            </div>
            <p className="text-[9px] text-secondary/50 uppercase tracking-widest mb-2">// ERROR_BOUNDARY</p>
            <p className="text-primary font-bold mb-1">Algo salió mal</p>
            <p className="text-secondary text-xs mb-6 break-words">
              {this.state.error?.message ?? 'Error inesperado'}
            </p>
            <button
              className="text-xs border border-dashed border-accent/50 px-4 py-2 text-accent hover:bg-accent hover:text-black transition-colors"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
