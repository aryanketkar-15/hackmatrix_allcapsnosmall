import { Card, EmptyState } from '../ui';
import { Timeline } from './Timeline';
import { useStore } from '../../data/store';
import type { TabViewProps } from '../alerts/tabViews';

export function TimelineTab({ scenario }: TabViewProps) {
  const { state, dispatch } = useStore();
  if (!scenario) return <Card><EmptyState title="No timeline for this alert" /></Card>;
  return (
    <Card className="p-5">
      <Timeline entries={scenario.timeline} selection={state.selection} onSelect={(s) => dispatch({ type: 'SELECT', selection: s })} overlay={state.overlay} />
    </Card>
  );
}
