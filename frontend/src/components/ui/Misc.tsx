import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-4 py-10 text-center" role="status">
      <span className="text-muted" aria-hidden>{icon ?? <Inbox size={28} />}</span>
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint ? <p className="max-w-md text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/** CSS-only tooltip (also exposed to assistive tech through aria-label on the trigger). */
export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex" tabIndex={0} aria-label={text}>
      {children}
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 hidden w-max max-w-64 -translate-x-1/2 rounded bg-ink px-2 py-1 text-[11px] font-normal normal-case tracking-normal text-white shadow group-hover:block group-focus:block">
        {text}
      </span>
    </span>
  );
}

const AVATAR_TONES = ['#2563eb', '#7c3aed', '#0d9488', '#c2410c', '#be185d', '#4338ca', '#15803d'];

export function Avatar({ initials, size = 32, seed }: { initials: string; size?: number; seed?: string }) {
  const key = seed ?? initials;
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, backgroundColor: AVATAR_TONES[h % AVATAR_TONES.length] }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function Logo({ size = 'md', light = false }: { size?: 'sm' | 'md' | 'lg'; light?: boolean }) {
  const px = { sm: 18, md: 22, lg: 44 }[size];
  const color = light ? '#ffffff' : '#0f2a5c';
  return (
    <span className="inline-flex select-none items-center font-extrabold tracking-tight" style={{ fontSize: px, color }} aria-label="KHOJI">
      KH
      <svg width={px * 1.05} height={px * 1.05} viewBox="0 0 32 32" aria-hidden className="mx-[1px]">
        <circle cx="14" cy="14" r="9" fill="none" stroke="#2563eb" strokeWidth="3.4" />
        <circle cx="14" cy="14" r="3" fill="#dc2626" />
        <path d="M21 21l7 7" stroke="#2563eb" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
      JI
    </span>
  );
}

export function PrototypeBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-900 ${className}`}
      data-testid="prototype-badge"
    >
      Prototype · scripted scenario data
    </span>
  );
}
