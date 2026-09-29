import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { canAnimate } from '../../lib/motion';
import { Card, CardHeader, EmptyState } from '../ui';
import { TREND_LEVELS, trendSeries } from '../../lib/metrics';
import { LEVEL_LABEL, type AlertT } from '../../types/contract';
import { LEVEL_STYLE } from '../ui/chipStyles';

export function AlertTrend({ alerts, startKey, endKey }: { alerts: AlertT[]; startKey: string; endKey: string }) {
  const data = trendSeries(alerts, startKey, endKey);
  const empty = alerts.length === 0;
  return (
    <Card>
      <CardHeader
        title="Alert Trend"
        action={
          <ul className="flex gap-3 text-[11px] text-muted" aria-label="Legend">
            {TREND_LEVELS.map((l) => (
              <li key={l} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: LEVEL_STYLE[l].dot }} aria-hidden />{LEVEL_LABEL[l]}</li>
            ))}
          </ul>
        }
      />
      {empty ? <EmptyState title="No data" /> : (
        <div className="px-2 pb-3" role="img" aria-label="Line chart of daily alert counts by risk level">
          <ResponsiveContainer width="100%" height={210} minWidth={0}>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
              <CartesianGrid stroke="#eef0f4" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#566072' }} interval={4} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#566072' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
              {TREND_LEVELS.map((l) => (
                <Line key={l} type="monotone" dataKey={l} name={LEVEL_LABEL[l]} stroke={LEVEL_STYLE[l].dot} strokeWidth={2} dot={false} isAnimationActive={canAnimate()} animationDuration={900} animationEasing="ease-out" />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <table className="sr-only" aria-label="Alert trend data">
        <thead><tr><th>Day</th>{TREND_LEVELS.map((l) => <th key={l}>{LEVEL_LABEL[l]}</th>)}</tr></thead>
        <tbody>{data.map((p) => <tr key={p.dayKey}><td>{p.label}</td>{TREND_LEVELS.map((l) => <td key={l}>{p[l]}</td>)}</tr>)}</tbody>
      </table>
    </Card>
  );
}
