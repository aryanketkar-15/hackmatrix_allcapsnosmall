import { Link } from 'react-router-dom';
import { AlertTriangle, Building2, Users, ArrowLeftRight, UserRound, Landmark } from 'lucide-react';
import { Card, CardHeader, LevelChip } from '../ui';
import { formatDateTimeIST, formatInr } from '../../lib/format';
import { deriveAlertFacts } from '../../lib/metrics';
import { TYPE_LABEL, type AlertT, type ListFactsT, type ScenarioT } from '../../types/contract';
import { NO_INTENT_STATEMENT } from '../../lib/statements';

/** Facts for display: derived from the scenario's transactions for FULL alerts, `listFacts` otherwise. */
export function factsFor(alert: AlertT, scenario: ScenarioT | null | undefined): ListFactsT {
  return scenario ? deriveAlertFacts(scenario) : alert.listFacts;
}

const CONF_TEXT = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low', INSUFFICIENT: 'Insufficient' } as const;

export function OverviewTab({ alert, scenario }: { alert: AlertT; scenario: ScenarioT | null | undefined }) {
  const f = factsFor(alert, scenario);
  const full = alert.detailLevel === 'FULL';
  const base = `/alerts/${alert.id}`;
  const rows: { icon: typeof Building2; label: string; count: number; to: string | null }[] = [
    { icon: Building2, label: 'Accounts', count: f.accountsCount, to: full ? `${base}/graph` : null },
    { icon: UserRound, label: 'Employees', count: f.employeesCount, to: full && f.employeesCount ? `${base}/employee` : null },
    { icon: Users, label: 'Customers', count: f.customersCount, to: alert.entityRefs.customerIds[0] ? `/customers/${alert.entityRefs.customerIds[0]}/overview` : null },
    { icon: ArrowLeftRight, label: 'Transactions', count: f.transactionsCount, to: full ? `${base}/timeline` : null },
    { icon: Landmark, label: 'Beneficiaries', count: f.beneficiariesCount, to: full ? `${base}/graph` : null },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
        <Card>
          <CardHeader title="Alert Summary" />
          <div className="space-y-3 px-4 pb-4 text-sm">
            <p className="leading-relaxed">{alert.summary}</p>
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs">
                <span className="text-muted">Risk level</span> <LevelChip level={alert.level} />
                <span className="text-muted">Evidence confidence</span>
                <span className="font-medium" data-testid="confidence">{CONF_TEXT[alert.evidenceConfidence]}</span>
              </div>
              <ul className="ml-4 list-disc space-y-0.5 text-xs text-ink" aria-label="Reasons">
                {alert.reasons.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
            <dl className="grid grid-cols-[9rem_1fr] gap-y-1.5 text-xs">
              <dt className="text-muted">Type</dt><dd>{TYPE_LABEL[alert.type]}</dd>
              <dt className="text-muted">Total Amount</dt><dd className="font-medium">{formatInr(f.amountAtRisk)}</dd>
              <dt className="text-muted">Accounts Involved</dt><dd>{f.accountsCount}</dd>
              <dt className="text-muted">Employees Involved</dt><dd>{f.employeesCount}</dd>
              <dt className="text-muted">Transactions</dt><dd>{f.transactionsCount}</dd>
              <dt className="text-muted">First Transaction</dt><dd>{formatDateTimeIST(f.firstTxnAt)}</dd>
              <dt className="text-muted">Last Transaction</dt><dd>{formatDateTimeIST(f.lastTxnAt)}</dd>
            </dl>
          </div>
        </Card>

        <Card>
          <CardHeader title="Risk Indicators" />
          {alert.riskIndicators.length === 0 ? <p className="px-4 pb-4 text-xs text-muted">No indicators recorded.</p> : (
            <ul className="space-y-2.5 px-4 pb-4">
              {alert.riskIndicators.map((r) => (
                <li key={r.text} className="flex items-start gap-2 text-xs">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${r.severity === 'high' ? 'bg-red-50 text-risk-high' : 'bg-orange-50 text-risk-medium'}`}>
                    <AlertTriangle size={11} aria-hidden />
                  </span>
                  {r.text}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Related Entities" />
          <ul className="divide-y divide-line px-4 pb-2">
            {rows.map(({ icon: Icon, label, count, to }) => (
              <li key={label} className="flex items-center justify-between py-2 text-xs">
                <span className="flex items-center gap-2"><Icon size={14} className="text-primary" aria-hidden />{label}</span>
                <span className="flex items-center gap-3">
                  <span className="font-medium tabular-nums">{count}</span>
                  {to && count > 0 ? <Link to={to} className="text-primary hover:underline">View</Link> : <span className="w-7" />}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <p className="text-xs text-muted" data-testid="no-intent">{NO_INTENT_STATEMENT}</p>
    </div>
  );
}
