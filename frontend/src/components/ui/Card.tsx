import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-lg border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)] ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action, className = '' }: { title: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-4 pt-3.5 pb-2 ${className}`}>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {action}
    </div>
  );
}

export interface KpiCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone?: 'blue' | 'red' | 'orange' | 'green';
  delta?: { pct: number; label: string } | null;
}

const TONE = {
  blue: 'bg-blue-50 text-primary',
  red: 'bg-red-50 text-risk-high',
  orange: 'bg-orange-50 text-risk-medium',
  green: 'bg-green-50 text-risk-explained',
};

export function KpiCard({ label, value, icon, tone = 'blue', delta }: KpiCardProps) {
  return (
    <Card className="flex items-center gap-3 p-4" data-testid={`kpi-${label}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${TONE[tone]}`} aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-2xl font-semibold leading-tight text-ink">{value}</p>
        {delta ? (
          <p className={`text-[11px] ${delta.pct >= 0 ? 'text-risk-explained' : 'text-risk-high'}`}>
            {delta.pct >= 0 ? '↑' : '↓'} {Math.abs(delta.pct)}% {delta.label}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
