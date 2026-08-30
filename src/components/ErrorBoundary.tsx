import { Component, ErrorInfo, ReactNode } from 'react';
import { Radio, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PlayIt Error Boundary Caught Error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface-900 text-slate-200 p-6 font-sans">
          <div className="max-w-md w-full bg-surface-850 border border-surface-700 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center text-accent-500 mx-auto mb-5 shadow-sm">
              <Radio className="w-7 h-7" />
            </div>

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-accent-500/10 border border-accent-500/30 text-accent-400 font-mono text-[11px] font-bold uppercase tracking-wider mb-3">
              Application Notice
            </span>

            <h1 className="font-sans font-bold text-xl text-white">
              Signal Interrupted
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
              PlayIt encountered an unexpected runtime issue. Reloading the page will restore normal directory playback.
            </p>

            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-400 text-surface-950 font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload PlayIt</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
