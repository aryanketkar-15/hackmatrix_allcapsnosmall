import type { AlertT, EvidenceDocumentT, ScenarioT } from '../types/contract';

export interface GeneratedDoc { name: string; mime: string; text: string; bytes: number }

const MIME = { JSON: 'application/json;charset=utf-8', CSV: 'text/csv;charset=utf-8', TXT: 'text/plain;charset=utf-8' } as const;

const csvEscape = (v: unknown) => {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Deterministic, synthetic evidence documents built from the scenario (no clock, no randomness, masked data only).
 * Size shown in the UI is the real byte size of the generated file.
 */
export function generateEvidenceDoc(doc: EvidenceDocumentT, alert: AlertT, s: ScenarioT): GeneratedDoc {
  const header = { synthetic: true, note: 'Scripted scenario data. Not a real bank record.', alertId: alert.id, scenario: s.id };
  let text: string;

  switch (doc.generator) {
    case 'system_logs':
      text = JSON.stringify({ ...header, events: s.timeline.map((e) => ({ id: e.id, at: e.at, category: e.category, title: e.title, detail: e.detail })), transactions: s.transactions }, null, 2);
      break;
    case 'login_logs': {
      const rows = s.timeline.filter((e) => e.category === 'EMPLOYEE_ACTIVITY');
      text = ['at,credential,event,detail', ...rows.map((e) => [e.at, e.actorId, e.title, e.detail].map(csvEscape).join(','))].join('\r\n') + '\r\n';
      break;
    }
    case 'account_state':
      text = JSON.stringify({ ...header, stateWrites: s.timeline.filter((e) => e.category === 'ACCOUNT_STATE_CHANGE').map((e) => ({ id: e.id, at: e.at, writer: e.actorId ?? 'customer', title: e.title, detail: e.detail })) }, null, 2);
      break;
    case 'mfa_logs':
      text = JSON.stringify({ ...header, controlEvaluations: s.controls.map((c) => ({ control: c.name, outcome: c.outcome, integrity: c.integrity, reason: c.reason, writerGrade: c.writerGrade })), controlEvents: s.timeline.filter((e) => e.category === 'CONTROL_CHECK').map((e) => ({ id: e.id, at: e.at, title: e.title, gap: e.gap ?? false })) }, null, 2);
      break;
    default: // auth_records and anything else
      text = [
        'KHOJI evidence: authorization records (synthetic)',
        `Alert: ${alert.id}    Scenario: ${s.id}`,
        '',
        ...s.evidenceSummary.map((i) => `- ${i.label}: ${i.status} - ${i.detail}`),
        '',
        'Authorization grades of state writes:',
        ...s.controls.filter((c) => c.writerGrade).map((c) => `- ${c.name}: Grade ${c.writerGrade}`),
        '',
      ].join('\r\n');
  }

  const bytes = new TextEncoder().encode(text).length;
  return { name: doc.name, mime: MIME[doc.kind], text, bytes };
}
