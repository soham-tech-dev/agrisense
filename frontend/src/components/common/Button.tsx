import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'forest';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  iconPosition = 'left',
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const actualLeftIcon = leftIcon || (iconPosition === 'left' ? icon : undefined);
  const actualRightIcon = rightIcon || (iconPosition === 'right' ? icon : undefined);
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2';

  const sizeStyles = {
    xs: 'px-2.5 py-1.5 text-xs min-h-[32px] gap-1.5',
    sm: 'px-3.5 py-2 text-xs min-h-[40px] gap-2',
    md: 'px-4.5 py-2.5 text-sm min-h-[46px] gap-2',
    lg: 'px-6 py-3.5 text-base min-h-[52px] gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs hover:shadow-sm border border-emerald-800/40',
    forest: 'bg-forest-900 hover:bg-forest-950 text-white shadow-xs border border-forest-800',
    secondary: 'bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200/80',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 bg-white shadow-2xs',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs border border-rose-700/50',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : actualLeftIcon ? (
        <span className="inline-flex items-center shrink-0">{actualLeftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && actualRightIcon ? (
        <span className="inline-flex items-center shrink-0">{actualRightIcon}</span>
      ) : null}
    </button>
  );
};
