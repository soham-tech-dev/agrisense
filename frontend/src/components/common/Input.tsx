import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full px-4 py-3 min-h-[48px] rounded-xl border bg-white text-slate-800 placeholder-slate-400 font-medium text-base transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
          error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-emerald-500'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-sm font-medium text-rose-500 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
