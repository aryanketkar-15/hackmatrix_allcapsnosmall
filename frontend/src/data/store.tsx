import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { AlertT, CaseT, CoreFileT, MetricsFileT, NoteT, ScenarioT } from '../types/contract';
import { createFixtureLoader, type Loader } from './loader';

export interface Selection { kind: 'txn' | 'event' | 'node'; id: string }
export interface ActivityEntry { id: string; alertId: string; at: string; actor: string; text: string }

export interface StoreState {
  phase: 'loading' | 'ready' | 'error';
  error: string | null;
  core: CoreFileT | null;
  metrics: MetricsFileT | null;
  scenarios: Record<string, ScenarioT>;
  alerts: AlertT[];
  cases: CaseT[];
  notes: NoteT[];
  activity: ActivityEntry[];
  selection: Selection | null;
  overlay: string[];
}

export const initialState: StoreState = {
  phase: 'loading', error: null, core: null, metrics: null, scenarios: {}, alerts: [], cases: [], notes: [],
  activity: [], selection: null, overlay: [],
};

export type Action =
  | { type: 'LOADED'; core: CoreFileT; metrics: MetricsFileT }
  | { type: 'ERROR'; message: string }
  | { type: 'SCENARIO_LOADED'; scenario: ScenarioT }
  | { type: 'SELECT'; selection: Selection | null }
  | { type: 'SET_OVERLAY'; ids: string[] }
  | { type: 'UPDATE_ALERT'; id: string; patch: Partial<AlertT> }
  | { type: 'UPSERT_CASE'; case: CaseT }
  | { type: 'ADD_NOTE'; note: NoteT }
  | { type: 'LOG'; entry: ActivityEntry };

/** Pure reducer: never mutates the previous state. */
export function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'LOADED':
      return { ...state, phase: 'ready', error: null, core: action.core, metrics: action.metrics, alerts: action.core.alerts, cases: action.core.cases };
    case 'ERROR':
      return { ...state, phase: 'error', error: action.message };
    case 'SCENARIO_LOADED':
      return { ...state, scenarios: { ...state.scenarios, [action.scenario.id]: action.scenario } };
    case 'SELECT':
      return { ...state, selection: action.selection };
    case 'SET_OVERLAY':
      return { ...state, overlay: action.ids };
    case 'UPDATE_ALERT':
      return { ...state, alerts: state.alerts.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a)) };
    case 'UPSERT_CASE': {
      const exists = state.cases.some((c) => c.id === action.case.id);
      return { ...state, cases: exists ? state.cases.map((c) => (c.id === action.case.id ? action.case : c)) : [...state.cases, action.case] };
    }
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.note] };
    case 'LOG':
      return { ...state, activity: [...state.activity, action.entry] };
    default:
      return state;
  }
}

interface StoreApi {
  state: StoreState;
  dispatch: (a: Action) => void;
  loader: Loader;
  /** Lazily loads (and caches) the scenario that backs a FULL alert. */
  ensureScenario: (scenarioId: string) => Promise<ScenarioT | null>;
}

const Ctx = createContext<StoreApi | null>(null);

export function StoreProvider({ children, loader }: { children: ReactNode; loader?: Loader }) {
  const ldr = useMemo(() => loader ?? createFixtureLoader(), [loader]);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let cancelled = false;
    Promise.all([ldr.loadCore(), ldr.loadMetrics()])
      .then(([core, metrics]) => { if (!cancelled) dispatch({ type: 'LOADED', core, metrics }); })
      .catch((e: unknown) => { if (!cancelled) dispatch({ type: 'ERROR', message: e instanceof Error ? e.message : 'Unknown error' }); });
    return () => { cancelled = true; };
  }, [ldr]);

  const ensureScenario = useCallback(async (scenarioId: string) => {
    if (state.scenarios[scenarioId]) return state.scenarios[scenarioId];
    const entry = state.core?.scenarios.find((s) => s.id === scenarioId);
    if (!entry) return null;
    const scenario = await ldr.loadScenario(entry.file);
    dispatch({ type: 'SCENARIO_LOADED', scenario });
    return scenario;
  }, [ldr, state.core, state.scenarios]);

  const value = useMemo(() => ({ state, dispatch, loader: ldr, ensureScenario }), [state, ldr, ensureScenario]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside <StoreProvider>');
  return v;
}

/** State once loaded. Only call below <DataGate>. */
export function useReady() {
  const { state, dispatch, ensureScenario } = useStore();
  if (state.phase !== 'ready' || !state.core || !state.metrics) throw new Error('Data not ready');
  return { ...state, core: state.core, metrics: state.metrics, asOf: state.core.meta.asOf, dispatch, ensureScenario };
}

/** Load a scenario by id; returns undefined while loading and null if it does not exist. */
export function useScenario(scenarioId: string | undefined): ScenarioT | null | undefined {
  const { state, ensureScenario } = useStore();
  const cached = scenarioId ? state.scenarios[scenarioId] : undefined;
  useEffect(() => {
    if (scenarioId && !cached) ensureScenario(scenarioId).catch(() => {});
  }, [scenarioId, cached, ensureScenario]);
  if (!scenarioId) return null;
  return cached;
}
