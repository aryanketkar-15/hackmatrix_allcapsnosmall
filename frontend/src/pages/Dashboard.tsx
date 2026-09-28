import { useReady } from '../data/store';
import { KpiRow } from '../components/dashboard/KpiRow';
import { RecentAlerts } from '../components/dashboard/RecentAlerts';
import { TopPatterns } from '../components/dashboard/TopPatterns';

export default function Dashboard() {
  const { alerts, asOf } = useReady();
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <KpiRow alerts={alerts} asOf={asOf} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <RecentAlerts alerts={alerts} asOf={asOf} />
        </div>
        <div className="space-y-5">
          <TopPatterns alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
