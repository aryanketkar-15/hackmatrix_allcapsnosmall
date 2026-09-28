import { useEffect, useRef, useState } from 'react';
import { Logo, Table, Td, Th, Tr, Chip } from '../ui';
import { MoneyGraph, type MoneyGraphHandle } from '../graph/MoneyGraph';
import { Timeline } from '../timeline/Timeline';
import { GradeBadge } from '../evidence/GradeBadge';
import { controlVerdict } from '../evidence/ControlPath';
import { EVIDENCE_LABEL } from '../evidence/EvidenceSummary';
import { ROLE_LABEL } from '../replay/matchVariant';
import { formatBytes, formatDateTimeIST, formatInr } from '../../lib/format';
import { generateEvidenceDoc } from '../../lib/evidenceDocs';
import { deriveAlertFacts } from '../../lib/metrics';
import { NO_INTENT_STATEMENT, PRECOMPUTED_LABEL } from '../../lib/statements';
import { LEVEL_LABEL, TYPE_LABEL, type AlertT, type EmployeeT, type ScenarioT } from '../../types/contract';
import type { SectionId } from './reportModel';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="break-inside-avoid border-t border-line py-4" aria-label={title}><h3 className="mb-2 text-sm font-semibold">{title}</h3>{children}</section>;
}

/** Tries a real PNG snapshot of the graph; falls back to a plain edge table if the capture fails. */
function GraphSection({ scenario }: { scenario: ScenarioT }) {
  const handle = useRef<MoneyGraphHandle>(null);
  const [img, setImg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const url = handle.current?.png();
        if (url) setImg(url); else setFailed(true);
      } catch { setFailed(true); }
    }, 400);
    return () => clearTimeout(t);
  }, [scenario]);

  if (failed) {
    return (
      <div data-testid="edge-table-fallback">
        <p className="mb-1 text-[11px] text-muted">Graph snapshot unavailable; showing the transfers as a table.</p>
        <Table label="Transfers">
          <thead><tr><Th>ID</Th><Th>From → To</Th><Th>Amount</Th><Th>Time</Th><Th>Loop</Th></tr></thead>
          <tbody>{scenario.transactions.map((t) => <Tr key={t.id}><Td>{t.id}</Td><Td>{t.from} → {t.to}</Td><Td>{formatInr(t.amount)}</Td><Td>{formatDateTimeIST(t.at)}</Td><Td>{t.cycle ? 'Yes' : ''}</Td></Tr>)}</tbody>
        </Table>
      </div>
    );
  }
  if (img) return <img src={img} alt="Money-flow graph snapshot" className="max-h-80 w-full object-contain" />;
  return <MoneyGraph ref={handle} scenario={scenario} layout="preset" selection={null} onSelect={() => {}} height={300} />;
}

