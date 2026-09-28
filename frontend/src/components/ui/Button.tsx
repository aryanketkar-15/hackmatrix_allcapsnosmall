import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-primary/50',
  secondary: 'bg-surface text-ink border border-line hover:bg-page disabled:text-muted/60',
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
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed ${pad} ${VARIANT[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
