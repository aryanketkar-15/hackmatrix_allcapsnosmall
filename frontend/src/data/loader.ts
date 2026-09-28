import type { ZodType } from 'zod';
import { CoreFile, MetricsFile, Scenario, type CoreFileT, type MetricsFileT, type ScenarioT } from '../types/contract';

export class FixtureError extends Error {
  constructor(public file: string, message: string) {
    super(`${file}: ${message}`);
    this.name = 'FixtureError';
  }
}

export type FetchLike = (url: string) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

export interface Loader {
  loadCore(): Promise<CoreFileT>;
  loadMetrics(): Promise<MetricsFileT>;
  loadScenario(file: string): Promise<ScenarioT>;
}

/** Reads `VITE_DATA_SOURCE` ("fixtures" by default). The API mode is layered on top in M7.2. */
export const dataSource = (): 'fixtures' | 'api' =>
  (import.meta.env.VITE_DATA_SOURCE as string | undefined) === 'api' ? 'api' : 'fixtures';

async function fetchValidated<T>(fetcher: FetchLike, url: string, name: string, schema: ZodType<T>): Promise<T> {
  let res;
  try {
    res = await fetcher(url);
  } catch (e) {
    throw new FixtureError(name, `could not be loaded (${e instanceof Error ? e.message : 'network error'})`);
  }
  if (!res.ok) {
    throw new FixtureError(name, res.status === 404 ? 'Fixture not found (404)' : `request failed with status ${res.status}`);
  }
  let raw: unknown;
  try {
    raw = await res.json();
  } catch {
    throw new FixtureError(name, 'is not valid JSON');
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new FixtureError(name, `invalid data at "${issue.path.join('.') || '(root)'}": ${issue.message}`);
  }
  return parsed.data;
}

export function createFixtureLoader(fetcher: FetchLike = (u) => fetch(u), base = '/fixtures'): Loader {
  const cache = new Map<string, Promise<ScenarioT>>();
  return {
    loadCore: () => fetchValidated(fetcher, `${base}/core.json`, 'core.json', CoreFile),
    loadMetrics: () => fetchValidated(fetcher, `${base}/metrics.json`, 'metrics.json', MetricsFile),
    loadScenario(file: string) {
      let p = cache.get(file);
      if (!p) {
        p = fetchValidated(fetcher, `${base}/${file}`, file, Scenario);
        p.catch(() => cache.delete(file)); // do not cache failures
        cache.set(file, p);
      }
      return p;
    },
  };
}

/**
 * API mode: read from the fixture API, validating every response with the same zod schemas. On any failure (network,
 * status, invalid data) fall back to the bundled fixtures and tell the UI so it can show an "offline fixtures" banner.
 */
export function createApiLoader(fetcher: FetchLike, apiBase: string, fallback: Loader, onFallback: (reason: string) => void): Loader {
  const base = apiBase.replace(/\/+$/, '');
  async function viaApi<T>(url: string, name: string, schema: ZodType<T>, alt: () => Promise<T>): Promise<T> {
    try {
      return await fetchValidated(fetcher, url, name, schema);
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      console.error(`API unavailable for ${name}; using bundled fixtures. ${reason}`);
      onFallback(reason);
      return alt();
    }
  }
  return {
    loadCore: () => viaApi(`${base}/api/core`, 'core (API)', CoreFile, () => fallback.loadCore()),
    loadMetrics: () => viaApi(`${base}/api/metrics`, 'metrics (API)', MetricsFile, () => fallback.loadMetrics()),
    loadScenario: (file) => {
      const id = file.replace(/^.*\//, '').replace(/\.json$/, '');
      return viaApi(`${base}/api/scenarios/${encodeURIComponent(id)}`, `${id} (API)`, Scenario, () => fallback.loadScenario(file));
    },
  };
}

/** Loader for the current data source. `fixtures` (default) never touches the network beyond static files. */
export function createDefaultLoader(onFallback: (reason: string) => void): Loader {
  const fixtures = createFixtureLoader();
  if (dataSource() !== 'api') return fixtures;
  const base = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8000';
  return createApiLoader((u) => fetch(u), base, fixtures, onFallback);
}
