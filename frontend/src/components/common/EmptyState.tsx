import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 my-4">
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
};
