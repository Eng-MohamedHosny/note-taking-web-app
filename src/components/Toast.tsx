import React from 'react';
import { useNotes } from '../context/NotesContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotes();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:right-6 lg:translate-x-0 z-50 flex flex-col items-center lg:items-end gap-2.5 pointer-events-none w-[calc(100%-2rem)] max-w-sm sm:max-w-md transition-all duration-200">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white/95 dark:bg-[#161B26]/95 backdrop-blur-md border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white animate-in slide-in-from-bottom-3 fade-in duration-200 w-full"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            {toast.type === 'info' && (
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
            )}
            <span className="text-sm font-medium truncate">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-md transition-colors shrink-0"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
