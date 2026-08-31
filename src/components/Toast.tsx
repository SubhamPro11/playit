import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none max-w-[90vw] sm:max-w-md w-full px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 w-full sm:w-auto ${
              t.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : t.type === 'info'
                ? 'bg-sky-950/90 border-sky-500/50 text-sky-200'
                : 'bg-surface-900/95 border-accent-500/40 text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {t.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : t.type === 'info' ? (
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-medium tracking-wide truncate">
                {t.message}
              </span>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
