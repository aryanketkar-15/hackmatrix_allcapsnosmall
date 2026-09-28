import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileDown, Printer } from 'lucide-react';
import { useReady } from '../data/store';
import { Button, Card, CardHeader, DateRangeInput, Select } from '../components/ui';
import { ReportPreview } from '../components/reports/ReportPreview';
import { VerifyPack } from '../components/reports/VerifyPack';
import { SECTIONS, buildSectionData, reportFilename, reportHeader, type SectionId } from '../components/reports/reportModel';
import { buildPack, type EvidencePack } from '../lib/hash';
import { downloadText } from '../lib/csv';
import { stableStringify } from '../lib/stableStringify';
import type { AlertT, ScenarioT } from '../types/contract';

interface Generated { alert: AlertT; scenario: ScenarioT | null; sections: SectionId[]; pack: EvidencePack; period: { from: string; to: string } }

export default function Reports() {
  const { alerts, core, asOf, ensureScenario } = useReady();
  const employees = core.employees;
  const [params] = useSearchParams();
  const [alertId, setAlertId] = useState(params.get('alert') ?? '');
  const [type, setType] = useState('Investigation Report');
  const [range, setRange] = useState<[string, string]>(['', '']);
  const [picked, setPicked] = useState<SectionId[]>(SECTIONS.map((s) => s.id));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<Generated | null>(null);

  const ordered = [...alerts].sort((a, b) => Number(b.detailLevel === 'FULL') - Number(a.detailLevel === 'FULL') || a.id.localeCompare(b.id));

  async function generate() {
    setError('');
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) { setError('Select an alert to report on.'); return; }
    if (picked.length === 0) { setError('Choose at least one section.'); return; }
    setBusy(true);
    try {
      const scenario = alert.detailLevel === 'FULL' && alert.scenarioId ? await ensureScenario(alert.scenarioId) : null;
      const chosen = SECTIONS.filter((s) => picked.includes(s.id) && (!s.needsScenario || scenario)).map((s) => s.id);
      const sections = [];
      for (const id of chosen) sections.push({ name: id, content: await buildSectionData(id, alert, scenario, employees) });
      const pack = await buildPack(reportHeader(alert, asOf, type, { from: range[0], to: range[1] }, chosen), sections);
      setOut({ alert, scenario, sections: chosen, pack, period: { from: range[0], to: range[1] } });
    } finally { setBusy(false); }
  }

  const toggle = (id: SectionId) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Reports &amp; Export</h1>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[22rem_1fr]">
        <div className="no-print space-y-5">
          <Card>
            <CardHeader title="Generate Report" />
            <div className="space-y-3 px-4 pb-4 text-xs">
              <label className="block"><span className="mb-1 block font-medium">Report Type</span>
                <Select label="Report Type" value={type} onChange={(e) => setType(e.target.value)} className="!h-9 w-full"><option>Investigation Report</option><option>Alert Summary</option></Select></label>
              <label className="block"><span className="mb-1 block font-medium">Alert</span>
                <Select label="Alert" value={alertId} onChange={(e) => setAlertId(e.target.value)} className="!h-9 w-full">
                  <option value="">Select an alert…</option>
                  {ordered.map((a) => <option key={a.id} value={a.id}>{a.id} – {a.title}{a.detailLevel === 'FULL' ? ' (full)' : ''}</option>)}
                </Select></label>
              <div><span className="mb-1 block font-medium">Date range</span><DateRangeInput from={range[0]} to={range[1]} onChange={(f, t) => setRange([f, t])} /></div>
              <fieldset><legend className="mb-1 font-medium">Include</legend>
                <ul className="space-y-1">{SECTIONS.map((s) => (
                  <li key={s.id}><label className="flex items-center gap-2"><input type="checkbox" checked={picked.includes(s.id)} onChange={() => toggle(s.id)} />{s.label}</label></li>
                ))}</ul>
              </fieldset>
              {error ? <p role="alert" className="rounded bg-red-50 px-3 py-2 text-risk-high">{error}</p> : null}
              <Button className="w-full" onClick={generate} disabled={busy}>{busy ? 'Generating…' : 'Generate Report'}</Button>
            </div>
          </Card>
          <VerifyPack />
        </div>

        <div className="space-y-3">
          {out ? (
            <>
              <div className="no-print flex flex-wrap items-center gap-2">
                <Button icon={<FileDown size={14} />} onClick={() => downloadText(reportFilename(out.alert.id, asOf), stableStringify(out.pack, 2), 'application/json;charset=utf-8')}>Download evidence pack (JSON)</Button>
                <Button variant="secondary" icon={<Printer size={14} />} onClick={() => window.print()}>Print / Save as PDF</Button>
                <span className="text-[11px] text-muted" data-testid="manifest-hash">Manifest hash: {out.pack.manifest.manifestHash.slice(0, 16)}…</span>
              </div>
              <ReportPreview alert={out.alert} scenario={out.scenario} sections={out.sections} employees={employees} asOf={asOf} period={out.period} />
            </>
          ) : (
            <Card className="p-8 text-center text-sm text-muted">Choose an alert and press <strong>Generate Report</strong> to preview it. The downloadable pack carries a SHA-256 hash per section, chained into one manifest hash you can verify later.</Card>
          )}
        </div>
      </div>
    </div>
  );
}
