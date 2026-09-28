import { CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader } from '../ui';
import type { EvidenceSummaryItemT } from '../../types/contract';

export const EVIDENCE_LABEL: Record<EvidenceSummaryItemT['status'], string> = {
  FOUND: 'Found', NOT_FOUND: 'Not Found', MISSING: 'Missing', TAINTED: 'Tainted', AVAILABLE: 'Available', NOT_AVAILABLE: 'Not Available',
};
const GOOD = new Set(['FOUND', 'AVAILABLE']);

export function EvidenceSummary({ items }: { items: EvidenceSummaryItemT[] }) {
  return (
    <Card>
      <CardHeader title="Evidence Summary" />
      <ul className="divide-y divide-line px-4 pb-2" aria-label="Evidence summary">
        {items.map((i) => {
          const good = GOOD.has(i.status);
          return (
            <li key={i.key} className="flex items-start gap-3 py-2.5" data-testid={`ev-${i.key}`}>
              {good ? <CheckCircle2 size={18} className="mt-0.5 text-risk-explained" aria-hidden /> : <XCircle size={18} className={`mt-0.5 ${i.status === 'TAINTED' ? 'text-risk-medium' : 'text-risk-high'}`} aria-hidden />}
              <div className="min-w-0">
                <p className="text-xs">
                  <span className="font-semibold">{i.label}</span>{' '}
                  <span className={`font-semibold ${good ? 'text-risk-explained' : i.status === 'TAINTED' ? 'text-risk-medium' : 'text-risk-high'}`}>{EVIDENCE_LABEL[i.status]}</span>
                </p>
                <p className="text-xs text-muted">{i.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
