import { useState } from 'react';
import { Card, EmptyState, Tabs } from '../ui';
import { RemovePanel } from './RemovePanel';
import { noReplayReason } from './matchVariant';
import { TwinPanel, useTwinPair } from '../twin/TwinPanel';
import type { TabViewProps } from '../alerts/tabViews';

type Sub = 'replay' | 'twin' | 'exposure';

export function ButForTab({ alert, scenario }: TabViewProps) {
  const [sub, setSub] = useState<Sub>('replay');
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
          { id: 'exposure', label: 'Exposure (Reach)', disabled: true, title: 'Exposure scan arrives in a later milestone' },
        ]}
      />
      {sub === 'replay' ? (
        scenario.replay ? <RemovePanel alertId={alert.id} replay={scenario.replay} /> : (
          <Card><EmptyState title="Replay is not available for this alert" hint={noReplayReason(scenario.kind)} /></Card>
        )
      ) : null}
      {sub === 'twin' ? <TwinPanel scenario={scenario} /> : null}
    </div>
  );
}
