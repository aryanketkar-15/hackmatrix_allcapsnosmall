import { useMemo } from 'react';
import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { Card, CardHeader } from '../ui';
import { formatBytes } from '../../lib/format';
import { generateEvidenceDoc } from '../../lib/evidenceDocs';
import { downloadText } from '../../lib/csv';
import type { AlertT, ScenarioT } from '../../types/contract';

const ICON = { JSON: FileJson, CSV: FileSpreadsheet, TXT: FileText };
const TITLE: Record<string, string> = {
  system_logs: 'Transaction Logs', login_logs: 'Employee Login Logs', account_state: 'Account State History', mfa_logs: 'MFA Logs', auth_records: 'Authorization Records',
};

export function DocumentList({ alert, scenario }: { alert: AlertT; scenario: ScenarioT }) {
  const docs = useMemo(() => scenario.documents.map((d) => ({ d, g: generateEvidenceDoc(d, alert, scenario) })), [alert, scenario]);
  return (
    <Card>
      <CardHeader title="Evidence Documents" />
      {docs.length === 0 ? <p className="px-4 pb-4 text-xs text-muted">No documents for this alert.</p> : (
        <ul className="divide-y divide-line px-4 pb-2" aria-label="Evidence documents">
          {docs.map(({ d, g }) => {
            const Icon = ICON[d.kind];
            return (
              <li key={d.id} className="flex items-center gap-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded bg-blue-50 text-primary"><Icon size={16} aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">{TITLE[d.generator] ?? 'Evidence file'}</p>
                  <p className="truncate text-[11px] text-muted">{d.name}</p>
                </div>
                <span className="text-[11px] tabular-nums text-muted" data-testid={`size-${d.id}`}>{formatBytes(g.bytes)}</span>
                <button type="button" aria-label={`Download ${d.name}`} className="rounded p-1.5 text-primary hover:bg-primary-soft" onClick={() => downloadText(g.name, g.text, g.mime)}>
                  <Download size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="px-4 pb-3 text-[11px] text-muted">Files are generated from scripted scenario data (synthetic; phone numbers are masked).</p>
    </Card>
  );
}
