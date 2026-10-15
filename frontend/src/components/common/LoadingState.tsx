import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'लोड होत आहे...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-base font-semibold text-emerald-800">{message}</p>
    </div>
  );
};
