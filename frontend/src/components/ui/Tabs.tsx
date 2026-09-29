import { useRef, type KeyboardEvent } from 'react';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
  title?: string;
  count?: number;
}

/** Controlled, keyboard-accessible tab bar. Pages sync `value` with the URL. */
export function Tabs({
  items, value, onChange, label = 'Tabs', variant = 'underline',
}: { items: TabItem[]; value: string; onChange: (id: string) => void; label?: string; variant?: 'underline' | 'pill' }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const enabled = items.filter((i) => !i.disabled);

  function onKey(e: KeyboardEvent<HTMLButtonElement>, id: string) {
    const idx = enabled.findIndex((i) => i.id === id);
    let next = -1;
    if (e.key === 'ArrowRight') next = (idx + 1) % enabled.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + enabled.length) % enabled.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = enabled.length - 1;
    if (next >= 0) {
      e.preventDefault();
      const target = enabled[next];
      refs.current[target.id]?.focus();
      onChange(target.id);
    }
  }

  return (
    <div role="tablist" aria-label={label} className={variant === 'underline' ? 'flex gap-5 border-b border-line' : 'flex flex-wrap gap-1.5'}>
      {items.map((t) => {
        const active = t.id === value;
        const base = variant === 'underline'
          ? `relative -mb-px px-0.5 pb-2.5 pt-1 text-sm transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:rounded-full after:bg-primary after:transition-transform after:duration-300 after:ease-out ${active ? 'font-semibold text-primary after:scale-x-100' : 'text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-50 hover:after:bg-slate-300'}`
          : `rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 active:scale-95 ${active ? 'bg-primary text-white shadow-sm' : 'border border-line bg-surface text-muted hover:border-slate-300 hover:text-ink'}`;
        return (
          <button
            key={t.id}
            ref={(el) => { refs.current[t.id] = el; }}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={active}
            aria-disabled={t.disabled || undefined}
            disabled={t.disabled}
            tabIndex={active ? 0 : -1}
            title={t.title}
            className={`${base} disabled:cursor-not-allowed disabled:opacity-50`}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, t.id)}
          >
            {t.count !== undefined ? `${t.label} (${t.count})` : t.label}
          </button>
        );
      })}
    </div>
  );
}
