import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useReady, useStore } from '../data/store';
import { Card, DateRangeInput, EmptyState, Pagination, SearchInput, Table, Td, Th, Tr, clampPage } from '../components/ui';
import { dateKeyIST, formatDateTimeIST, formatInr } from '../lib/format';

const PAGE = 10;
const KIND: Record<string, string> = { FD_CLOSURE: 'FD closure', TRANSFER: 'Transfer', PAYROLL: 'Payout', SWEEP: 'Sweep', DEPOSIT: 'Deposit' };

export default function Transactions() {
  const { core } = useReady();
  const { state, ensureScenario } = useStore();
  const [params, setParams] = useSearchParams();

  useEffect(() => { core.scenarios.forEach((s) => { if (!state.scenarios[s.id]) ensureScenario(s.id).catch(() => {}); }); }, [core.scenarios, state.scenarios, ensureScenario]);

  const q = (params.get('q') ?? '').trim().toLowerCase();
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';

  const all = useMemo(
    () => Object.values(state.scenarios)
      .flatMap((s) => s.transactions.map((t) => ({ ...t, scenarioId: s.id, alertId: s.alertId, title: s.title })))
      .sort((a, b) => b.at.localeCompare(a.at) || a.scenarioId.localeCompare(b.scenarioId) || a.id.localeCompare(b.id)),
    [state.scenarios],
  );
  const filtered = all.filter((t) => {
    if (q && !(t.from.toLowerCase().includes(q) || t.to.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))) return false;
    const day = dateKeyIST(t.at);
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const page = clampPage(params.get('page'), pages);
  const rows = filtered.slice((page - 1) * PAGE, page * PAGE);
  const set = (patch: Record<string, string>) => { const n = new URLSearchParams(params); for (const [k, v] of Object.entries(patch)) { if (v) n.set(k, v); else n.delete(k); } n.delete('page'); setParams(n, { replace: true }); };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Transactions</h1>
      <p className="text-xs text-muted">Scripted scenario transactions only (the prototype does not carry a full ledger).</p>
      <Card>
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <SearchInput className="w-64" placeholder="Filter by account or transaction…" aria-label="Filter by account" value={params.get('q') ?? ''} onChange={(e) => set({ q: e.target.value })} />
          <DateRangeInput from={from} to={to} onChange={(f, t) => set({ from: f, to: t })} />
        </div>
        {rows.length === 0 ? <EmptyState title="No transactions match" /> : (
          <Table label="Transactions">
            <thead><tr><Th>Time</Th><Th>ID</Th><Th>From → To</Th><Th>Amount</Th><Th>Type</Th><Th>Outcome</Th><Th>Alert</Th></tr></thead>
            <tbody>
              {rows.map((t) => (
                <Tr key={`${t.scenarioId}-${t.id}`}>
                  <Td className="whitespace-nowrap">{formatDateTimeIST(t.at)}</Td><Td className="font-medium">{t.id}</Td>
                  <Td className="whitespace-nowrap">{t.from} → {t.to}</Td><Td className="whitespace-nowrap">{formatInr(t.amount)}</Td>
                  <Td>{KIND[t.kind] ?? t.kind}</Td><Td>{t.outcome === 'BLOCKED' ? 'Blocked' : 'Executed'}</Td>
                  <Td>{t.alertId ? <Link className="text-primary hover:underline" to={`/alerts/${t.alertId}/graph`}>{t.alertId}</Link> : <span className="text-muted">{t.title}</span>}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
        <div className="flex items-center justify-between px-4 py-3 text-xs text-muted">
          <span data-testid="txn-showing">{filtered.length === 0 ? 'No transactions' : `Showing ${(page - 1) * PAGE + 1}–${(page - 1) * PAGE + rows.length} of ${filtered.length} transactions`}</span>
          <Pagination page={page} pageCount={pages} onChange={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n, { replace: true }); }} />
        </div>
      </Card>
    </div>
  );
}
