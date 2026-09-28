import { Card, EmptyState } from '../ui';
import { Timeline } from './Timeline';
import { useStore } from '../../data/store';
import type { TabViewProps } from '../alerts/tabViews';

export function TimelineTab({ scenario }: TabViewProps) {
  const { state, dispatch } = useStore();
  if (!scenario) return <Card><EmptyState title="No timeline for this alert" /></Card>;
  return (
    <Card className="p-5">
      {state.overlay.length ? (
        <div className="mb-4 flex items-center justify-between rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900" role="status">
          <span>Showing the but-for replay cascade ({state.overlay.length} events would not execute). Precomputed in prototype.</span>
          <button type="button" className="font-medium underline" onClick={() => dispatch({ type: 'SET_OVERLAY', ids: [] })}>Clear overlay</button>
        </div>
      ) : null}
      <Timeline entries={scenario.timeline} selection={state.selection} onSelect={(s) => dispatch({ type: 'SELECT', selection: s })} overlay={state.overlay} />
    </Card>
  );
}
