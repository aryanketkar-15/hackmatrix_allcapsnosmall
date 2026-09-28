import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, Chip } from '../ui';
import { ROLE_LABEL, ROLE_STYLE, headlineText, matchVariant } from './matchVariant';
import { PRECOMPUTED_LABEL, REPLAY_SEMANTICS } from '../../lib/statements';
import { useStore } from '../../data/store';
import type { ReplayT } from '../../types/contract';

export function RemovePanel({ alertId, replay }: { alertId: string; replay: ReplayT }) {
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [removed, setRemoved] = useState<string[]>([]);
  const keepOverlay = useRef(false); // set when the user asks to view the cascade on the timeline
  const head = headlineText(replay);
  const hs = ROLE_STYLE[head.role];

  const variant = useMemo(() => matchVariant(replay.variants, removed), [replay.variants, removed]);

  // drive the timeline / graph overlay; clear it when leaving
  useEffect(() => { dispatch({ type: 'SET_OVERLAY', ids: variant?.cascadeEventIds ?? [] }); }, [variant, dispatch]);
  useEffect(() => () => { if (!keepOverlay.current) dispatch({ type: 'SET_OVERLAY', ids: [] }); }, [dispatch]);

  const toggle = (id: string) => setRemoved((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const label = (id: string) => replay.candidates.find((c) => c.id === id)?.label ?? id;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4" style={{ borderColor: hs.fg, backgroundColor: hs.bg }} role="status" data-testid="replay-banner">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={26} style={{ color: hs.fg }} aria-hidden />
          <div>
            <p className="text-base font-bold tracking-wide" style={{ color: hs.fg }}>{ROLE_LABEL[head.role].toUpperCase()}</p>
            <p className="text-sm text-ink">{head.text}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader title="Analysis Steps" action={<Chip fg="#92400e" bg="#fef3c7" className="!normal-case">{PRECOMPUTED_LABEL}</Chip>} />
          <ol className="space-y-3 px-4 pb-4">
            {replay.steps.map((s, i) => (
              <li key={s.title} className="flex gap-3 text-xs">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-semibold text-dep" aria-hidden>{i + 1}</span>
                <div><p className="font-medium">{s.title}</p><p className="text-muted">{s.detail}</p></div>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <CardHeader
            title="Try removing other actions"
            action={<Button variant="ghost" size="sm" icon={<RotateCcw size={12} />} onClick={() => setRemoved([])} disabled={removed.length === 0}>Reset</Button>}
          />
          <fieldset className="space-y-1.5 px-4 pb-2">
            <legend className="sr-only">Candidate employee actions to remove</legend>
            {replay.candidates.map((c) => {
              const st = ROLE_STYLE[c.role];
              return (
                <label key={c.id} className="flex cursor-pointer items-center gap-2.5 rounded border border-line px-3 py-2 text-xs hover:bg-page">
                  <input type="checkbox" checked={removed.includes(c.id)} onChange={() => toggle(c.id)} />
                  <span className="flex-1">{c.label}</span>
                  <Chip fg={st.fg} bg={st.bg} className="!normal-case">{ROLE_LABEL[c.role]}</Chip>
                </label>
              );
            })}
          </fieldset>
          <div className="px-4 pb-4 pt-2 text-xs" aria-live="polite" data-testid="replay-outcome">
            {removed.length === 0 ? (
              <p className="text-muted">Tick one or more actions to replay the recorded path without them.</p>
            ) : !variant ? (
              <p className="rounded bg-slate-100 px-3 py-2 text-slate-700">This combination is not precomputed in the prototype.</p>
            ) : (
              <div className="space-y-1.5">
                <p className={`rounded px-3 py-2 font-semibold ${variant.outcome === 'FAIL' ? 'bg-red-50 text-risk-high' : 'bg-slate-100 text-slate-800'}`}>
                  Without {removed.map(label).join(' + ')}: the recorded path {variant.outcome === 'FAIL' ? 'FAILS (cannot execute)' : 'still PASSES (executes)'}.
                </p>
                <p className="text-muted">{variant.cascadeEventIds.length} recorded event{variant.cascadeEventIds.length === 1 ? '' : 's'} would not happen (cascade, greyed on the Timeline).</p>
                <button type="button" className="text-primary underline" onClick={() => { keepOverlay.current = true; navigate(`/alerts/${alertId}/timeline`); }}>View cascade on the timeline</button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-4 text-xs">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <p className="mb-1 font-semibold">Minimal disabling sets</p>
            <ul className="space-y-0.5 text-muted">
              {replay.disablingSets.map((s) => <li key={s.join('+')}>{'{'} {s.map(label).join(' + ')} {'}'}</li>)}
            </ul>
          </div>
          <div>
            <p className="mb-1 font-semibold">Replay coverage</p>
            <p className="text-muted">{replay.coverage.modelled} of {replay.coverage.applicable} applicable controls modelled · {replay.coverage.status === 'FULL' ? 'full' : 'partial'}</p>
          </div>
          <div>
            <p className="mb-1 font-semibold">Target</p>
            <p className="text-muted">{replay.targetLabel}</p>
          </div>
        </div>
        <p className="mt-3 border-t border-line pt-2 text-muted" data-testid="replay-semantics">{REPLAY_SEMANTICS}</p>
      </Card>
    </div>
  );
}
