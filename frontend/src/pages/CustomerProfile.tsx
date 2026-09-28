import { useEffect, useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, ChevronLeft } from 'lucide-react';
import NotFound from './NotFound';
import { useReady, useStore } from '../data/store';
import { customerById } from '../data/selectors';
import { Avatar, Card, CardHeader, EmptyState, LevelChip, StatusChip, Table, Tabs, Td, Th, Tr } from '../components/ui';
import { KycChip } from './Customers';
import { ProfileAnalysisPanel } from '../components/customers/ProfileAnalysisPanel';
import { formatDateTimeIST, formatInr } from '../lib/format';

const TABS = [
  { id: 'overview', label: 'Overview' }, { id: 'accounts', label: 'Accounts' },
  { id: 'transactions', label: 'Transactions' }, { id: 'analysis', label: 'Profile Analysis' },
] as const;

export default function CustomerProfile() {
  const { id, tab } = useParams();
  const navigate = useNavigate();
  const { core, alerts } = useReady();
  const { state, ensureScenario } = useStore();
  const customer = customerById(core.customers, id);

  // transactions come from the scenario fixtures, so make sure they are loaded
  useEffect(() => { core.scenarios.forEach((s) => { if (!state.scenarios[s.id]) ensureScenario(s.id).catch(() => {}); }); }, [core.scenarios, state.scenarios, ensureScenario]);

  const accounts = useMemo(() => core.accounts.filter((a) => a.customerId === id), [core.accounts, id]);
  const linkedAlerts = useMemo(() => alerts.filter((a) => a.entityRefs.customerIds.includes(id ?? '')), [alerts, id]);
  const txns = useMemo(() => {
    const own = new Set(accounts.map((a) => a.id));
    return Object.values(state.scenarios).flatMap((s) => s.transactions.filter((t) => own.has(t.from) || own.has(t.to)).map((t) => ({ ...t, scenario: s })));
  }, [accounts, state.scenarios]);

  if (!customer) return <NotFound what="customer" />;
  if (!TABS.some((t) => t.id === tab)) return <Navigate to={`/customers/${customer.id}/overview`} replace />;

  return (
    <div className="space-y-5">
      <Link to="/customers" className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><ChevronLeft size={13} aria-hidden /> Back to Customers</Link>
      <div className="flex items-center gap-4">
        <Avatar initials={customer.initials} size={56} seed={customer.id} />
        <div>
          <h1 className="text-xl font-semibold">{customer.name}</h1>
          <p className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span>{customer.id}</span><span>{customer.type} Customer</span>
            <span className="flex items-center gap-1">KYC risk <KycChip risk={customer.kycRisk} /></span>
            {customer.verified ? <span className="flex items-center gap-1 text-risk-explained"><BadgeCheck size={13} aria-hidden /> Verified</span> : null}
          </p>
        </div>
      </div>
      <Tabs label="Customer sections" value={tab!} onChange={(t) => navigate(`/customers/${customer.id}/${t}`)} items={TABS.map((t) => ({ ...t }))} />

      {tab === 'overview' ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader title="Profile Summary" />
            <dl className="grid grid-cols-[9rem_1fr] gap-y-2 px-4 pb-4 text-sm">
              <dt className="text-muted">Age</dt><dd>{customer.age > 0 ? customer.age : '—'}</dd>
              <dt className="text-muted">Occupation</dt><dd>{customer.occupation}</dd>
              <dt className="text-muted">Annual Income</dt><dd>{formatInr(customer.annualIncome)}</dd>
              <dt className="text-muted">Location</dt><dd>{customer.location}</dd>
              <dt className="text-muted">Registered mobile</dt><dd>{customer.maskedPhone}</dd>
            </dl>
          </Card>
          <Card>
            <CardHeader title="Linked Alerts" />
            {linkedAlerts.length === 0 ? <EmptyState title="No linked alerts" /> : (
              <ul className="divide-y divide-line px-4 pb-2" aria-label="Linked alerts">
                {linkedAlerts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 py-2 text-xs">
                    <Link to={`/alerts/${a.id}/overview`} className="font-medium text-primary hover:underline">{a.id} – {a.title}</Link>
                    <span className="flex items-center gap-2"><LevelChip level={a.level} /><StatusChip status={a.status} /></span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}

      {tab === 'accounts' ? (
        <Card>
          {accounts.length === 0 ? <EmptyState title="No accounts" /> : (
            <Table label="Accounts">
              <thead><tr><Th>Account</Th><Th>Type</Th><Th>Balance</Th><Th>Opened</Th><Th>State</Th></tr></thead>
              <tbody>{accounts.map((a) => <Tr key={a.id}><Td className="font-medium">{a.id}</Td><Td>{a.type}</Td><Td>{formatInr(a.balance)}</Td><Td>{formatDateTimeIST(a.openedAt)}</Td><Td>{a.dormant ? 'Dormant' : 'Active'}</Td></Tr>)}</tbody>
            </Table>
          )}
        </Card>
      ) : null}

      {tab === 'transactions' ? (
        <Card>
          {txns.length === 0 ? <EmptyState title="No recorded transactions" hint="Only scripted scenario transactions are loaded in this prototype." /> : (
            <Table label="Customer transactions">
              <thead><tr><Th>Time</Th><Th>ID</Th><Th>From → To</Th><Th>Amount</Th><Th>Scenario</Th></tr></thead>
              <tbody>{txns.map((t) => <Tr key={`${t.scenario.id}-${t.id}`}><Td className="whitespace-nowrap">{formatDateTimeIST(t.at)}</Td><Td>{t.id}</Td><Td>{t.from} → {t.to}</Td><Td>{formatInr(t.amount)}</Td><Td>{t.scenario.alertId ? <Link className="text-primary hover:underline" to={`/alerts/${t.scenario.alertId}/graph`}>{t.scenario.alertId}</Link> : t.scenario.title}</Td></Tr>)}</tbody>
            </Table>
          )}
        </Card>
      ) : null}

      {tab === 'analysis' ? <ProfileAnalysisPanel customer={customer} /> : null}
    </div>
  );
}
