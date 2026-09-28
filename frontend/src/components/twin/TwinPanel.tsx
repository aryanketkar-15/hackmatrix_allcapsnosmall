import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader, Chip, EmptyState, LevelChip } from '../ui';
import { GradeBadge } from '../evidence/GradeBadge';
import { findDivergence } from './findDivergence';
import { useStore } from '../../data/store';
import type { PathStepT, ScenarioT } from '../../types/contract';

const INTEGRITY_STYLE = { GENUINE: ['#166534', '#dcfce7', 'Genuine'], HOLLOW: ['#9a3412', '#ffedd5', 'Hollow'], UNKNOWN: ['#374151', '#e5e7eb', 'Unknown'] } as const;

/** Resolve the (attack, twin) pair for a scenario, loading the small scenario files on demand. */
export function useTwinPair(scenario: ScenarioT | null): { attack: ScenarioT; twin: ScenarioT } | null | undefined {
  const { state, ensureScenario } = useStore();
  useEffect(() => {
    state.core?.scenarios.forEach((e) => { if (!state.scenarios[e.id]) ensureScenario(e.id).catch(() => {}); });
  }, [state.core, state.scenarios, ensureScenario]);
  if (!scenario) return null;
  const all = Object.values(state.scenarios);
  const loadedAll = state.core ? all.length === state.core.scenarios.length : false;
  const attack = scenario.twinOf ? state.scenarios[scenario.twinOf] : scenario;
  const twin = scenario.twinOf ? scenario : all.find((s) => s.twinOf === scenario.id);
  if (attack && twin) return { attack, twin };
  return loadedAll ? null : undefined;
}

function Column({ title, s, steps, other, diverge }: { title: string; s: ScenarioT; steps: PathStepT[]; other: PathStepT[]; diverge: number | null }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h4 className="text-sm font-semibold">{title}</h4><LevelChip level={s.level} />
      </div>
      <ol className="space-y-2" aria-label={title}>
        {Array.from({ length: Math.max(steps.length, other.length) }).map((_, i) => {
          const st = steps[i];
          const isDiv = diverge === i;
          if (!st) return <li key={i} className="rounded-md border border-dashed border-line p-3 text-xs text-muted">(no such step)</li>;
          const [fg, bg, label] = INTEGRITY_STYLE[st.integrity];
          return (
            <li key={st.key} data-testid={`${s.id}-step-${i}`} className={`rounded-md border p-3 text-xs ${isDiv ? 'border-amber-400 bg-amber-50' : 'border-line bg-surface'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{i + 1}. {st.label}</span>
                <span className="flex items-center gap-1.5"><GradeBadge grade={st.grade} /><Chip fg={fg} bg={bg} className="!normal-case">{label}</Chip></span>
              </div>
              <p className="mt-1 text-muted">{st.artifact}</p>
              {isDiv ? <p className="mt-1 text-[11px] font-semibold text-amber-800">Divergence point</p> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function TwinPanel({ scenario }: { scenario: ScenarioT | null }) {
  const pair = useTwinPair(scenario);
  if (pair === undefined) return <Card><p className="p-6 text-sm text-muted">Loading the legitimate twin…</p></Card>;
  if (!pair) return <Card><EmptyState title="No legitimate twin for this scenario" hint="Twins exist for the circular-transfer, splitting and profile-mismatch scenarios." /></Card>;

  const { attack, twin } = pair;
  const div = findDivergence(attack.pathSteps, twin.pathSteps);
  return (
    <div className="space-y-4">
      <Card className="p-4 text-sm">
        <p className="mb-1 font-semibold">Same look, different authorization</p>
        {div ? (
          <p data-testid="divergence" className="flex flex-wrap items-center gap-1.5 text-xs">
            First difference at step {div.index + 1} ({div.label}):
            <span className="rounded bg-red-50 px-1.5 py-0.5 text-risk-high">{div.attack}</span>
            <ArrowRight size={12} aria-hidden />
            <span className="rounded bg-green-50 px-1.5 py-0.5 text-green-800">{div.legitimate}</span>
          </p>
        ) : <p className="text-xs text-muted">The two paths are identical.</p>}
        {twin.explanation ? <p className="mt-2 text-xs text-muted">Why the twin is explained: {twin.explanation}</p> : null}
      </Card>
      <Card>
        <CardHeader title="Recorded path vs legitimate twin" />
        <div className="grid grid-cols-1 gap-5 px-4 pb-4 xl:grid-cols-2">
          <Column title="Recorded path" s={attack} steps={attack.pathSteps} other={twin.pathSteps} diverge={div?.index ?? null} />
          <Column title="Legitimate twin" s={twin} steps={twin.pathSteps} other={attack.pathSteps} diverge={div?.index ?? null} />
        </div>
      </Card>
    </div>
  );
}
