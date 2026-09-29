import type { ElementDefinition, LayoutOptions } from 'cytoscape';
import { formatInr } from '../../lib/format';
import type { ScenarioT } from '../../types/contract';

export type GraphLayoutName = 'preset' | 'cose' | 'circle';

export const CONNECTION_LABEL: Record<string, string> = {
  STATE_DEPENDENCY: 'State dependency',
  APPROVAL: 'Approval',
  ONBOARDING: 'Onboarding',
  PROFILE_EDIT: 'Profile edit',
  INFRASTRUCTURE: 'Shared infrastructure',
};

export const hasPositions = (s: ScenarioT) => s.nodes.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y));

/** Pure mapping scenario → Cytoscape elements (testable without a canvas). */
export function toElements(s: ScenarioT): ElementDefinition[] {
  const ids = new Set(s.nodes.map((n) => n.id));
  const out: ElementDefinition[] = [];

  for (const n of s.nodes) {
    const second = n.kind === 'account' && n.balance !== undefined ? formatInr(n.balance) : n.sub ?? '';
    out.push({
      group: 'nodes',
      data: { id: n.id, kind: n.kind, name: n.label, label: second ? `${n.label}\n${second}` : n.label },
      position: { x: n.x * 1.7, y: n.y }, // x is stretched: the canvas is much wider than tall
      classes: n.kind,
    });
  }

  for (const t of s.transactions) {
    if (!ids.has(t.from) || !ids.has(t.to)) continue; // e.g. FD closure source is not a node
    out.push({
      group: 'edges',
      data: { id: `edge-${t.id}`, source: t.from, target: t.to, txnId: t.id, label: `${t.id}  ${formatInr(t.amount)}` },
      classes: [t.cycle ? 'cycle' : 'flow', t.outcome === 'BLOCKED' ? 'blocked' : ''].filter(Boolean).join(' '),
    });
  }

  // customer → their account(s) (faint ownership line)
  const customerNode = s.nodes.find((n) => n.kind === 'customer');
  if (customerNode) {
    for (const acc of s.victimAccountIds) {
      if (ids.has(acc)) out.push({ group: 'edges', data: { id: `own-${customerNode.id}-${acc}`, source: customerNode.id, target: acc }, classes: 'owner' });
    }
  }

  s.connections.forEach((c, i) => {
    if (!ids.has(c.credential) || !ids.has(c.targetNodeId)) return;
    out.push({
      group: 'edges',
      data: { id: `conn-${i}`, source: c.credential, target: c.targetNodeId, label: CONNECTION_LABEL[c.type] ?? c.type, connectionType: c.type },
      classes: c.strength === 'CONTEXT' ? 'link context' : 'link',
    });
  });

  return out;
}

/** `animate` glides nodes to their new positions when the layout is switched (off in tests and for reduced motion). */
export function layoutOptions(name: GraphLayoutName, animate = false): LayoutOptions {
  const motion = { animate, animationDuration: 550, animationEasing: 'ease-in-out-cubic' };
  switch (name) {
    case 'cose': return { name: 'cose', randomize: false, fit: true, padding: 40, ...motion } as LayoutOptions;
    case 'circle': return { name: 'circle', fit: true, padding: 40, ...motion } as LayoutOptions;
    default: return { name: 'preset', fit: true, padding: 40, ...motion } as LayoutOptions;
  }
}
