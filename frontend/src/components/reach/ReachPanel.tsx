import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardHeader, Chip, EmptyState, Select, Table, Td, Th, Tr } from '../ui';
import { formatInr } from '../../lib/format';
import type { ReachEntryT } from '../../types/contract';

export function PredicateChip({ text, holds }: { text: string; holds: boolean }) {
  return (
    <span title={text} className={`inline-flex max-w-[15rem] items-center gap-1 truncate rounded px-1.5 py-0.5 text-[11px] ${holds ? 'bg-indigo-50 text-indigo-900' : 'bg-slate-100 text-slate-600'}`}>
      {holds ? <Check size={11} aria-label="holds" /> : <X size={11} aria-label="does not hold" />}
      <span className="truncate">{text}</span>
    </span>
  );
}

export function sortReach(rows: ReachEntryT[]): ReachEntryT[] {
  return [...rows].sort((a, b) => b.exposure - a.exposure || a.accountId.localeCompare(b.accountId));
}

export function ReachPanel({ reach }: { reach: ReachEntryT[] }) {
  const [filter, setFilter] = useState<'ALL' | 'EXPOSED' | 'NEAR'>('ALL');
  const rows = useMemo(() => sortReach(reach).filter((r) => filter === 'ALL' || r.status === filter), [reach, filter]);

  return (
    <Card>
      <CardHeader
        title="Other accounts in the same state"
        action={
          <div className="flex items-center gap-2">
            <Chip fg="#92400e" bg="#fef3c7" className="!normal-case">Precomputed in prototype</Chip>
            <Select label="Filter exposure status" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="ALL">All</option><option value="EXPOSED">Exposed</option><option value="NEAR">Near-exposed</option>
            </Select>
          </div>
        }
      />
      <p className="px-4 pb-2 text-xs text-muted">Accounts that satisfy every step of the confirmed path except the final transfer (exposed), or all but one more step (near). Exposure values are scenario values.</p>
      {rows.length === 0 ? <EmptyState title="No accounts in this state" /> : (
        <Table label="Exposure">
          <thead><tr><Th>Account</Th><Th>Path predicates</Th><Th>Status</Th><Th>Exposure (scenario value)</Th><Th>Written by</Th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <Tr key={r.accountId} data-testid={`reach-${r.accountId}`}>
                <Td className="font-medium">{r.label}</Td>
                <Td><div className="flex flex-wrap gap-1">{r.predicates.map((p) => <PredicateChip key={p.text} {...p} />)}</div></Td>
                <Td><Chip fg={r.status === 'EXPOSED' ? '#b91c1c' : '#854d0e'} bg={r.status === 'EXPOSED' ? '#fee2e2' : '#fef9c3'}>{r.status === 'EXPOSED' ? 'Exposed' : 'Near'}</Chip></Td>
                <Td className="whitespace-nowrap font-medium">{formatInr(r.exposure)}</Td>
                <Td>{r.writers.join(', ')}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
