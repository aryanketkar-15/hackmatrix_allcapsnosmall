import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { dataReady, renderAt } from '../../test/renderApp';
import { readCore, readScenario } from '../../test/fixtures';
import { AccessRightsPanel } from './AccessRightsPanel';
import { SIGNALS } from './signalDefinitions';
import { SIGNAL_IDS } from '../../types/contract';

const core = readCore();
const e17 = core.employees.find((e) => e.id === 'E17')!;
const BANNED = /\b(guilty|culprit|fraudster|criminal|thief)\b/i;

describe('Employee Activity tab', () => {
  it('shows E17 with recent activities including the mobile change and beneficiary add', async () => {
    renderAt('/alerts/ALT-2024-001/employee');
    await dataReady();
    const table = await screen.findByRole('table', { name: 'Recent activities' });
    expect(within(table).getByText('Changed mobile number')).toBeInTheDocument();
    expect(within(table).getByText('Added beneficiary')).toBeInTheDocument();
    expect(screen.getByText('Rohit Kumar')).toBeInTheDocument();
  });

  it('shows P1, P2, P3 and P9 chips with definitions as tooltips', async () => {
    renderAt('/alerts/ALT-2024-001/employee');
    await dataReady();
    const list = await screen.findByRole('list', { name: 'Misuse signals' });
    for (const s of ['P1', 'P2', 'P3', 'P9']) {
      expect(within(list).getByText(new RegExp(`^${s} ·`))).toBeInTheDocument();
    }
    expect(within(list).getAllByRole('tooltip', { hidden: true })).toHaveLength(4);
    expect(list.textContent).not.toContain('P8');
  });

  it('shows valid-but-misused access: permitted yes, in portfolio no, evidence Grade X', async () => {
    renderAt('/alerts/ALT-2024-001/employee');
    await dataReady();
    const table = await screen.findByRole('table', { name: 'Actions in this case' });
    const row = within(table).getByText('Changed mobile number').closest('tr')!;
    expect(row).toHaveTextContent('✓ Yes');
    expect(row).toHaveTextContent('✗ No');
    expect(row).toHaveTextContent('Grade X');
    expect(screen.getByTestId('who-else')).toHaveTextContent('7 staff hold the same permission');
  });

  it('switches to E22 and shows the onboarding actions', async () => {
    const user = userEvent.setup();
    renderAt('/alerts/ALT-2024-001/employee');
    await dataReady();
    await user.click(await screen.findByRole('tab', { name: /E22/ }));
    const table = screen.getByRole('table', { name: 'Actions in this case' });
    expect(within(table).getAllByText('Opened account')).toHaveLength(2);
  });

  it('uses "credential misuse indicators" wording and low attribution when flagged', () => {
    const insider = { ...readScenario('S1').insiders[0], credentialMisuseIndicators: true, attribution: 'LOW' as const };
    render(<AccessRightsPanel employee={e17} insider={insider} />);
    expect(screen.getByText(/Credential misuse indicators present/)).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('says attendance data is unavailable when it is missing (S5)', () => {
    const s5 = readScenario('S5');
    render(<AccessRightsPanel employee={core.employees.find((e) => e.id === 'E23')!} insider={s5.insiders[0]} />);
    expect(screen.getByText(/Attendance data unavailable/)).toBeInTheDocument();
  });

  it('defines all ten signals without accusatory language', () => {
    for (const id of SIGNAL_IDS) {
      expect(SIGNALS[id].definition.length).toBeGreaterThan(10);
      expect(`${SIGNALS[id].short} ${SIGNALS[id].definition}`).not.toMatch(BANNED);
    }
  });

  it('View All Activity expands the table', async () => {
    renderAt('/alerts/ALT-2024-001/employee');
    await dataReady();
    const table = await screen.findByRole('table', { name: 'Recent activities' });
    const before = within(table).getAllByRole('row').length;
    fireEvent.click(screen.getByText('View All Activity'));
    await waitFor(() => expect(within(screen.getByRole('table', { name: 'Recent activities' })).getAllByRole('row').length).toBeGreaterThan(before));
  });

  it('is disabled with an explanation for SUMMARY alerts', async () => {
    const summary = core.alerts.find((a) => a.detailLevel === 'SUMMARY')!;
    renderAt(`/alerts/${summary.id}/employee`);
    await dataReady();
    expect(screen.getByRole('tab', { name: 'Employee Activity' })).toBeDisabled();
    expect(screen.getByText('Not available for this alert')).toBeInTheDocument();
  });

  it('shows an empty state for alerts with no linked employee (S4 sweep)', async () => {
    renderAt('/alerts/ALT-2024-004/employee');
    await dataReady();
    expect(await screen.findByText('No employee is linked to this alert')).toBeInTheDocument();
  });
});
