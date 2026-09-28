import { useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../data/store';
import { LevelChip } from '../ui';
import { formatRelativeToAsOf } from '../../lib/format';

/** Bell: the 5 most recent HIGH alerts. Unread state lives in memory only (prototype). */
export function NotificationBell() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<Set<string>>(new Set());

  const items = useMemo(
    () => [...state.alerts].filter((a) => a.level === 'HIGH').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [state.alerts],
  );
  const unread = items.filter((a) => !read.has(a.id)).length;
  const asOf = state.core?.meta.asOf ?? new Date().toISOString();

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) setRead(new Set(items.map((a) => a.id))); // mark read on open
  }

  return (
    <div className="relative">
      <button type="button" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-haspopup="menu" aria-expanded={open}
        onClick={toggle} className="relative rounded-full p-1.5 text-muted hover:bg-page">
        <Bell size={17} />
        {unread > 0 ? (
          <span data-testid="bell-unread" className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-risk-high px-1 text-[10px] font-semibold text-white">{unread}</span>
        ) : null}
      </button>
      {open ? (
        <div role="menu" aria-label="Recent high-risk alerts" className="absolute right-0 z-40 mt-1 w-80 rounded-md border border-line bg-surface py-1 shadow-lg">
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Recent high-risk alerts</p>
          {items.length === 0 ? <p className="px-3 py-3 text-xs text-muted">No high-risk alerts.</p> : items.map((a) => (
            <button key={a.id} role="menuitem" type="button" className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-page"
              onClick={() => { setOpen(false); navigate(`/alerts/${a.id}/overview`); }}>
              <span className="flex items-center gap-2"><LevelChip level={a.level} /><span className="text-[11px] text-muted">{a.id}</span></span>
              <span className="text-xs font-medium text-ink">{a.title}</span>
              <span className="text-[11px] text-muted">{formatRelativeToAsOf(a.createdAt, asOf)}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
