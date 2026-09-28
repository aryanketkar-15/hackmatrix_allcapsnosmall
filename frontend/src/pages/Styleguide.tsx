import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Avatar, Button, Card, CardHeader, Chip, DateRangeInput, EmptyState, KpiCard, LevelChip, Logo, Modal, Pagination,
  PrototypeBadge, SearchInput, Select, StatusChip, Table, Tabs, Td, Th, Tooltip, Tr, TypeChip, useToast,
} from '../components/ui';
import { ALERT_LEVELS, ALERT_STATUSES } from '../types/contract';
import { formatInr } from '../lib/format';

export default function Styleguide() {
  const [tab, setTab] = useState('a');
  const [page, setPage] = useState(3);
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<[string, string]>(['', '']);
  const { push } = useToast();
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center gap-4"><Logo /><PrototypeBadge /></div>
      <Card>
        <CardHeader title="Risk chips" />
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {ALERT_LEVELS.map((l) => <LevelChip key={l} level={l} />)}
          {ALERT_STATUSES.map((s) => <StatusChip key={s} status={s} />)}
          <TypeChip type="CIRCULAR_TRANSFER" />
          <Chip fg="#4338ca" bg="#eef2ff">Necessary</Chip>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Alerts" value={124} icon={<AlertTriangle size={18} />} delta={{ pct: 12, label: 'from last week' }} />
        <KpiCard label="High Risk" value={28} icon={<AlertTriangle size={18} />} tone="red" />
        <KpiCard label="Under Investigation" value={46} icon={<AlertTriangle size={18} />} tone="orange" />
        <KpiCard label="Closed This Week" value={32} icon={<AlertTriangle size={18} />} tone="green" />
      </div>
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button><Button disabled>Disabled</Button>
          <Button variant="secondary" onClick={() => setOpen(true)}>Open modal</Button>
          <Button variant="secondary" onClick={() => push('Saved', 'success')}>Toast</Button>
          <Tooltip text="Signal level, not a finding of intent"><span className="text-xs underline">Tooltip</span></Tooltip>
          <Avatar initials="PS" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput placeholder="Search alerts…" />
          <Select label="Types"><option>All Types</option></Select>
          <DateRangeInput from={range[0]} to={range[1]} onChange={(a, b) => setRange([a, b])} />
        </div>
        <Tabs label="Demo tabs" value={tab} onChange={setTab} items={[{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Timeline' }, { id: 'c', label: 'Disabled', disabled: true }]} />
        <Table label="Demo table">
          <thead><tr><Th>ID</Th><Th>Amount</Th></tr></thead>
          <tbody><Tr><Td>ALT-2024-001</Td><Td>{formatInr(2980000)}</Td></Tr></tbody>
        </Table>
        <Pagination page={page} pageCount={13} onChange={setPage} />
        <EmptyState title="No alerts match" hint="Try changing the filters." />
      </Card>
      <Modal open={open} title="Example dialog" onClose={() => setOpen(false)} footer={<Button onClick={() => setOpen(false)}>Done</Button>}>
        <p className="text-sm">Native dialog with focus management.</p>
      </Modal>
    </div>
  );
}
