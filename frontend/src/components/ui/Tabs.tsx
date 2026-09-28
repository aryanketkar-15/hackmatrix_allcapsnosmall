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
          ? `-mb-px border-b-2 px-0.5 pb-2.5 pt-1 text-sm ${active ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted hover:text-ink'}`
          : `rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-primary text-white' : 'bg-surface text-muted border border-line hover:text-ink'}`;
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
            {t.label}
            {t.count !== undefined ? <span className="ml-1 opacity-80">({t.count})</span> : null}
          </button>
        );
      })}
    </div>
  );
}
