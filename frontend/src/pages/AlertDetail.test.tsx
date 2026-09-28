import { screen, waitFor, within } from '@testing-library/react';
import { dataReady, renderAt } from '../test/renderApp';
import { readCore, readScenario } from '../test/fixtures';
import { deriveAlertFacts } from '../lib/metrics';

const core = readCore();
const BANNED = /\b(guilty|culprit|fraudster|criminal|thief)\b/i;

describe('Alert detail: overview', () => {
  it('shows the hero facts derived from the scenario', async () => {
    renderAt('/alerts/ALT-2024-001/overview');
    await dataReady();
    await waitFor(() => expect(screen.getByText('Total Amount', { selector: 'dt' }).nextElementSibling).toHaveTextContent('₹29,80,000'));
    const dd = (label: string) => screen.getByText(label, { selector: 'dt' }).nextElementSibling!.textContent;
    expect([dd('Accounts Involved'), dd('Employees Involved'), dd('Transactions')]).toEqual(['3', '2', '7']);
    expect(dd('First Transaction')).toBe('Apr 30, 2024, 09:12');
    expect(dd('Last Transaction')).toBe('Apr 30, 2024, 10:45');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ALT-2024-001 – Circular transfer with employee link');
  });

  it('derived facts equal listFacts for every FULL alert', () => {
    for (const a of core.alerts.filter((x) => x.detailLevel === 'FULL')) {
      expect(deriveAlertFacts(readScenario(a.scenarioId!))).toEqual(a.listFacts);
    }
  });

  it('never shows a numeric risk score and always states no intent', async () => {
    for (const id of ['ALT-2024-001', 'ALT-2024-004', 'ALT-2024-005', 'ALT-2024-006', 'ALT-2024-020']) {
      const { unmount } = renderAt(`/alerts/${id}/overview`);
      await dataReady();
      await waitFor(() => expect(screen.getByTestId('no-intent')).toHaveTextContent('No finding of intent'));
      expect(document.body.textContent).not.toMatch(/Risk Score|\/100/);
      unmount();
    }
  });

  it('shows a risk level chip with reasons instead of a score', async () => {
    renderAt('/alerts/ALT-2024-001/overview');
    await dataReady();
    expect(screen.getByRole('list', { name: 'Reasons' }).querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('High').length).toBeGreaterThan(0);
  });

  it('redirects a bogus tab to overview and shows not-found for unknown alerts', async () => {
    const { router, unmount } = renderAt('/alerts/ALT-2024-001/bogus');
    await dataReady();
    await waitFor(() => expect(router.state.location.pathname).toBe('/alerts/ALT-2024-001/overview'));
    unmount();
    renderAt('/alerts/NOPE/overview');
    await dataReady();
    expect(screen.getByText(/could not find that alert/i)).toBeInTheDocument();
  });

  it('gates SUMMARY alerts to overview, evidence and notes', async () => {
    const summary = core.alerts.find((a) => a.detailLevel === 'SUMMARY')!;
    renderAt(`/alerts/${summary.id}/timeline`);
    await dataReady();
    const enabled = screen.getAllByRole('tab').filter((t) => !(t as HTMLButtonElement).disabled).map((t) => t.textContent);
    expect(enabled).toEqual(['Overview', 'Evidence', 'Notes']);
    expect(screen.getByText('Not available for this alert')).toBeInTheDocument();
  });

  it('has no accusatory language on any level', async () => {
    for (const a of core.alerts) {
      expect(`${a.title} ${a.summary} ${a.reasons.join(' ')}`).not.toMatch(BANNED);
    }
  });

  it('lists related entities with View links for FULL alerts', async () => {
    renderAt('/alerts/ALT-2024-001/overview');
    await dataReady();
    const card = screen.getByText('Related Entities').closest('div')!.parentElement!;
    expect(within(card).getAllByText('View').length).toBeGreaterThanOrEqual(4);
  });
});
