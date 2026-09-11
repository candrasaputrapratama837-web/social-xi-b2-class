import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const bgColors = {
    success: 'bg-emerald-600 text-white dark:bg-emerald-700',
    error: 'bg-rose-600 text-white dark:bg-rose-700',
    info: 'bg-emerald-800 text-white dark:bg-emerald-900',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-200 shrink-0" />,
    info: <Info className="w-5 h-5 text-emerald-300 shrink-0" />,
  };

  return (
    <div
      id={`toast-${toast.id}`}
      className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg transition-all transform translate-y-0 ${bgColors[toast.type]}`}
    >
      <div className="flex items-center gap-2.5 pr-2">
        {icons[toast.type]}
        <span className="text-sm font-medium">{toast.text}</span>
      </div>
      <button
        id={`btn-close-toast-${toast.id}`}
        onClick={() => onDismiss(toast.id)}
        className="p-1 hover:bg-black/20 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 opacity-80 hover:opacity-100" />
      </button>
    </div>
  );
};
