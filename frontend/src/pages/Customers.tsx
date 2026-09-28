import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReady } from '../data/store';
import { Avatar, Card, Chip, EmptyState, Pagination, SearchInput, Table, Td, Th, Tr, clampPage } from '../components/ui';

const KYC_STYLE = { Low: ['#166534', '#dcfce7'], Medium: ['#854d0e', '#fef9c3'], High: ['#b91c1c', '#fee2e2'] } as const;
const PAGE = 10;

export function KycChip({ risk }: { risk: keyof typeof KYC_STYLE }) {
  const [fg, bg] = KYC_STYLE[risk];
  return <Chip fg={fg} bg={bg}>{risk}</Chip>;
}

export default function Customers() {
  const { core, alerts } = useReady();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = (params.get('q') ?? '').trim().toLowerCase();

  const linked = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of alerts) for (const c of a.entityRefs.customerIds) m.set(c, (m.get(c) ?? 0) + 1);
    return m;
  }, [alerts]);
  const filtered = core.customers.filter((c) => !q || c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const page = clampPage(params.get('page'), pages);
  const rows = filtered.slice((page - 1) * PAGE, page * PAGE);

  const set = (patch: Record<string, string>) => { const n = new URLSearchParams(params); for (const [k, v] of Object.entries(patch)) { if (v) n.set(k, v); else n.delete(k); } setParams(n, { replace: true }); };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Customers</h1>
      <Card>
        <div className="px-4 py-3"><SearchInput className="w-64" placeholder="Search customers…" aria-label="Search customers" value={params.get('q') ?? ''} onChange={(e) => set({ q: e.target.value, page: '' })} /></div>
        {rows.length === 0 ? <EmptyState title="No customers match" /> : (
          <Table label="Customers">
            <thead><tr><Th>ID</Th><Th>Name</Th><Th>Type</Th><Th>KYC Risk</Th><Th>Accounts</Th><Th>Linked Alerts</Th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <Tr key={c.id} onClick={() => navigate(`/customers/${c.id}/overview`)}>
                  <Td className="font-medium">{c.id}</Td>
                  <Td><span className="flex items-center gap-2"><Avatar initials={c.initials} size={24} seed={c.id} />{c.name}</span></Td>
                  <Td>{c.type}</Td><Td><KycChip risk={c.kycRisk} /></Td>
                  <Td>{c.accountIds.length}</Td><Td>{linked.get(c.id) ?? 0}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
        <div className="flex items-center justify-between px-4 py-3 text-xs text-muted">
          <span data-testid="cust-showing">{filtered.length === 0 ? 'No customers' : `Showing ${(page - 1) * PAGE + 1}–${(page - 1) * PAGE + rows.length} of ${filtered.length} customers`}</span>
          <Pagination page={page} pageCount={pages} onChange={(p) => set({ page: String(p) })} />
        </div>
      </Card>
    </div>
  );
}
