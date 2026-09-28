import { useState } from 'react';
import { Card, EmptyState, Tabs } from '../ui';
import { RemovePanel } from './RemovePanel';
import { noReplayReason } from './matchVariant';
import type { TabViewProps } from '../alerts/tabViews';

type Sub = 'replay' | 'twin' | 'exposure';

export function ButForTab({ alert, scenario }: TabViewProps) {
  const [sub, setSub] = useState<Sub>('replay');
  if (!scenario) return <Card><EmptyState title="No reconstruction for this alert" /></Card>;

  return (
    <div className="space-y-4">
      <Tabs
        variant="pill"
        label="But-for views"
        value={sub}
        onChange={(s) => setSub(s as Sub)}
        items={[
          { id: 'replay', label: 'Replay (Remove)' },
          { id: 'twin', label: 'Legitimate twin', disabled: true, title: 'Comparison arrives in a later milestone' },
          { id: 'exposure', label: 'Exposure (Reach)', disabled: true, title: 'Exposure scan arrives in a later milestone' },
        ]}
      />
      {sub === 'replay' ? (
        scenario.replay ? <RemovePanel alertId={alert.id} replay={scenario.replay} /> : (
          <Card><EmptyState title="Replay is not available for this alert" hint={noReplayReason(scenario.kind)} /></Card>
        )
      ) : null}
    </div>
  );
}
