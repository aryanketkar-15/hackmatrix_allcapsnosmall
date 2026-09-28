import { generateEvidenceDoc } from '../../lib/evidenceDocs';
import { sha256Hex } from '../../lib/hash';
import { deriveAlertFacts } from '../../lib/metrics';
import { NO_INTENT_STATEMENT, PRECOMPUTED_LABEL } from '../../lib/statements';
import type { AlertT, EmployeeT, ScenarioT } from '../../types/contract';

export const SECTIONS = [
  { id: 'summary', label: 'Alert Summary', needsScenario: false },
  { id: 'graph', label: 'Transaction Graph', needsScenario: true },
  { id: 'timeline', label: 'Timeline', needsScenario: true },
  { id: 'employee', label: 'Employee Activity', needsScenario: true },
  { id: 'evidence', label: 'Evidence & Authorization', needsScenario: false },
  { id: 'butfor', label: 'But-for Analysis', needsScenario: true },
  { id: 'documents', label: 'Supporting Documents', needsScenario: true },
] as const;
export type SectionId = (typeof SECTIONS)[number]['id'];

/** Data of each report section. Pure and deterministic (no clock, no randomness). */
export async function buildSectionData(id: SectionId, alert: AlertT, scenario: ScenarioT | null, employees: EmployeeT[]): Promise<unknown> {
  const facts = scenario ? deriveAlertFacts(scenario) : alert.listFacts;
  switch (id) {
    case 'summary':
      return {
        alertId: alert.id, title: alert.title, level: alert.level, type: alert.type, status: alert.status, createdAt: alert.createdAt,
        assignedTo: alert.assignedTo, summary: alert.summary, reasons: alert.reasons, riskIndicators: alert.riskIndicators,
        evidenceConfidence: alert.evidenceConfidence, facts,
      };
    case 'graph':
      return scenario && {
        nodes: scenario.nodes.map((n) => ({ id: n.id, kind: n.kind, label: n.label })),
        transfers: scenario.transactions.map((t) => ({ id: t.id, from: t.from, to: t.to, amount: t.amount, at: t.at, cycle: t.cycle, outcome: t.outcome })),
        connections: scenario.connections,
      };
    case 'timeline':
      return scenario && scenario.timeline.map((e) => ({ id: e.id, at: e.at, category: e.category, title: e.title, detail: e.detail, gap: e.gap ?? false }));
    case 'employee':
      return scenario && scenario.insiders.map((i) => ({
        employeeId: i.employeeId, name: employees.find((e) => e.id === i.employeeId)?.name ?? null, signals: i.signals, attribution: i.attribution,
        attributionNote: i.attributionNote, staffWithSamePermission: i.staffWithSamePermission, actions: i.actions,
      }));
    case 'evidence':
      return { summary: scenario?.evidenceSummary ?? alert.evidenceSummary, controls: scenario?.controls ?? [] };
    case 'butfor':
      return scenario && {
        label: PRECOMPUTED_LABEL,
        replay: scenario.replay && { targetLabel: scenario.replay.targetLabel, roles: scenario.replay.candidates.map((c) => ({ id: c.id, label: c.label, role: c.role })), disablingSets: scenario.replay.disablingSets, coverage: scenario.replay.coverage },
        reach: scenario.reach,
        twin: scenario.twinOf ? scenario.twinOf : null,
      };
    case 'documents':
      return scenario && await Promise.all(scenario.documents.map(async (d) => {
        const g = generateEvidenceDoc(d, alert, scenario);
        return { name: d.name, kind: d.kind, bytes: g.bytes, sha256: await sha256Hex(g.text) };
      }));
  }
}

export const reportHeader = (alert: AlertT, asOf: string, type: string, period: { from: string; to: string }, sections: SectionId[]) => ({
  product: 'KHOJI', reportType: type, alertId: alert.id, generatedAt: asOf, period, sections,
  statement: NO_INTENT_STATEMENT, notice: 'Prototype · scripted scenario data. Replay and exposure results are precomputed.',
});

export const reportFilename = (alertId: string, asOf: string) => `KHOJI_report_${alertId}_${asOf.slice(0, 10).replace(/-/g, '')}.json`;
