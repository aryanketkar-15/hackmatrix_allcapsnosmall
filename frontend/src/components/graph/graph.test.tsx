import { fireEvent, render, screen } from '@testing-library/react';
import { StoreProvider } from '../../data/store';
import { readScenario, testLoader } from '../../test/fixtures';
import { layoutOptions, toElements, hasPositions } from './toElements';
import { MoneyGraph } from './MoneyGraph';
import { GraphTab } from './GraphTab';
import { readCore } from '../../test/fixtures';

const s1 = readScenario('S1');

describe('toElements', () => {
  const els = toElements(s1);
  const nodes = els.filter((e) => e.group === 'nodes');
  const edges = els.filter((e) => e.group === 'edges');
  it('maps 3 accounts, employees, 2 beneficiaries and the transfer edges', () => {
    expect(nodes.filter((n) => n.classes === 'account')).toHaveLength(3);
    expect(nodes.filter((n) => n.classes === 'employee')).toHaveLength(2);
    expect(nodes.filter((n) => n.classes === 'beneficiary')).toHaveLength(2);
    // T1 (FD closure) has no node as its source, so 6 transfer edges are drawn
    expect(edges.filter((e) => /^edge-/.test(String(e.data.id)))).toHaveLength(6);
  });
  it('marks the loop edges with the cycle class', () => {
    const cycleTxns = edges.filter((e) => e.classes?.includes('cycle')).map((e) => e.data.txnId).sort();
    expect(cycleTxns).toEqual(['T2', 'T3', 'T5', 'T6']);
  });
  it('adds dashed employee-link edges with a connection-type label', () => {
    const links = edges.filter((e) => e.classes?.includes('link'));
    expect(links.length).toBe(s1.connections.length);
    expect(links.map((l) => l.data.label)).toContain('State dependency');
  });
  it('labels account nodes with a rupee balance', () => {
    expect(nodes.find((n) => n.data.id === 'A-001')!.data.label).toBe('A\n₹4,20,000');
  });
  it('detects missing positions and offers three layouts', () => {
    expect(hasPositions(s1)).toBe(true);
    expect(hasPositions({ ...s1, nodes: [{ ...s1.nodes[0], x: NaN }] })).toBe(false);
    expect(layoutOptions('preset').name).toBe('preset');
    expect(layoutOptions('cose').name).toBe('cose');
    expect(layoutOptions('circle').name).toBe('circle');
  });
  it('maps every scenario without dangling edges', () => {
    for (const id of ['S1', 'S1T', 'S2', 'S2T', 'S3', 'S3T', 'S4', 'S5', 'S6']) {
      const sc = readScenario(id);
      const ids = new Set(toElements(sc).filter((e) => e.group === 'nodes').map((e) => e.data.id));
      for (const e of toElements(sc).filter((x) => x.group === 'edges')) {
        expect(ids.has(e.data.source)).toBe(true);
        expect(ids.has(e.data.target)).toBe(true);
      }
    }
  });
});

describe('MoneyGraph component', () => {
  it('mounts and unmounts repeatedly without leaving canvases behind', () => {
    for (let i = 0; i < 5; i += 1) {
      const { unmount } = render(<MoneyGraph scenario={s1} layout="preset" selection={null} onSelect={() => {}} />);
      expect(document.querySelectorAll('[data-graph-canvas]')).toHaveLength(1);
      unmount();
    }
    expect(document.querySelectorAll('[data-graph-canvas]')).toHaveLength(0);
  });
  it('survives switching layouts', () => {
    const { rerender } = render(<MoneyGraph scenario={s1} layout="preset" selection={null} onSelect={() => {}} />);
    for (const l of ['cose', 'circle', 'preset'] as const) rerender(<MoneyGraph scenario={s1} layout={l} selection={null} onSelect={() => {}} />);
  });
  it('falls back to the force layout and warns when positions are missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<MoneyGraph scenario={{ ...s1, nodes: s1.nodes.map((n) => ({ ...n, x: NaN })) }} layout="preset" selection={null} onSelect={() => {}} />);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('GraphTab', () => {
  const alert = readCore().alerts.find((a) => a.id === 'ALT-2024-001')!;
  const wrap = (ui: React.ReactNode) => render(<StoreProvider loader={testLoader()}>{ui}</StoreProvider>);
  it('renders the toolbar, legend and layout switching', () => {
    wrap(<GraphTab alert={alert} scenario={s1} />);
    expect(screen.getByLabelText('Layout')).toHaveValue('preset');
    fireEvent.change(screen.getByLabelText('Layout'), { target: { value: 'circle' } });
    expect(screen.getByLabelText('Layout')).toHaveValue('circle');
    expect(screen.getByRole('list', { name: 'Graph legend' })).toHaveTextContent('Beneficiary');
  });
  it('disables fullscreen (without throwing) when the API is unsupported', () => {
    const orig = document.documentElement.requestFullscreen;
    (document.documentElement as unknown as { requestFullscreen?: unknown }).requestFullscreen = undefined;
    wrap(<GraphTab alert={alert} scenario={s1} />);
    expect(screen.getByRole('button', { name: 'Fullscreen' })).toBeDisabled();
    (document.documentElement as unknown as { requestFullscreen?: unknown }).requestFullscreen = orig;
  });
  it('labels the explained sweep twin in the graph tab', () => {
    const s4 = readScenario('S4');
    const a4 = readCore().alerts.find((a) => a.id === 'ALT-2024-004')!;
    wrap(<GraphTab alert={a4} scenario={s4} />);
    expect(screen.getByText(/labelled Explained/)).toBeInTheDocument();
  });
});
