import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full mb-4">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`w-full px-4 py-3 min-h-[48px] rounded-xl border bg-white text-slate-800 font-medium text-base transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
          error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-emerald-500'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm font-medium text-rose-500 mt-1">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
