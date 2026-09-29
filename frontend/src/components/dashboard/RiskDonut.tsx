import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { canAnimate } from '../../lib/motion';
import { Card, CardHeader, EmptyState } from '../ui';
import { riskDistribution } from '../../lib/metrics';
import { LEVEL_LABEL, type AlertT } from '../../types/contract';
import { LEVEL_STYLE } from '../ui/chipStyles';

export function RiskDonut({ alerts }: { alerts: AlertT[] }) {
  const dist = riskDistribution(alerts);
  const total = alerts.length;
  return (
    <Card>
      <CardHeader title="Risk Distribution" />
      {total === 0 ? <EmptyState title="No data" /> : (
        <div className="flex items-center gap-4 px-4 pb-4">
          <div className="relative h-36 w-36 shrink-0" role="img" aria-label="Donut chart of alerts by risk level">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie data={dist} dataKey="count" nameKey="level" innerRadius={44} outerRadius={64} paddingAngle={1} stroke="none" isAnimationActive={canAnimate()} animationDuration={900} animationEasing="ease-out">
                  {dist.map((d) => <Cell key={d.level} fill={LEVEL_STYLE[d.level].dot} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold leading-none">{total}</span>
              <span className="text-[10px] text-muted">Total Alerts</span>
            </div>
          </div>
          <table className="w-full text-xs" aria-label="Risk distribution legend">
            <tbody>
              {dist.map((d) => (
                <tr key={d.level}>
                  <td className="py-0.5"><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: LEVEL_STYLE[d.level].dot }} aria-hidden />{LEVEL_LABEL[d.level]}</td>
                  <td className="py-0.5 text-right font-medium tabular-nums">{d.count}</td>
                  <td className="py-0.5 pl-2 text-right text-muted tabular-nums">({d.pct}%)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
