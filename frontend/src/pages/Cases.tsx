import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download, FolderOpen, Hourglass, Plus, Search, UserCheck, CheckCircle2 } from 'lucide-react';
import { useReady } from '../data/store';
import { useAuth } from '../auth/AuthContext';
import {
  Button, Card, EmptyState, KpiCard, Modal, Pagination, Select, StatusChip, Table, Td, Th, Tr, clampPage,
} from '../components/ui';
import { useCaseActions } from '../components/cases/useCaseActions';
import { formatDateTimeIST } from '../lib/format';
import { downloadText, toCsv } from '../lib/csv';
import { STATUS_LABEL } from '../types/contract';

const PRIORITY_TONE = { High: 'text-risk-high', Medium: 'text-risk-medium', Low: 'text-muted' } as const;
const PAGE = 10;

function CreateCaseDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { alerts, core } = useReady();
  const { assign } = useCaseActions();
  const eligible = alerts.filter((a) => a.status === 'NEW' || a.status === 'UNDER_REVIEW');
  const [alertId, setAlertId] = useState('');
  const [who, setWho] = useState(core.users[0].name);
  const chosen = alertId || eligible[0]?.id || '';
  return (
    <Modal open={open} title="Create case" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={!chosen} onClick={() => { if (assign(chosen, who)) onClose(); }}>Create case</Button></>}>
      {eligible.length === 0 ? <p className="text-sm text-muted">Every alert already has a case.</p> : (
        <div className="space-y-3">
          <div>
            <label htmlFor="cc-alert" className="mb-1 block text-xs font-medium">Alert</label>
            <Select label="Alert" id="cc-alert" value={chosen} onChange={(e) => setAlertId(e.target.value)} className="!h-9 w-full">
              {eligible.slice(0, 60).map((a) => <option key={a.id} value={a.id}>{a.id} – {a.title}</option>)}
            </Select>
          </div>
          <div>
            <label htmlFor="cc-who" className="mb-1 block text-xs font-medium">Assign to</label>
            <Select label="Assign to" id="cc-who" value={who} onChange={(e) => setWho(e.target.value)} className="!h-9 w-full">
              {core.users.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
            </Select>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function Cases() {
  const { cases } = useReady();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [creating, setCreating] = useState(false);

  const sorted = useMemo(() => [...cases].sort((a, b) => b.id.localeCompare(a.id)), [cases]);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const page = clampPage(params.get('page'), pages);
  const rows = sorted.slice((page - 1) * PAGE, page * PAGE);
  const count = (s: string) => cases.filter((c) => c.status === s).length;
  const mine = cases.filter((c) => c.assignedTo === user?.name && c.status !== 'CLOSED').length;

  function exportCsv() {
    downloadText('KHOJI_cases.csv', toCsv(
      ['Case ID', 'Related alert', 'Title', 'Priority', 'Status', 'Assigned to', 'Created (IST)'],
      sorted.map((c) => [c.id, c.alertId, c.title, c.priority, STATUS_LABEL[c.status], c.assignedTo ?? '', c.createdAt]),
    ), 'text/csv;charset=utf-8');
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cases</h1>
        <div className="flex gap-2">
          <Button icon={<Plus size={14} />} onClick={() => setCreating(true)}>Create Case</Button>
          <Button variant="secondary" icon={<Download size={14} />} onClick={exportCsv}>Export CSV</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <KpiCard label="My Cases" value={mine} icon={<UserCheck size={18} />} tone="blue" />
        <KpiCard label="Assigned" value={count('ASSIGNED')} icon={<FolderOpen size={18} />} tone="blue" />
        <KpiCard label="Investigating" value={count('INVESTIGATING')} icon={<Search size={18} />} tone="orange" />
        <KpiCard label="Pending Evidence" value={count('PENDING_EVIDENCE')} icon={<Hourglass size={18} />} tone="red" />
        <KpiCard label="Closed" value={count('CLOSED')} icon={<CheckCircle2 size={18} />} tone="green" />
      </div>
      <Card>
        {rows.length === 0 ? <EmptyState title="No cases yet" /> : (
          <Table label="Cases">
            <thead><tr><Th>Case ID</Th><Th>Related Alert</Th><Th>Case Title</Th><Th>Priority</Th><Th>Status</Th><Th>Assigned To</Th><Th>Created Date</Th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <Tr key={c.id} onClick={() => navigate(`/alerts/${c.alertId}/overview`)}>
                  <Td className="font-medium">{c.id}</Td>
                  <Td className="text-primary">{c.alertId}</Td>
                  <Td>{c.title}</Td>
                  <Td className={`font-medium ${PRIORITY_TONE[c.priority]}`}>{c.priority}</Td>
                  <Td><StatusChip status={c.status} /></Td>
                  <Td>{c.assignedTo ?? '—'}</Td>
                  <Td className="whitespace-nowrap">{formatDateTimeIST(c.createdAt)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
        <div className="flex items-center justify-between px-4 py-3 text-xs text-muted">
          <span data-testid="cases-showing">{sorted.length === 0 ? 'No cases' : `Showing ${(page - 1) * PAGE + 1}–${(page - 1) * PAGE + rows.length} of ${sorted.length} cases`}</span>
          <Pagination page={page} pageCount={pages} onChange={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n, { replace: true }); }} />
        </div>
      </Card>
      <CreateCaseDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
