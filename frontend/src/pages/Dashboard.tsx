import { useReady } from '../data/store';
import { KpiRow } from '../components/dashboard/KpiRow';
import { RecentAlerts } from '../components/dashboard/RecentAlerts';
import { TopPatterns } from '../components/dashboard/TopPatterns';
import { AlertTrend } from '../components/dashboard/AlertTrend';
import { RiskDonut } from '../components/dashboard/RiskDonut';
import { dateKeyIST } from '../lib/format';

export default function Dashboard() {
  const { alerts, core, asOf } = useReady();
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <KpiRow alerts={alerts} asOf={asOf} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <AlertTrend alerts={alerts} startKey={dateKeyIST(core.meta.windowStart)} endKey={dateKeyIST(core.meta.windowEnd)} />
          <RecentAlerts alerts={alerts} asOf={asOf} />
        </div>
        <div className="space-y-5">
          <RiskDonut alerts={alerts} />
          <TopPatterns alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
