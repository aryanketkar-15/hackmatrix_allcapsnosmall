import { Hourglass } from 'lucide-react';
import { Card, CardHeader, ErrorPanel, Table, Td, Th, Tr } from '../ui';
import type { MetricsFileT } from '../../types/contract';

/**
 * Honest evaluation plan. Values are shown ONLY when the metrics file says MEASURED; while pending every value cell is an em dash.
 */
export function EvaluationPanel({ metrics }: { metrics: MetricsFileT }) {
  if (metrics.status !== 'PENDING_EVALUATION' && metrics.status !== 'MEASURED') {
    return <ErrorPanel title="Unknown evaluation status" message={`The metrics file has an unrecognised status: ${String((metrics as { status: unknown }).status)}.`} />;
  }
  const measured = metrics.status === 'MEASURED';
  const value = (id: string) => (measured && metrics.values && id in metrics.values ? String(metrics.values[id]) : '—');

  return (
    <div className="space-y-4">
      <div role="status" className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900" data-testid="eval-banner">
        <Hourglass size={18} className="mt-0.5" aria-hidden />
        <div>
          <p className="font-semibold">{measured ? 'Measured results' : 'Evaluation pending'}</p>
          <p className="text-xs">{measured
            ? 'Values below were produced by the evaluation runner on held-out scenarios.'
            : 'Results are produced in the next build phase. This page lists what will be measured (detection accuracy and false-positive rate on suspicious and legitimate scenarios) and what it will be compared with. No result exists yet.'}</p>
        </div>
      </div>

      <Card>
        <CardHeader title="What will be measured" />
        <Table label="Metric definitions">
          <thead><tr><Th>Metric</Th><Th>Definition</Th><Th className="text-right">Value</Th></tr></thead>
          <tbody>
            {metrics.definitions.map((d) => (
              <Tr key={d.id}>
                <Td className="whitespace-nowrap font-medium">{d.name}</Td>
                <Td className="text-muted">{d.description}</Td>
                <Td className="text-right tabular-nums" data-testid={`value-${d.id}`}>{value(d.id)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Baselines to compare against" />
          <ul className="divide-y divide-line px-4 pb-2 text-xs" aria-label="Baselines">
            {metrics.baselines.map((b) => <li key={b.id} className="py-2"><span className="font-semibold">{b.id} · {b.name}</span><p className="text-muted">{b.description}</p></li>)}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Ablations" />
          <ul className="divide-y divide-line px-4 pb-2 text-xs" aria-label="Ablations">
            {metrics.ablations.map((a) => <li key={a.id} className="py-2">{a.id} · KHOJI {a.name}</li>)}
          </ul>
          <p className="px-4 pb-3 text-[11px] text-muted">Each addition is expected to improve its target metric. This is a hypothesis to be validated, not a result.</p>
        </Card>
      </div>
    </div>
  );
}
