import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, EmptyState, LoadingState, SearchInput, Select } from '../components/ui';
import { MoneyGraph, type MoneyGraphHandle } from '../components/graph/MoneyGraph';
import { GraphLegend, GraphToolbar } from '../components/graph/GraphToolbar';
import type { GraphLayoutName } from '../components/graph/toElements';
import { toElements } from '../components/graph/toElements';
import { useReady, useStore } from '../data/store';
import type { GraphNodeT, ScenarioT } from '../types/contract';

/** Resolve a node to the page that describes it (customer / employee / owner of an account). */
export function nodeLink(node: GraphNodeT, ownerOf: Map<string, string>): { to: string; label: string } | null {
  if (node.kind === 'customer') return { to: `/customers/${node.id}/overview`, label: `Open customer ${node.id}` };
  if (node.kind === 'employee') return { to: `/employees/${node.id}`, label: `Open employee ${node.id}` };
  if (node.kind === 'account' && ownerOf.has(node.id)) return { to: `/customers/${ownerOf.get(node.id)}/accounts`, label: `Open owner ${ownerOf.get(node.id)}` };
  return null;
}

export function findNode(scenario: ScenarioT, query: string): GraphNodeT | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return scenario.nodes.find((n) => n.id.toLowerCase() === q)
    ?? scenario.nodes.find((n) => n.id.toLowerCase().includes(q) || n.label.toLowerCase().includes(q) || (n.sub ?? '').toLowerCase().includes(q));
}

export default function GraphExplorer() {
  const { core } = useReady();
  const { state, dispatch, ensureScenario } = useStore();
  const [scenarioId, setScenarioId] = useState(core.scenarios[0].id);
  const [layout, setLayout] = useState<GraphLayoutName>('preset');
  const [query, setQuery] = useState('');
  const handle = useRef<MoneyGraphHandle>(null);
  const scenario = state.scenarios[scenarioId];

  useEffect(() => { ensureScenario(scenarioId).catch(() => {}); }, [scenarioId, ensureScenario]);
  useEffect(() => { dispatch({ type: 'SELECT', selection: null }); setQuery(''); }, [scenarioId, dispatch]);

  const ownerOf = useMemo(() => new Map(core.customers.flatMap((c) => c.accountIds.map((a) => [a, c.id] as const))), [core.customers]);
  const match = scenario ? findNode(scenario, query) : undefined;
  const selectedNode = scenario && state.selection?.kind === 'node' ? scenario.nodes.find((n) => n.id === state.selection!.id) : undefined;

  // typing a query highlights the first matching node
  useEffect(() => {
    if (match) dispatch({ type: 'SELECT', selection: { kind: 'node', id: match.id } });
  }, [match, dispatch]);

  const neighbours = useMemo(() => {
    if (!scenario || !selectedNode) return [];
    return toElements(scenario).filter((e) => e.group === 'edges' && (e.data.source === selectedNode.id || e.data.target === selectedNode.id))
      .map((e) => ({ id: String(e.data.id), other: e.data.source === selectedNode.id ? String(e.data.target) : String(e.data.source), label: String(e.data.label ?? '') }));
  }, [scenario, selectedNode]);

  const link = selectedNode ? nodeLink(selectedNode, ownerOf) : null;
  const fullscreenSupported = typeof document !== 'undefined' && typeof document.documentElement.requestFullscreen === 'function';

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Graph Explorer</h1>
      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <Select label="Scenario" value={scenarioId} onChange={(e) => setScenarioId(e.target.value)} className="!h-8">
            {core.scenarios.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.title}</option>)}
          </Select>
          <SearchInput className="w-56" placeholder="Find a node (e.g. B-207)…" aria-label="Find a node" value={query} onChange={(e) => setQuery(e.target.value)} />
          <GraphToolbar layout={layout} onLayout={setLayout} onZoomIn={() => handle.current?.zoomBy(1.25)} onZoomOut={() => handle.current?.zoomBy(0.8)}
            onFit={() => handle.current?.fit()} fullscreenSupported={fullscreenSupported} onFullscreen={() => { handle.current?.container()?.requestFullscreen?.().catch(() => {}); }} />
        </div>
        {query.trim() && !match ? <p role="status" className="mb-2 text-xs text-muted">No match for “{query}”.</p> : null}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_16rem]">
          <div>
            {!scenario ? <LoadingState label="Loading graph…" /> : (
              <MoneyGraph ref={handle} scenario={scenario} layout={layout} selection={state.selection} onSelect={(s) => dispatch({ type: 'SELECT', selection: s })} height={480} />
            )}
            <div className="mt-2"><GraphLegend /></div>
          </div>
          <Card>
            <CardHeader title="Selected node" />
            {!selectedNode ? <EmptyState title="Nothing selected" hint="Click a node or search for one." /> : (
              <div className="space-y-2 px-4 pb-4 text-xs" data-testid="selected-node">
                <p className="text-sm font-semibold">{selectedNode.id}</p>
                <p className="text-muted">{selectedNode.label}{selectedNode.sub ? ` · ${selectedNode.sub}` : ''}</p>
                {link ? <Link to={link.to} className="text-primary underline">{link.label}</Link> : <p className="text-muted">No detail page for this node.</p>}
                <p className="pt-1 font-medium">Connected to</p>
                <ul className="space-y-0.5" aria-label="Neighbours">
                  {neighbours.length === 0 ? <li className="text-muted">No connections</li> : neighbours.map((n) => <li key={n.id}>{n.other} <span className="text-muted">{n.label}</span></li>)}
                </ul>
              </div>
            )}
          </Card>
        </div>
      </Card>
    </div>
  );
}
