import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Ocorreu um erro inesperado</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-2">{this.state.error.message}</p>
          <button className="mt-4 px-4 py-2 bg-primary-500 dark:bg-primary-500-dark text-white rounded hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors" onClick={() => window.location.reload()}>
            Recarregar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
} 