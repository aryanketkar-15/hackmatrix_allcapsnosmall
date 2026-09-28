import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReady } from '../data/store';
import { Avatar, Card, Chip, EmptyState, Pagination, SearchInput, Table, Td, Th, Tr, clampPage } from '../components/ui';

const PAGE = 10;

export default function Employees() {
  const { core, alerts } = useReady();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = (params.get('q') ?? '').trim().toLowerCase();

  const linked = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of alerts) for (const e of a.entityRefs.employeeIds) m.set(e, (m.get(e) ?? 0) + 1);
    return m;
  }, [alerts]);
  const filtered = core.employees.filter((e) => !q || e.id.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const page = clampPage(params.get('page'), pages);
  const rows = filtered.slice((page - 1) * PAGE, page * PAGE);
  const set = (patch: Record<string, string>) => { const n = new URLSearchParams(params); for (const [k, v] of Object.entries(patch)) { if (v) n.set(k, v); else n.delete(k); } setParams(n, { replace: true }); };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Employees</h1>
      <Card>
        <div className="px-4 py-3"><SearchInput className="w-64" placeholder="Search employees…" aria-label="Search employees" value={params.get('q') ?? ''} onChange={(e) => set({ q: e.target.value, page: '' })} /></div>
        {rows.length === 0 ? <EmptyState title="No employees match" /> : (
          <Table label="Employees">
            <thead><tr><Th>ID</Th><Th>Name</Th><Th>Role</Th><Th>Branch</Th><Th>Misuse signals</Th><Th>Linked alerts</Th></tr></thead>
            <tbody>
              {rows.map((e) => (
                <Tr key={e.id} onClick={() => navigate(`/employees/${e.id}`)}>
                  <Td className="font-medium">{e.id}</Td>
                  <Td><span className="flex items-center gap-2"><Avatar initials={e.initials} size={24} seed={e.id} />{e.name}</span></Td>
                  <Td>{e.role}</Td><Td>{e.branch}</Td>
                  <Td>{e.signalCount > 0 ? <Chip fg="#9a3412" bg="#ffedd5" className="!normal-case">{e.signalCount} signals</Chip> : <span className="text-muted">None</span>}</Td>
                  <Td>{linked.get(e.id) ?? 0}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
        <div className="flex items-center justify-between px-4 py-3 text-xs text-muted">
          <span data-testid="emp-showing">{filtered.length === 0 ? 'No employees' : `Showing ${(page - 1) * PAGE + 1}–${(page - 1) * PAGE + rows.length} of ${filtered.length} employees`}</span>
          <Pagination page={page} pageCount={pages} onChange={(p) => set({ page: String(p) })} />
        </div>
        <p className="border-t border-line px-4 py-2 text-[11px] text-muted">Signals flag misuse of valid access. They are signals, not findings of intent.</p>
      </Card>
    </div>
  );
}
