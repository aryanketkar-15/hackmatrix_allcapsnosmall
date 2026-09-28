import { useEffect, useMemo, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { dateKeyIST, formatDateIST, formatTimeIST } from '../../lib/format';
import type { TimelineEntryT } from '../../types/contract';

type Cat = TimelineEntryT['category'];
import type { Selection } from '../../data/store';

export const CATEGORY_LABEL: Record<Cat, string> = {
  EMPLOYEE_ACTIVITY: 'Employee Activity',
  ACCOUNT_STATE_CHANGE: 'Account State Change',
  CONTROL_CHECK: 'Control Check',
  TRANSACTION: 'Transaction',
};

/** Dot + tag colours per category. Text is always shown, colour is never the only cue. */
export const CATEGORY_STYLE: Record<Cat, { dot: string; fg: string; bg: string }> = {
  EMPLOYEE_ACTIVITY: { dot: '#2563eb', fg: '#1d4ed8', bg: '#dbeafe' },
  ACCOUNT_STATE_CHANGE: { dot: '#16a34a', fg: '#166534', bg: '#dcfce7' },
  CONTROL_CHECK: { dot: '#7c3aed', fg: '#5b21b6', bg: '#ede9fe' },
  TRANSACTION: { dot: '#dc2626', fg: '#b91c1c', bg: '#fee2e2' },
};

export function groupByDay(entries: TimelineEntryT[]): { key: string; label: string; items: TimelineEntryT[] }[] {
  const groups = new Map<string, TimelineEntryT[]>();
  for (const e of [...entries].sort((a, b) => a.at.localeCompare(b.at))) {
    const k = dateKeyIST(e.at);
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  return [...groups.entries()].map(([key, items]) => ({ key, label: formatDateIST(items[0].at), items }));
}

interface Props {
  entries: TimelineEntryT[];
  selection: Selection | null;
  onSelect: (s: Selection | null) => void;
  /** event ids that the but-for replay says would not execute */
  overlay?: string[];
}

export function Timeline({ entries, selection, onSelect, overlay = [] }: Props) {
  const groups = useMemo(() => groupByDay(entries), [entries]);
  const selectedRef = useRef<HTMLLIElement | null>(null);

  const isSelected = (e: TimelineEntryT) =>
    !!selection && ((selection.kind === 'event' && selection.id === e.id) || (selection.kind === 'txn' && e.txnId === selection.id));

  useEffect(() => { selectedRef.current?.scrollIntoView?.({ block: 'nearest' }); }, [selection]);

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <section key={g.key} aria-label={g.label}>
          <h3 className="mb-2 text-sm font-semibold">{g.label}</h3>
          <ol className="relative space-y-0.5 border-l border-line pl-0">
            {g.items.map((e) => {
              const sel = isSelected(e);
              const muted = overlay.includes(e.id);
              const style = CATEGORY_STYLE[e.category];
              return (
                <li
                  key={e.id}
                  ref={sel ? selectedRef : undefined}
                  data-testid={`tl-${e.id}`}
                  aria-current={sel ? 'true' : undefined}
                  className={`relative grid cursor-pointer grid-cols-[3.2rem_1fr_auto] items-start gap-3 rounded-md py-2 pl-5 pr-3 ${sel ? 'bg-primary-soft ring-1 ring-primary' : 'hover:bg-page'} ${muted ? 'opacity-50' : ''} ${e.gap ? 'border border-dashed border-amber-400 bg-amber-50/60' : ''}`}
                  onClick={() => onSelect(e.txnId ? { kind: 'txn', id: e.txnId } : { kind: 'event', id: e.id })}
                >
                  <span className="absolute -left-[5px] top-3.5 h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: e.gap ? '#d97706' : style.dot }} aria-hidden />
                  <time className="pt-0.5 text-xs tabular-nums text-muted" dateTime={e.at}>{formatTimeIST(e.at)}</time>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${muted ? 'line-through decoration-slate-400' : ''}`}>
                      {e.gap ? <AlertCircle size={13} className="mr-1 inline text-amber-600" aria-hidden /> : null}
                      {e.title}
                    </p>
                    <p className="text-xs text-muted">{e.detail}</p>
                    <div className="mt-0.5 flex flex-wrap gap-2 text-[11px]">
                      {e.uncertaintySec ? <span className="rounded bg-page px-1.5 py-0.5 text-muted" title="Clock-skew uncertainty of this record">±{e.uncertaintySec >= 60 ? `${Math.round(e.uncertaintySec / 60)} min` : `${e.uncertaintySec} s`}</span> : null}
                      {muted ? <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">not executed in replay</span> : null}
                      {e.gap ? <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-900">Missing evidence</span> : null}
                    </div>
                  </div>
                  <span className="whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-medium" style={{ color: style.fg, backgroundColor: style.bg }}>{CATEGORY_LABEL[e.category]}</span>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
