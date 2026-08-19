import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Component Tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#02131d] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="aura-glass-card border border-[#0d5969] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400 shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h2 className="text-lg font-bold text-white luminous-text">
              Une interruption temporaire est survenue
            </h2>
            
            <p className="text-xs text-cyan-200/80 leading-relaxed">
              Vos données et votre solde sont en sécurité. Cliquez ci-dessous pour recharger l'interface.
            </p>

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/25 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser l'application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
