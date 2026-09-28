import { useRef, useState } from 'react';
import { Card, EmptyState } from '../ui';
import { MoneyGraph, type MoneyGraphHandle } from './MoneyGraph';
import { GraphLegend, GraphToolbar } from './GraphToolbar';
import type { GraphLayoutName } from './toElements';
import { useStore } from '../../data/store';
import type { AlertT, ScenarioT } from '../../types/contract';
import { LEVEL_LABEL } from '../../types/contract';

export function GraphTab({ alert, scenario }: { alert: AlertT; scenario: ScenarioT | null }) {
  const { state, dispatch } = useStore();
  const [layout, setLayout] = useState<GraphLayoutName>('preset');
  const handle = useRef<MoneyGraphHandle>(null);
  if (!scenario) return <Card><EmptyState title="No reconstruction for this alert" hint="Full reconstruction is included only for scenario alerts in this prototype." /></Card>;

  const fullscreenSupported = typeof document !== 'undefined' && typeof document.documentElement.requestFullscreen === 'function';
  const cycle = scenario.transactions.some((t) => t.cycle);

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <GraphToolbar
          layout={layout}
          onLayout={setLayout}
          onZoomIn={() => handle.current?.zoomBy(1.25)}
          onZoomOut={() => handle.current?.zoomBy(0.8)}
          onFit={() => handle.current?.fit()}
          fullscreenSupported={fullscreenSupported}
          onFullscreen={() => { handle.current?.container()?.requestFullscreen?.().catch(() => {}); }}
        />
        <GraphLegend />
      </div>
      <MoneyGraph
        ref={handle}
        scenario={scenario}
        layout={layout}
        selection={state.selection}
        onSelect={(s) => dispatch({ type: 'SELECT', selection: s })}
      />
      <p className="mt-2 text-xs text-muted">
        {cycle ? 'Red edges form a time-respecting loop. ' : ''}
        {scenario.level === 'INFO' ? `This pattern is labelled ${LEVEL_LABEL[alert.level]} because independent, pre-dated evidence explains it. ` : ''}
        Click a node or transfer to link it with the Timeline.
      </p>
    </Card>
  );
}
