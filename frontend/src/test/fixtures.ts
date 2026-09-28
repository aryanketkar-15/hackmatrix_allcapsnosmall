import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createFixtureLoader, type FetchLike } from '../data/loader';
import type { CoreFileT, ScenarioT } from '../types/contract';

const ROOT = resolve(__dirname, '../../public/fixtures');

/** fetch() replacement that serves the real generated fixtures straight from disk. */
export const fsFetch: FetchLike = async (url) => {
  const path = url.replace(/^\/fixtures\//, '');
  try {
    const text = readFileSync(resolve(ROOT, path), 'utf-8');
    return { ok: true, status: 200, json: async () => JSON.parse(text) };
  } catch {
    return { ok: false, status: 404, json: async () => null };
  }
};

export const testLoader = () => createFixtureLoader(fsFetch);
export const readCore = (): CoreFileT => JSON.parse(readFileSync(resolve(ROOT, 'core.json'), 'utf-8'));
export const readScenario = (id: string): ScenarioT => JSON.parse(readFileSync(resolve(ROOT, `scenarios/${id.toLowerCase()}.json`), 'utf-8'));
