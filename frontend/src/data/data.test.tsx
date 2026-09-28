import { render, screen, waitFor } from '@testing-library/react';
import { createFixtureLoader, type FetchLike } from './loader';
import { StoreProvider, initialState, reducer, useStore } from './store';
import { DataGate } from '../components/layout/DataGate';
import { ErrorBoundary } from '../components/ui';
import { fsFetch, readCore, testLoader } from '../test/fixtures';

describe('loader', () => {
  it('loads and validates the real core and metrics fixtures', async () => {
    const l = testLoader();
    const core = await l.loadCore();
    expect(core.alerts).toHaveLength(124);
    expect((await l.loadMetrics()).status).toBe('PENDING_EVALUATION');
  });

  it('reports the file and field for invalid data', async () => {
    const bad = readCore();
    (bad.alerts[0] as unknown as { level: string }).level = 'CRITICAL';
    const f: FetchLike = async () => ({ ok: true, status: 200, json: async () => bad });
    await expect(createFixtureLoader(f).loadCore()).rejects.toThrow(/core\.json: invalid data at "alerts\.0\.level"/);
  });

  it('reports a missing fixture clearly', async () => {
    const f: FetchLike = async () => ({ ok: false, status: 404, json: async () => null });
    await expect(createFixtureLoader(f).loadCore()).rejects.toThrow('Fixture not found (404)');
  });

  it('fetches a scenario once and caches it', async () => {
    let calls = 0;
    const counting: FetchLike = (u) => { calls += 1; return fsFetch(u); };
    const l = createFixtureLoader(counting);
    await l.loadScenario('scenarios/s1.json');
    await l.loadScenario('scenarios/s1.json');
    expect(calls).toBe(1);
  });

  it('does not cache failed scenario loads', async () => {
    let ok = false;
    const f: FetchLike = (u) => (ok ? fsFetch(u) : Promise.resolve({ ok: false, status: 500, json: async () => null }));
    const l = createFixtureLoader(f);
    await expect(l.loadScenario('scenarios/s1.json')).rejects.toThrow();
    ok = true;
    await expect(l.loadScenario('scenarios/s1.json')).resolves.toBeTruthy();
  });
});

describe('reducer', () => {
  it('never mutates the previous state', () => {
    const core = readCore();
    const loaded = reducer(initialState, { type: 'LOADED', core, metrics: { status: 'PENDING_EVALUATION', definitions: [], baselines: [], ablations: [] } });
    const snapshot = JSON.stringify(loaded);
    const next = reducer(loaded, { type: 'UPDATE_ALERT', id: 'ALT-2024-001', patch: { assignedTo: 'Raj Mehta' } });
    expect(JSON.stringify(loaded)).toBe(snapshot);
    expect(next.alerts.find((a) => a.id === 'ALT-2024-001')?.assignedTo).toBe('Raj Mehta');
    expect(loaded.alerts.find((a) => a.id === 'ALT-2024-001')?.assignedTo).toBe('Priya Sharma');
  });
});

function Probe() {
  const { state } = useStore();
  return <p>alerts:{state.alerts.length}</p>;
}

describe('DataGate', () => {
  it('shows loading then data', async () => {
    render(<StoreProvider loader={testLoader()}><DataGate><Probe /></DataGate></StoreProvider>);
    expect(screen.getByText('Loading scenario data…')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('alerts:124')).toBeInTheDocument());
  });

  it('shows a readable error panel when data cannot load', async () => {
    const f: FetchLike = async () => ({ ok: false, status: 404, json: async () => null });
    render(<StoreProvider loader={createFixtureLoader(f)}><DataGate><Probe /></DataGate></StoreProvider>);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/Fixture not found/));
  });
});

describe('ErrorBoundary', () => {
  it('contains a crashing child', () => {
    const Boom = () => { throw new Error('boom'); };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<div><p>shell</p><ErrorBoundary><Boom /></ErrorBoundary></div>);
    expect(screen.getByText('shell')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('boom');
    spy.mockRestore();
  });
});
