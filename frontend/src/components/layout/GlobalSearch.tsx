import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useStore } from '../../data/store';
import { KIND_LABEL, buildIndex, search, type SearchEntry } from '../../lib/searchIndex';

export function GlobalSearch() {
  const { state, dispatch, ensureScenario } = useStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ready = state.phase === 'ready';

  // debounce 200 ms
  useEffect(() => {
    const t = setTimeout(() => setQ(raw), 200);
    return () => clearTimeout(t);
  }, [raw]);

  // "/" focuses the search box unless the user is typing somewhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const index = useMemo(
    () => (state.core ? buildIndex(state.core, Object.values(state.scenarios)) : []),
    [state.core, state.scenarios],
  );
  const results = useMemo(() => search(index, q), [index, q]);
  useEffect(() => setActive(0), [q]);

  function loadAllScenarios() {
    state.core?.scenarios.forEach((s) => { if (!state.scenarios[s.id]) ensureScenario(s.id).catch(() => {}); });
  }

  function go(e: SearchEntry) {
    setOpen(false);
    setRaw(''); setQ('');
    if (e.txnId) dispatch({ type: 'SELECT', selection: { kind: 'txn', id: e.txnId } });
    navigate(e.to);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0))); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]); }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  }

  let lastKind = '';
  return (
    <div className="relative w-full max-w-md">
      <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open && q.trim() !== ''}
        aria-controls="global-search-results"
        aria-label="Global search"
        disabled={!ready}
        value={raw}
        placeholder="Search for accounts, transactions, employees, customers…   ( / )"
        className="h-8 w-full rounded-md border border-line bg-surface pl-7 pr-2.5 text-xs transition-[border-color,box-shadow] duration-200 placeholder:text-muted/80 focus:border-primary focus:shadow-[0_0_0_3px_rgb(37_99_235/0.12)] focus:outline-none disabled:opacity-60"
        onFocus={() => { setOpen(true); loadAllScenarios(); }}
        onChange={(e) => { setRaw(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
      />
      {open && q.trim() ? (
        <ul id="global-search-results" role="listbox" className="absolute left-0 right-0 top-full z-40 mt-1 max-h-96 origin-top animate-scale-in overflow-auto rounded-md border border-line bg-surface py-1 text-xs shadow-lg">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-muted">No matches for “{q}”</li>
          ) : results.map((r, i) => {
            const header = r.kind !== lastKind ? KIND_LABEL[r.kind] : null;
            lastKind = r.kind;
            return (
              <li key={`${r.kind}-${r.id}`} role="presentation">
                {header ? <p className="px-3 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">{header}</p> : null}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  className={`flex w-full flex-col px-3 py-1.5 text-left transition-colors duration-100 ${i === active ? 'bg-primary-soft' : 'hover:bg-page'}`}
                  onMouseDown={(e) => { e.preventDefault(); go(r); }}
                  onMouseEnter={() => setActive(i)}
                >
                  <span className="font-medium text-ink">{r.id.includes(':') ? r.label : `${r.id} · ${r.label}`}</span>
                  <span className="text-muted">{r.sub}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
