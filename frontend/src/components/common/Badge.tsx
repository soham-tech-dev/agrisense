import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'forest'
  | 'kvk';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-bold gap-1',
    md: 'text-xs px-2.5 py-1 font-bold gap-1.5',
  };

  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200/80',
    info: 'bg-sky-50 text-sky-800 border border-sky-200/80',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    forest: 'bg-forest-900 text-forest-100 border border-forest-700',
    kvk: 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold uppercase tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full shrink-0 leading-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="inline-flex items-center shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
