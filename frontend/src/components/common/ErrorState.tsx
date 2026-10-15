import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'काहीतरी त्रुटी आली',
  message,
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-2xl border border-rose-100 my-4">
      <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-rose-900 mb-1">{title}</h3>
      <p className="text-sm text-rose-700 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
          पुन्हा प्रयत्न करा (Retry)
        </Button>
      )}
    </div>
  );
};
