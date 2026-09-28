import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import cytoscape, { type Core } from 'cytoscape';
import type { ScenarioT } from '../../types/contract';
import type { Selection } from '../../data/store';
import { GRAPH_STYLE } from './graphStyles';
import { hasPositions, layoutOptions, toElements, type GraphLayoutName } from './toElements';

export interface MoneyGraphHandle { zoomBy: (f: number) => void; fit: () => void; container: () => HTMLDivElement | null; png: () => string | undefined }

interface Props {
  scenario: ScenarioT;
  layout: GraphLayoutName;
  selection: Selection | null;
  onSelect: (s: Selection | null) => void;
  height?: number;
  /** ids of events greyed out by the but-for replay overlay (transaction ids also mute their edges) */
  mutedTxnIds?: string[];
}

/** jsdom cannot draw a canvas, so tests run Cytoscape headless. */
const isJsdom = () => typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);

export const MoneyGraph = forwardRef<MoneyGraphHandle, Props>(function MoneyGraph({ scenario, layout, selection, onSelect, height = 460, mutedTxnIds = [] }, ref) {
  const el = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useImperativeHandle(ref, () => ({
    zoomBy: (f) => { const cy = cyRef.current; if (cy) cy.zoom({ level: cy.zoom() * f, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } }); },
    fit: () => cyRef.current?.fit(undefined, 40),
    container: () => el.current,
    png: () => cyRef.current?.png({ output: 'base64uri', full: true, scale: 1.5, bg: '#ffffff' }),
  }));

  // create / destroy the instance per scenario
  useEffect(() => {
    const headless = isJsdom();
    const cy = cytoscape({
      container: headless ? undefined : el.current,
      headless,
      elements: toElements(scenario),
      style: GRAPH_STYLE,
      // 'preset' keeps the authored node positions (the default 'null' layout would zero them)
      layout: { name: 'preset' },
      minZoom: 0.3,
      maxZoom: 2.5,
      wheelSensitivity: 0.2,
    });
    cyRef.current = cy;
    cy.on('tap', 'node', (e) => onSelectRef.current({ kind: 'node', id: e.target.id() }));
    cy.on('tap', 'edge', (e) => { const t = e.target.data('txnId'); if (t) onSelectRef.current({ kind: 'txn', id: t }); });
    cy.on('tap', (e) => { if (e.target === cy) onSelectRef.current(null); });
    return () => { cy.destroy(); cyRef.current = null; };
  }, [scenario]);

  // layout (falls back when fixture positions are missing)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    let name = layout;
    if (name === 'preset' && !hasPositions(scenario)) {
      console.warn(`Scenario ${scenario.id} has no node positions; using the force layout instead.`);
      name = 'cose';
    }
    cy.layout(layoutOptions(name)).run();
  }, [layout, scenario]);

  // external selection → highlight
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().removeClass('picked');
    if (!selection) return;
    if (selection.kind === 'node') cy.getElementById(selection.id).addClass('picked');
    else if (selection.kind === 'txn') cy.edges().filter((e) => e.data('txnId') === selection.id).addClass('picked');
  }, [selection, scenario]);

  // replay overlay (muted transactions)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().removeClass('muted');
    if (mutedTxnIds.length) cy.edges().filter((e) => mutedTxnIds.includes(e.data('txnId'))).addClass('muted');
  }, [mutedTxnIds, scenario]);

  return <div ref={el} data-graph-canvas style={{ height }} className="w-full rounded-md bg-white" role="img" aria-label={`Money-flow graph for ${scenario.title}`} />;
});
