import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useReady } from '../data/store';
import {
  Button, Card, DateRangeInput, EmptyState, LevelChip, Pagination, SearchInput, Select, StatusChip, Table, Tabs, Td, Th, Tr, TypeChip, clampPage,
} from '../components/ui';
import { ALERT_LEVELS, ALERT_TYPES, LEVEL_LABEL, STATUS_LABEL, TYPE_LABEL, type AlertLevelT, type AlertTypeT } from '../types/contract';
import { EMPTY_FILTERS, PAGE_SIZE, filterAlerts, pageCount, type AlertFilters } from '../lib/alertFilters';
import { alertsNewestFirst } from '../data/selectors';
import { formatInr, formatDayMonthIST, formatTimeIST } from '../lib/format';
import { downloadText, toCsv } from '../lib/csv';
import { stagger } from '../lib/motion';

export default function Alerts() {
  const { alerts } = useReady();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const level = (ALERT_LEVELS as readonly string[]).includes(params.get('level') ?? '') ? (params.get('level') as AlertLevelT) : '';
  const type = (ALERT_TYPES as readonly string[]).includes(params.get('type') ?? '') ? (params.get('type') as AlertTypeT) : '';
  const filters: AlertFilters = { ...EMPTY_FILTERS, q: params.get('q') ?? '', level, type, from: params.get('from') ?? '', to: params.get('to') ?? '' };

  const sorted = useMemo(() => alertsNewestFirst(alerts), [alerts]);
  const filtered = useMemo(() => filterAlerts(sorted, filters), [sorted, filters.q, filters.level, filters.type, filters.from, filters.to]); // eslint-disable-line react-hooks/exhaustive-deps
  const pages = pageCount(filtered.length);
  const page = clampPage(params.get('page'), pages);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const levelCounts = useMemo(() => {
    const base = filterAlerts(sorted, { ...filters, level: '' });
    const c: Record<string, number> = { ALL: base.length };
    for (const l of ALERT_LEVELS) c[l] = base.filter((a) => a.level === l).length;
    return c;
  }, [sorted, filters.q, filters.type, filters.from, filters.to]); // eslint-disable-line react-hooks/exhaustive-deps

  function set(patch: Record<string, string>, resetPage = true) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) { if (v) next.set(k, v); else next.delete(k); }
    if (resetPage) next.delete('page');
    setParams(next, { replace: true });
  }

  function exportCsv() {
    const header = ['Alert ID', 'Created (IST)', 'Risk', 'Title', 'Amount (INR)', 'Type', 'Status', 'Assigned to'];
    const data = filtered.map((a) => [a.id, a.createdAt, LEVEL_LABEL[a.level], a.title, a.listFacts.amountAtRisk, TYPE_LABEL[a.type], STATUS_LABEL[a.status], a.assignedTo ?? '']);
    downloadText('KHOJI_alerts.csv', toCsv(header, data), 'text/csv;charset=utf-8');
  }

  const tabs = [
    { id: '', label: 'All Alerts', count: levelCounts.ALL },
    { id: 'HIGH', label: 'High', count: levelCounts.HIGH },
    { id: 'MEDIUM', label: 'Medium', count: levelCounts.MEDIUM },
    { id: 'WATCH', label: 'Watch', count: levelCounts.WATCH },
    { id: 'DATA_GAP', label: 'Inconclusive', count: levelCounts.DATA_GAP },
    { id: 'NEAR_MISS', label: 'Near-miss', count: levelCounts.NEAR_MISS },
    { id: 'INFO', label: 'Explained', count: levelCounts.INFO },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Alerts</h1>
        <Button icon={<Download size={14} />} onClick={exportCsv}>Export</Button>
      </div>
      <Card>
        <div className="px-4 pt-3">
          <Tabs label="Risk level" value={level} onChange={(id) => set({ level: id })} items={tabs} />
        </div>
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <SearchInput className="w-56" placeholder="Search alerts…" aria-label="Search alerts" value={filters.q} onChange={(e) => set({ q: e.target.value })} />
          <Select label="Alert type" value={type} onChange={(e) => set({ type: e.target.value })}>
            <option value="">All Types</option>
            {ALERT_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </Select>
          <Select label="Risk level filter" value={level} onChange={(e) => set({ level: e.target.value })}>
            <option value="">All Risk Levels</option>
            {ALERT_LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
          </Select>
          <DateRangeInput from={filters.from} to={filters.to} onChange={(from, to) => set({ from, to })} />
        </div>
        {rows.length === 0 ? (
          <EmptyState title="No alerts match" hint="Try clearing a filter or widening the date range." />
        ) : (
          <Table label="Alerts">
            <thead>
              <tr><Th>ID</Th><Th>Time</Th><Th>Risk</Th><Th>Alert Title</Th><Th>Amount</Th><Th>Type</Th><Th>Status</Th></tr>
            </thead>
            <tbody>
              {rows.map((a, i) => (
                <Tr key={a.id} className="animate-fade-in" style={stagger(i, 25)} onClick={() => navigate(`/alerts/${a.id}/overview`)}>
                  <Td className="whitespace-nowrap font-medium">{a.id}</Td>
                  <Td className="whitespace-nowrap text-muted">{formatDayMonthIST(a.createdAt)}, {formatTimeIST(a.createdAt)}</Td>
                  <Td><LevelChip level={a.level} /></Td>
                  <Td>{a.title}</Td>
                  <Td className="whitespace-nowrap">{formatInr(a.listFacts.amountAtRisk)}</Td>
                  <Td><TypeChip type={a.type} /></Td>
                  <Td><StatusChip status={a.status} /></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
        <div className="flex items-center justify-between px-4 py-3 text-xs text-muted">
          <span data-testid="showing">
            {filtered.length === 0 ? 'Showing 0 alerts' : `Showing ${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + rows.length} of ${filtered.length} alerts`}
          </span>
          <Pagination page={page} pageCount={pages} onChange={(p) => set({ page: String(p) }, false)} />
        </div>
      </Card>
    </div>
  );
}
