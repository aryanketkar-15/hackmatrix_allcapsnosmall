import { Card, CardHeader, EmptyState } from '../ui';
import { topPatterns } from '../../lib/metrics';
import { stagger } from '../../lib/motion';
import { TYPE_LABEL, type AlertT } from '../../types/contract';

export function TopPatterns({ alerts }: { alerts: AlertT[] }) {
  const rows = topPatterns(alerts, 7);
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <Card>
      <CardHeader title="Top Patterns Detected" />
      {rows.length === 0 ? <EmptyState title="No patterns yet" /> : (
        <ul className="space-y-2.5 px-4 pb-4 pt-1">
          {rows.map((r, i) => (
            <li key={r.type} className="grid animate-fade-in grid-cols-[11rem_1fr_1.5rem] items-center gap-2 text-xs" style={stagger(i, 60)}>
              <span className="truncate text-ink">{TYPE_LABEL[r.type]}</span>
              <span className="h-2 overflow-hidden rounded-full bg-page" aria-hidden>
                <span className="block h-full origin-left animate-grow-x rounded-full bg-primary" style={{ width: `${(r.count / max) * 100}%`, ...stagger(i, 60) }} />
              </span>
              <span className="text-right font-medium tabular-nums" data-testid={`pattern-${r.type}`}>{r.count}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
