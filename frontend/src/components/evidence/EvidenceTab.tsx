import { Card, CardHeader } from '../ui';
import { EvidenceSummary, EVIDENCE_LABEL } from './EvidenceSummary';
import { ControlPath } from './ControlPath';
import { DocumentList } from './DocumentList';
import { useStore } from '../../data/store';
import type { TabViewProps } from '../alerts/tabViews';
import { useNavigate } from 'react-router-dom';

const CONF = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low', INSUFFICIENT: 'Insufficient' } as const;
const MISSING = new Set(['NOT_FOUND', 'MISSING', 'NOT_AVAILABLE']);

export function EvidenceTab({ alert, scenario }: TabViewProps) {
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const items = scenario?.evidenceSummary ?? alert.evidenceSummary;
  const missing = items.filter((i) => MISSING.has(i.status));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <EvidenceSummary items={items} />
        {scenario ? <DocumentList alert={alert} scenario={scenario} /> : (
          <Card>
            <CardHeader title="Evidence Documents" />
            <p className="px-4 pb-4 text-xs text-muted">Documents and the control path are available for scenario alerts in this prototype.</p>
          </Card>
        )}
      </div>

      <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-xs">
        <span>Evidence confidence: <strong data-testid="ev-confidence">{CONF[alert.evidenceConfidence]}</strong></span>
        <span className="text-muted">Confidence is the weakest critical link, and any single-source critical link caps an alert below High.</span>
        {missing.length ? (
          <span data-testid="missing-list">Missing evidence: {missing.map((m) => `${m.label} (${EVIDENCE_LABEL[m.status]})`).join(', ')}</span>
        ) : <span>No missing evidence.</span>}
      </Card>

      {scenario ? (
        <ControlPath
          controls={scenario.controls}
          onSelectEvent={(sel) => { dispatch({ type: 'SELECT', selection: sel }); navigate(`/alerts/${alert.id}/timeline`); }}
        />
      ) : null}
    </div>
  );
}
