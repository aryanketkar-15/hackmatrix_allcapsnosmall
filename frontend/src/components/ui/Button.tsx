import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-sm hover:bg-primary-dark hover:shadow-md disabled:bg-primary/50 disabled:shadow-none',
  secondary: 'bg-surface text-ink border border-line shadow-[0_1px_1px_rgb(16_24_40/0.04)] hover:border-slate-300 hover:bg-page disabled:text-muted/60',
  ghost: 'bg-transparent text-primary hover:bg-primary-soft disabled:text-muted/60',
  danger: 'bg-risk-high text-white hover:bg-red-700 disabled:bg-risk-high/50',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', icon, className = '', children, type = 'button', ...rest }: ButtonProps) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm';
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-150 ease-out active:scale-[0.97] active:shadow-none disabled:cursor-not-allowed disabled:active:scale-100 ${pad} ${VARIANT[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
