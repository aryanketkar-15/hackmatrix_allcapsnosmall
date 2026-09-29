import { AlertTriangle, CheckCircle2, Search, ShieldAlert } from 'lucide-react';
import { KpiCard } from '../ui';
import { computeKpis } from '../../lib/metrics';
import type { AlertT } from '../../types/contract';

export function KpiRow({ alerts, asOf }: { alerts: AlertT[]; asOf: string }) {
  const k = computeKpis(alerts, asOf);
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <KpiCard label="Total Alerts" value={k.total.value} icon={<AlertTriangle size={18} />} tone="blue" delta={k.total.delta} index={0} />
      <KpiCard label="High Risk" value={k.high.value} icon={<ShieldAlert size={18} />} tone="red" delta={k.high.delta} index={1} />
      <KpiCard label="Under Investigation" value={k.underInvestigation.value} icon={<Search size={18} />} tone="orange" delta={k.underInvestigation.delta} index={2} />
      <KpiCard label="Closed This Week" value={k.closedThisWeek.value} icon={<CheckCircle2 size={18} />} tone="green" delta={k.closedThisWeek.delta} index={3} />
    </div>
  );
}
