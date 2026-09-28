import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dataReady, renderAt } from '../../test/renderApp';
import { readCore, readScenario } from '../../test/fixtures';
import { generateEvidenceDoc } from '../../lib/evidenceDocs';
import { ControlPath, controlVerdict } from './ControlPath';
import { formatBytes } from '../../lib/format';

const core = readCore();

describe('Evidence tab', () => {
  it('shows the five summary rows with the right statuses for the hero alert', async () => {
    renderAt('/alerts/ALT-2024-001/evidence');
    await dataReady();
    const expected: Record<string, string> = {
      'customer-request': 'Not Found', 'employee-authorization': 'Missing', 'mfa-verification': 'Tainted', 'system-logs': 'Available', 'video-evidence': 'Not Available',
    };
    for (const [k, v] of Object.entries(expected)) expect(await screen.findByTestId(`ev-${k}`)).toHaveTextContent(v);
    expect(screen.getByTestId('missing-list')).toHaveTextContent('Video Evidence');
  });

  it('flags MFA and the cooling period as PASS · HOLLOW with their reasons', async () => {
    renderAt('/alerts/ALT-2024-001/evidence');
    await dataReady();
    const mfa = await screen.findByTestId('ctl-ctl-mfa');
    expect(mfa).toHaveTextContent('PASS · HOLLOW');
    expect(mfa).toHaveTextContent('number set by E17');
    expect(screen.getByTestId('ctl-ctl-cooldown')).toHaveTextContent('PASS · HOLLOW');
    expect(screen.getByTestId('ctl-ctl-benef')).toHaveTextContent('PASS · Genuine');
  });

  it('twin control rows are PASS · Genuine', () => {
    render(<ControlPath controls={readScenario('S1T').controls} onSelectEvent={() => {}} />);
    expect(screen.getAllByText('PASS · Genuine')).toHaveLength(2);
    expect(screen.queryByText(/HOLLOW/)).not.toBeInTheDocument();
  });

  it('shows integrity-unknown with Grade U text for the data-gap alert', async () => {
    renderAt('/alerts/ALT-2024-005/evidence');
    await dataReady();
    const row = await screen.findByTestId('ctl-ctl-mfa');
    expect(row).toHaveTextContent('integrity unknown');
    expect(row).toHaveTextContent('Authorization data unavailable (Grade U)');
  });

  it('shows "Control held" when a control failed (near-miss)', async () => {
    renderAt('/alerts/ALT-2024-006/evidence');
    await dataReady();
    expect(await screen.findByTestId('ctl-ctl-mfa')).toHaveTextContent('Control held');
    expect(controlVerdict(readScenario('S6').controls[0]).label).toBe('Control held');
  });

  it('clicking a reason selects the writer event and opens the timeline', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/alerts/ALT-2024-001/evidence');
    await dataReady();
    await user.click(await screen.findByRole('button', { name: /OTP delivered to a number set by E17/ }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/alerts/ALT-2024-001/timeline'));
    await waitFor(() => expect(screen.getByTestId('tl-ev-mobile')).toHaveAttribute('aria-current', 'true'));
  });

  it('every alert has a populated evidence panel (incl. Explained and Inconclusive)', () => {
    for (const a of core.alerts) {
      expect(a.evidenceSummary.length).toBeGreaterThan(0);
      if (a.detailLevel === 'FULL') expect(readScenario(a.scenarioId!).evidenceSummary.length).toBeGreaterThan(0);
    }
    expect(new Set(core.alerts.map((a) => a.level))).toEqual(new Set(['HIGH', 'MEDIUM', 'WATCH', 'NEAR_MISS', 'DATA_GAP', 'INFO']));
  });

  it('summary alerts show the summary only, with a note about the control path', async () => {
    const summary = core.alerts.find((a) => a.detailLevel === 'SUMMARY')!;
    renderAt(`/alerts/${summary.id}/evidence`);
    await dataReady();
    expect(await screen.findByText('Evidence Summary')).toBeInTheDocument();
    expect(screen.getByText(/available for scenario alerts/)).toBeInTheDocument();
    expect(screen.queryByText('Control Path')).not.toBeInTheDocument();
  });

  it('documents are deterministic, synthetic, free of raw phone numbers, and the size is the real byte size', () => {
    const s = readScenario('S1');
    const alert = core.alerts.find((a) => a.id === 'ALT-2024-001')!;
    for (const d of s.documents) {
      const a = generateEvidenceDoc(d, alert, s);
      const b = generateEvidenceDoc(d, alert, s);
      expect(a.text).toBe(b.text);
      expect(a.bytes).toBe(new Blob([a.text]).size);
      expect(a.text).not.toMatch(/(?<!\d)\d{10}(?!\d)/);
    }
    expect(generateEvidenceDoc(s.documents[0], alert, s).text).toContain('"synthetic": true');
  });

  it('downloads a document whose displayed size equals its byte size', async () => {
    const user = userEvent.setup();
    let saved: Blob | undefined;
    (URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL = (b) => { saved = b; return 'blob:x'; };
    (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => {};
    renderAt('/alerts/ALT-2024-001/evidence');
    await dataReady();
    await user.click(await screen.findByRole('button', { name: 'Download system_logs_20240430.json' }));
    expect(saved).toBeDefined();
    expect(screen.getByTestId('size-d1')).toHaveTextContent(formatBytes(saved!.size));
  });

  it('explains Tainted and Hollow in a glossary tooltip', async () => {
    renderAt('/alerts/ALT-2024-001/evidence');
    await dataReady();
    await screen.findByText('Control Path');
    fireEvent.focus(screen.getByLabelText(/Tainted/, { selector: 'span' }));
    expect(within(document.body).getAllByRole('tooltip', { hidden: true }).some((t) => /passed on a tainted input/.test(t.textContent ?? ''))).toBe(true);
  });
});
