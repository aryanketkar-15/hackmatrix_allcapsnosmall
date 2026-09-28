import type { CoreFileT, ScenarioT } from '../types/contract';
import { formatInr } from './format';

export type SearchKind = 'alert' | 'customer' | 'employee' | 'account' | 'transaction';

export interface SearchEntry {
  kind: SearchKind;
  id: string;
  label: string;
  sub: string;
  to: string;
  /** scenario transaction to highlight after navigation */
  txnId?: string;
}

export const KIND_LABEL: Record<SearchKind, string> = {
  alert: 'Alerts', customer: 'Customers', employee: 'Employees', account: 'Accounts', transaction: 'Transactions',
};
const KIND_ORDER: SearchKind[] = ['alert', 'account', 'transaction', 'customer', 'employee'];

export function buildIndex(core: CoreFileT, scenarios: ScenarioT[]): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const a of core.alerts) out.push({ kind: 'alert', id: a.id, label: a.title, sub: a.type, to: `/alerts/${a.id}/overview` });
  for (const c of core.customers) out.push({ kind: 'customer', id: c.id, label: c.name, sub: `${c.type} · ${c.location}`, to: `/customers/${c.id}/overview` });
  for (const e of core.employees) out.push({ kind: 'employee', id: e.id, label: e.name, sub: `${e.role} · ${e.branch}`, to: `/employees/${e.id}` });
  const ownerOf = new Map(core.customers.flatMap((c) => c.accountIds.map((a) => [a, c.id] as const)));
  for (const a of core.accounts) {
    const owner = ownerOf.get(a.id);
    out.push({
      kind: 'account', id: a.id, label: a.id, sub: owner ? `Customer ${owner}` : 'External account',
      to: owner ? `/customers/${owner}/accounts` : '/transactions',
    });
  }
  for (const s of scenarios) {
    for (const t of s.transactions) {
      out.push({
        kind: 'transaction', id: `${s.id}:${t.id}`, label: `${t.id} · ${t.from} → ${t.to}`, sub: `${formatInr(t.amount)} · ${s.title}`,
        to: s.alertId ? `/alerts/${s.alertId}/graph` : '/transactions', txnId: t.id,
      });
    }
  }
  return out;
}

const rank = (e: SearchEntry, q: string): number => {
  const id = e.id.toLowerCase();
  const label = e.label.toLowerCase();
  if (id === q) return 0;
  if (id.startsWith(q) || (e.kind === 'transaction' && id.split(':')[1]?.startsWith(q))) return 1;
  if (label.startsWith(q)) return 2;
  if (id.includes(q) || label.includes(q)) return 3;
  return -1;
};

/** Ranking: exact id > id prefix > label prefix > contains. Grouped by kind, at most `max` results overall. */
export function search(index: SearchEntry[], query: string, max = 8): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = index
    .map((e) => ({ e, r: rank(e, q) }))
    .filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r || KIND_ORDER.indexOf(a.e.kind) - KIND_ORDER.indexOf(b.e.kind) || a.e.id.localeCompare(b.e.id))
    .slice(0, max)
    .map((x) => x.e);
  // group by kind while keeping the best-ranked group first
  const groupOrder: SearchKind[] = [];
  for (const e of scored) if (!groupOrder.includes(e.kind)) groupOrder.push(e.kind);
  return groupOrder.flatMap((k) => scored.filter((e) => e.kind === k));
}
