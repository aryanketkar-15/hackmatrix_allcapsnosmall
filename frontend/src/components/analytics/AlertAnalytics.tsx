import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardHeader, EmptyState } from '../ui';
import { countBy, percentages, topPatterns, weeklyByType } from '../../lib/metrics';
import { TYPE_LABEL, ALERT_TYPES, type AlertT, type AlertTypeT } from '../../types/contract';

export const TYPE_COLORS: Record<AlertTypeT, string> = {
  CIRCULAR_TRANSFER: '#2563eb', STRUCTURING: '#7c3aed', FAN_OUT: '#0d9488', FAN_IN: '#ea580c', PASS_THROUGH: '#dc2626',
  BENEFICIARY_MANIPULATION: '#ca8a04', DORMANT_ACTIVATION: '#64748b', PROFILE_MISMATCH: '#db2777', INSIDER_ACTIVITY: '#16a34a',
};

export function typeDistribution(alerts: AlertT[]) {
  const counts = countBy(alerts, (a) => a.type);
  const rows = ALERT_TYPES.map((t) => ({ type: t, count: counts[t] ?? 0 })).filter((r) => r.count > 0).sort((a, b) => b.count - a.count);
  const pct = percentages(rows.map((r) => r.count));
  return rows.map((r, i) => ({ ...r, pct: pct[i] }));
}

export function AlertAnalytics({ alerts, startKey }: { alerts: AlertT[]; startKey: string }) {
  const top5 = topPatterns(alerts, 5).map((t) => t.type);
  const weekly = weeklyByType(alerts, startKey, 5, top5);
  const dist = typeDistribution(alerts);
  const empty = alerts.length === 0;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader title="Fraud Patterns Trend (weekly)" />
        {empty ? <EmptyState title="No data" /> : (
          <>
            <ul className="flex flex-wrap gap-3 px-4 text-[11px] text-muted" aria-label="Pattern legend">
              {top5.map((t) => <li key={t} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[t] }} aria-hidden />{TYPE_LABEL[t]}</li>)}
            </ul>
            <div className="px-2 pb-3 pt-2" role="img" aria-label="Line chart of weekly alert counts for the five most common patterns">
              <ResponsiveContainer width="100%" height={260} minWidth={0}>
                <LineChart data={weekly} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
                  <CartesianGrid stroke="#eef0f4" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#566072' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#566072' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  {top5.map((t) => <Line key={t} type="monotone" dataKey={t} name={TYPE_LABEL[t]} stroke={TYPE_COLORS[t]} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />)}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        <table className="sr-only" aria-label="Weekly pattern data">
          <thead><tr><th>Week</th>{top5.map((t) => <th key={t}>{TYPE_LABEL[t]}</th>)}</tr></thead>
          <tbody>{weekly.map((w) => <tr key={w.label}><td>{w.label}</td>{top5.map((t) => <td key={t}>{w[t]}</td>)}</tr>)}</tbody>
        </table>
      </Card>

      <Card>
        <CardHeader title="Alerts by Type" />
        {empty ? <EmptyState title="No data" /> : (
          <div className="px-4 pb-4">
            <div className="relative mx-auto h-44 w-44" role="img" aria-label="Donut chart of alerts by type">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={dist} dataKey="count" nameKey="type" innerRadius={54} outerRadius={80} paddingAngle={1} stroke="none" isAnimationActive={false}>
                    {dist.map((d) => <Cell key={d.type} fill={TYPE_COLORS[d.type]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-semibold leading-none">{alerts.length}</span><span className="text-[10px] text-muted">Total</span></div>
            </div>
            <table className="mt-3 w-full text-xs" aria-label="Alerts by type legend">
              <tbody>
                {dist.map((d) => (
                  <tr key={d.type}>
                    <td className="py-0.5"><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[d.type] }} aria-hidden />{TYPE_LABEL[d.type]}</td>
                    <td className="py-0.5 text-right tabular-nums">{d.count}</td>
                    <td className="py-0.5 pl-2 text-right text-muted tabular-nums">({d.pct}%)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
