import { render, screen, waitFor } from '@testing-library/react';
import { createApiLoader, createFixtureLoader, type FetchLike } from './loader';
import { StoreProvider } from './store';
import { DataGate } from '../components/layout/DataGate';
import { FallbackBanner } from '../components/ui';
import { fsFetch, readCore } from '../test/fixtures';

const apiUp: FetchLike = async (url) => {
  const m = /\/api\/(core|metrics|scenarios\/(\w+))/.exec(url);
  if (!m) return { ok: false, status: 404, json: async () => null };
  const path = m[1] === 'core' ? 'core.json' : m[1] === 'metrics' ? 'metrics.json' : `scenarios/${m[2].toLowerCase()}.json`;
  return fsFetch(`/fixtures/${path}`);
};
const apiDown: FetchLike = async () => { throw new Error('connect ECONNREFUSED'); };

describe('API data source', () => {
  it('reads core, metrics and scenarios from the API when it is up', async () => {
    const seen: string[] = [];
    const spy: FetchLike = (u) => { seen.push(u); return apiUp(u); };
    const fb = vi.fn();
    const l = createApiLoader(spy, 'http://localhost:8000/', createFixtureLoader(fsFetch), fb);
    expect((await l.loadCore()).alerts).toHaveLength(124);
    await l.loadMetrics();
    await l.loadScenario('scenarios/s1.json');
    expect(seen).toEqual(['http://localhost:8000/api/core', 'http://localhost:8000/api/metrics', 'http://localhost:8000/api/scenarios/s1']);
    expect(fb).not.toHaveBeenCalled();
  });

  it('falls back to the bundled fixtures when the API is down and reports why', async () => {
    const fb = vi.fn();
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const l = createApiLoader(apiDown, 'http://localhost:8000', createFixtureLoader(fsFetch), fb);
    expect((await l.loadCore()).alerts).toHaveLength(124);
    expect(fb).toHaveBeenCalledWith(expect.stringContaining('ECONNREFUSED'));
    err.mockRestore();
  });

  it('falls back and logs when the API returns invalid data', async () => {
    const bad = readCore();
    (bad.alerts[0] as unknown as { level: string }).level = 'CRITICAL';
    const invalid: FetchLike = async () => ({ ok: true, status: 200, json: async () => bad });
    const fb = vi.fn();
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const l = createApiLoader(invalid, 'http://x', createFixtureLoader(fsFetch), fb);
    expect((await l.loadCore()).alerts[0].level).not.toBe('CRITICAL');
    expect(fb).toHaveBeenCalledWith(expect.stringContaining('alerts.0.level'));
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });

  it('scenario ids are URL-encoded so they cannot alter the request path', async () => {
    const seen: string[] = [];
    const spy: FetchLike = async (u) => { seen.push(u); return { ok: false, status: 404, json: async () => null }; };
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const l = createApiLoader(spy, 'http://x', createFixtureLoader(fsFetch), () => {});
    await l.loadScenario('scenarios/s1.json').catch(() => {});
    await l.loadScenario('scenarios/..%2Fevil.json').catch(() => {});
    expect(seen[1]).toBe('http://x/api/scenarios/..%252Fevil');
    err.mockRestore();
  });

  it('shows the offline-fixtures banner in the UI when the API is down, and still shows data', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const make = (onFallback: (r: string) => void) => createApiLoader(apiDown, 'http://x', createFixtureLoader(fsFetch), onFallback);
    render(
      <StoreProvider makeLoader={make}>
        <FallbackBanner />
        <DataGate><p>data shown</p></DataGate>
      </StoreProvider>,
    );
    await waitFor(() => expect(screen.getByText('data shown')).toBeInTheDocument());
    expect(screen.getByTestId('fallback-banner')).toHaveTextContent('Using offline fixtures');
    err.mockRestore();
  });

  it('fixtures mode never shows the banner and makes no API calls', async () => {
    const calls: string[] = [];
    const counting: FetchLike = (u) => { calls.push(u); return fsFetch(u); };
    render(
      <StoreProvider loader={createFixtureLoader(counting)}>
        <FallbackBanner />
        <DataGate><p>ok</p></DataGate>
      </StoreProvider>,
    );
    await waitFor(() => expect(screen.getByText('ok')).toBeInTheDocument());
    expect(screen.queryByTestId('fallback-banner')).not.toBeInTheDocument();
    expect(calls.every((c) => c.startsWith('/fixtures/'))).toBe(true);
  });
});
