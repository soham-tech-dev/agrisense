import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    info: 'bg-sky-50 border-sky-200 text-sky-900',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg max-w-md w-full animate-slide-down ${bgStyles[type]}`}>
      {icons[type]}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={() => onClose(id)} className="p-1 hover:opacity-75">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
