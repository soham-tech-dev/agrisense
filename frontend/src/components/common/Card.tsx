import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'flat' | 'forest' | 'subtle';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  badge,
  headerAction,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  onClick,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles = {
    default: 'bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all duration-200',
    elevated: 'bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-200',
    flat: 'bg-surface-subtle rounded-2xl border border-slate-200/60',
    forest: 'bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 text-white rounded-3xl border border-forest-700/60 shadow-elevated',
    subtle: 'bg-emerald-50/50 rounded-2xl border border-emerald-100/80',
  };

  return (
    <div
      onClick={onClick}
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${
        hoverable ? 'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200' : ''
      } ${
        onClick ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''
      } ${className}`}
    >
      {(title || subtitle || headerAction || badge) && (
        <div className="flex items-start sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-100/90 gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              {title && (
                <h3 className={`text-base sm:text-lg font-bold tracking-tight ${
                  variant === 'forest' ? 'text-white' : 'text-slate-900'
                }`}>
                  {title}
                </h3>
              )}
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <p className={`text-xs ${
                variant === 'forest' ? 'text-forest-200' : 'text-slate-500'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
