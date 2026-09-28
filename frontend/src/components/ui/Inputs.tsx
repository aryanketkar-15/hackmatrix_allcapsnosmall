import { Search } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

const FIELD = 'h-8 rounded-md border border-line bg-surface px-2.5 text-xs text-ink placeholder:text-muted/80';

export function SearchInput({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
      <input type="search" className={`${FIELD} w-full pl-7`} {...rest} />
    </div>
  );
}

export function Select({ label, children, className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <select aria-label={label} className={`${FIELD} pr-6 ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function DateRangeInput({
  from, to, onChange,
}: { from: string; to: string; onChange: (from: string, to: string) => void }) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Date range">
      <input type="date" aria-label="From date" className={FIELD} value={from} onChange={(e) => onChange(e.target.value, to)} />
      <span className="text-muted">–</span>
      <input type="date" aria-label="To date" className={FIELD} value={to} onChange={(e) => onChange(from, e.target.value)} />
    </div>
  );
}

export function TextInput({ label, error, className = '', id, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const fid = id ?? `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div className={className}>
      <label htmlFor={fid} className="mb-1 block text-xs font-medium text-ink">{label}</label>
      <input id={fid} aria-invalid={error ? true : undefined} aria-describedby={error ? `${fid}-err` : undefined} className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm" {...rest} />
      {error ? <p id={`${fid}-err`} role="alert" className="mt-1 text-xs text-risk-high">{error}</p> : null}
    </div>
  );
}
