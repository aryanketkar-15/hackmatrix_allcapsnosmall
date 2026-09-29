import { Link } from 'react-router-dom';
import { canAnimate } from '../../lib/motion';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardHeader, EmptyState } from '../ui';
import { analyzeProfile } from '../../lib/profileAnalysis';
import { formatDateTimeIST, formatInr } from '../../lib/format';
import type { CustomerT } from '../../types/contract';

const times = (n: number | null) => (n === null ? '—' : `${n.toFixed(n >= 10 ? 0 : 1)}×`);

export function ProfileAnalysisPanel({ customer }: { customer: CustomerT }) {
  const a = analyzeProfile(customer);
  if (!a.hasFlows) return <Card><EmptyState title="No transaction history for this customer" hint="Profile analysis needs at least one month of flows." /></Card>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          ['Declared monthly income', formatInr(a.declaredMonthly), `from a declared annual income of ${formatInr(customer.annualIncome)}`],
          [`Observed inflow (${a.latestMonth})`, formatInr(a.observedInflow), `${times(a.ratio)} the declared monthly income`],
          ['Counterparty diversity', String(customer.counterpartyCount), 'distinct counterparties'],
          ['Pass-through ratio', a.passThrough === null ? '—' : a.passThrough.toFixed(2), 'outflow ÷ inflow in the latest month'],
        ].map(([label, value, hint]) => (
          <Card key={label} className="p-4" data-testid={`pa-${label}`}>
            <p className="text-xs text-muted">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
            <p className="text-[11px] text-muted">{hint}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Monthly flows vs declared income" />
        <div className="px-2 pb-3" role="img" aria-label="Bar chart of monthly inflow and outflow against the declared monthly income">
          <ResponsiveContainer width="100%" height={220} minWidth={0}>
            <BarChart data={customer.monthlyFlows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="#eef0f4" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#566072' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#566072' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 100000)}L`} />
              <Tooltip formatter={(v) => formatInr(Number(v))} contentStyle={{ fontSize: 12 }} />
              <ReferenceLine y={a.declaredMonthly} stroke="#dc2626" strokeDasharray="4 3" label={{ value: 'Declared monthly income', position: 'insideTopLeft', fontSize: 10, fill: '#b91c1c' }} />
              <Bar dataKey="inflow" name="Inflow" fill="#2563eb" isAnimationActive={canAnimate()} animationDuration={900} animationEasing="ease-out" />
              <Bar dataKey="outflow" name="Outflow" fill="#94a3b8" isAnimationActive={canAnimate()} animationDuration={900} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <table className="sr-only" aria-label="Monthly flow data">
          <thead><tr><th>Month</th><th>Inflow</th><th>Outflow</th></tr></thead>
          <tbody>{customer.monthlyFlows.map((f) => <tr key={f.month}><td>{f.month}</td><td>{f.inflow}</td><td>{f.outflow}</td></tr>)}</tbody>
        </table>
      </Card>

      {customer.profileEdit ? (
        <Card className="border-amber-300 bg-amber-50 p-4 text-sm" data-testid="profile-edit">
          <p className="font-semibold">Profile edited by {customer.profileEdit.by} on {formatDateTimeIST(customer.profileEdit.at)}</p>
          <p className="text-xs text-ink">Field changed: {customer.profileEdit.field}. The edit moved the declared income closer to the observed flows, which weakens a static threshold. The change is versioned and linked to the alert.</p>
          <Link to={`/alerts/${customer.profileEdit.alertId}/overview`} className="mt-1 inline-block text-xs font-medium text-primary underline">View alert {customer.profileEdit.alertId}</Link>
        </Card>
      ) : null}

      {customer.explanation ? (
        <Card className="border-green-300 bg-green-50 p-4 text-sm" data-testid="explanation">
          <p className="font-semibold">Explanation evidence on file</p>
          <p className="text-xs text-ink">{customer.explanation.text}</p>
          <ul className="mt-1 list-disc pl-5 text-xs text-muted">{customer.explanation.documents.map((d) => <li key={d}>{d}</li>)}</ul>
        </Card>
      ) : null}
    </div>
  );
}
