import { useSearchParams } from 'react-router-dom';
import { useReady } from '../data/store';
import { Tabs } from '../components/ui';
import { AlertAnalytics } from '../components/analytics/AlertAnalytics';
import { EvaluationPanel } from '../components/analytics/EvaluationPanel';
import { dateKeyIST } from '../lib/format';

export default function Analytics() {
  const { alerts, core, metrics } = useReady();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'evaluation' ? 'evaluation' : 'alerts';
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Analytics</h1>
      <Tabs label="Analytics sections" value={tab} onChange={(t) => setParams(t === 'alerts' ? {} : { tab: t }, { replace: true })}
        items={[{ id: 'alerts', label: 'Alert analytics' }, { id: 'evaluation', label: 'Evaluation' }]} />
      {tab === 'alerts'
        ? <AlertAnalytics alerts={alerts} startKey={dateKeyIST(core.meta.windowStart)} />
        : <EvaluationPanel metrics={metrics} />}
    </div>
  );
}