export function ReportPreview({ alert, scenario, sections, employees, asOf, period }: {
  alert: AlertT; scenario: ScenarioT | null; sections: SectionId[]; employees: EmployeeT[]; asOf: string; period: { from: string; to: string };
}) {
  const has = (s: SectionId) => sections.includes(s);
  const f = scenario ? deriveAlertFacts(scenario) : alert.listFacts;
  return (
    <article className="print-area rounded-lg border border-line bg-surface p-6" aria-label="Report preview" data-testid="report-preview">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <Logo size="sm" />
          <h2 className="mt-1 text-lg font-semibold">Investigation Report</h2>
          <p className="text-xs text-muted">{alert.id} · {alert.title}</p>
          <p className="text-xs text-muted">Generated {formatDateTimeIST(asOf)}{period.from || period.to ? ` · period ${period.from || '…'} to ${period.to || '…'}` : ''}</p>
        </div>
        <Chip fg="#92400e" bg="#fef3c7" className="!normal-case">Prototype · scripted scenario data</Chip>
      </header>

      {has('summary') ? (
        <Section title="Alert Summary">
          <p className="mb-2 text-sm">{alert.summary}</p>
          <dl className="grid grid-cols-[10rem_1fr] gap-y-1 text-xs">
            <dt className="text-muted">Risk level</dt><dd>{LEVEL_LABEL[alert.level]} (evidence confidence: {alert.evidenceConfidence.toLowerCase()})</dd>
            <dt className="text-muted">Type</dt><dd>{TYPE_LABEL[alert.type]}</dd>
            <dt className="text-muted">Amount at risk</dt><dd>{formatInr(f.amountAtRisk)}</dd>
            <dt className="text-muted">Transactions</dt><dd>{f.transactionsCount} · {formatDateTimeIST(f.firstTxnAt)} to {formatDateTimeIST(f.lastTxnAt)}</dd>
          </dl>
          <ul className="ml-4 mt-2 list-disc text-xs">{alert.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </Section>
      ) : null}

      {has('graph') && scenario ? <Section title="Transaction Graph"><GraphSection scenario={scenario} /></Section> : null}
      {has('timeline') && scenario ? <Section title="Timeline"><Timeline entries={scenario.timeline} selection={null} onSelect={() => {}} /></Section> : null}

      {has('employee') && scenario ? (
        <Section title="Employee Activity">
          {scenario.insiders.length === 0 ? <p className="text-xs text-muted">No employee is linked to this alert.</p> : scenario.insiders.map((i) => (
            <div key={i.employeeId} className="mb-3 text-xs">
              <p className="font-medium">{i.employeeId} · {employees.find((e) => e.id === i.employeeId)?.name} — signals {i.signals.join(', ') || 'none'}; attribution {i.attribution}</p>
              <p className="text-muted">{i.attributionNote}</p>
              <ul className="ml-4 list-disc">{i.actions.map((a) => <li key={a.at + a.action}>{formatDateTimeIST(a.at)} · {a.action} on {a.account} (permitted: {a.permitted ? 'yes' : 'no'}, in portfolio: {a.inPortfolio ? 'yes' : 'no'}, evidence Grade {a.evidenceGrade})</li>)}</ul>
            </div>
          ))}
        </Section>
      ) : null}

      {has('evidence') ? (
        <Section title="Evidence & Authorization">
          <ul className="mb-2 text-xs">{(scenario?.evidenceSummary ?? alert.evidenceSummary).map((i) => <li key={i.key}><strong>{i.label}</strong>: {EVIDENCE_LABEL[i.status]} — {i.detail}</li>)}</ul>
          {scenario && scenario.controls.length ? (
            <Table label="Control path in report">
              <thead><tr><Th>Control</Th><Th>Result</Th><Th>Why</Th><Th>Grade</Th></tr></thead>
              <tbody>{scenario.controls.map((c) => <Tr key={c.id}><Td>{c.name}</Td><Td>{controlVerdict(c).label}</Td><Td>{c.reason}</Td><Td><GradeBadge grade={c.writerGrade} /></Td></Tr>)}</tbody>
            </Table>
          ) : null}
        </Section>
      ) : null}

      {has('butfor') && scenario ? (
        <Section title="But-for Analysis">
          <p className="mb-1 text-[11px] font-medium text-amber-800">{PRECOMPUTED_LABEL}</p>
          {scenario.replay ? (
            <ul className="text-xs">{scenario.replay.candidates.map((c) => <li key={c.id}>{c.label}: <strong>{ROLE_LABEL[c.role]}</strong></li>)}</ul>
          ) : <p className="text-xs text-muted">No replay for this alert.</p>}
          {scenario.reach.length ? <p className="mt-1 text-xs">Exposure: {scenario.reach.length} other accounts in a similar state (scenario values).</p> : null}
        </Section>
      ) : null}

      {has('documents') && scenario ? (
        <Section title="Supporting Documents">
          <ul className="text-xs">{scenario.documents.map((d) => <li key={d.id}>{d.name} · {formatBytes(generateEvidenceDoc(d, alert, scenario).bytes)}</li>)}</ul>
        </Section>
      ) : null}

      <footer className="border-t border-line pt-3 text-[11px] text-muted">
        <p className="font-medium text-ink" data-testid="report-statement">{NO_INTENT_STATEMENT}</p>
        <p>Replay and exposure results are precomputed in this prototype. Evaluation is pending.</p>
      </footer>
    </article>
  );
}
