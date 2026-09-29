import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { stagger, useCountUp } from '../../lib/motion';

export function Card({ className = '', children, hoverable = false, ...rest }: HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }) {
  return (
    <div className={`rounded-lg border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)] transition-[box-shadow,transform,border-color] duration-200 ${hoverable ? 'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_6px_16px_rgb(16_24_40/0.08)]' : ''} ${className}`} {...rest}>
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
  /** position in a row of cards: staggers the entrance */
  index?: number;
}

const TONE = {
  blue: 'bg-blue-50 text-primary',
  red: 'bg-red-50 text-risk-high',
  orange: 'bg-orange-50 text-risk-medium',
  green: 'bg-green-50 text-risk-explained',
};

export function KpiCard({ label, value, icon, tone = 'blue', delta, index = 0 }: KpiCardProps) {
  const counted = useCountUp(typeof value === 'number' ? value : 0);
  const shown = typeof value === 'number' ? counted : value;
  const style: CSSProperties = stagger(index, 70);
  return (
    <Card hoverable className="group flex animate-fade-up items-center gap-3 p-4" style={style} data-testid={`kpi-${label}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 ${TONE[tone]}`} aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-2xl font-semibold leading-tight tabular-nums text-ink">{shown}</p>
        {delta ? (
          <p className={`text-[11px] ${delta.pct >= 0 ? 'text-risk-explained' : 'text-risk-high'}`}>
            {delta.pct >= 0 ? '↑' : '↓'} {Math.abs(delta.pct)}% {delta.label}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
