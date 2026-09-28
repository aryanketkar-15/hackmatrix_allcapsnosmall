import { useSearchParams } from 'react-router-dom';
import { Card, EmptyState, Tabs } from '../ui';
import { RemovePanel } from './RemovePanel';
import { noReplayReason } from './matchVariant';
import { TwinPanel, useTwinPair } from '../twin/TwinPanel';
import { ReachPanel } from '../reach/ReachPanel';
import type { TabViewProps } from '../alerts/tabViews';

type Sub = 'replay' | 'twin' | 'exposure';

export function ButForTab({ alert, scenario }: TabViewProps) {
  const [params, setParams] = useSearchParams();
  const raw = params.get('view');
  const sub: Sub = raw === 'twin' || raw === 'exposure' ? raw : 'replay';
  const setSub = (v: Sub) => { const n = new URLSearchParams(params); if (v === 'replay') n.delete('view'); else n.set('view', v); setParams(n, { replace: true }); };
  const pair = useTwinPair(scenario);
  if (!scenario) return <Card><EmptyState title="No reconstruction for this alert" /></Card>;
  const twinDisabled = pair === null;

  return (
    <div className="space-y-4">
      <Tabs
        variant="pill"
        label="But-for views"
        value={sub}
        onChange={(s) => setSub(s as Sub)}
        items={[
          { id: 'replay', label: 'Replay (Remove)' },
          { id: 'twin', label: 'Legitimate twin', disabled: twinDisabled, title: twinDisabled ? 'No legitimate twin exists for this scenario' : undefined },
          { id: 'exposure', label: 'Exposure (Reach)' },
        ]}
      />
      {sub === 'replay' ? (
        scenario.replay ? <RemovePanel alertId={alert.id} replay={scenario.replay} /> : (
          <Card><EmptyState title="Replay is not available for this alert" hint={noReplayReason(scenario.kind)} /></Card>
        )
      ) : null}
      {sub === 'twin' ? <TwinPanel scenario={scenario} /> : null}
      {sub === 'exposure' ? <ReachPanel reach={scenario.reach} /> : null}
    </div>
  );
}
