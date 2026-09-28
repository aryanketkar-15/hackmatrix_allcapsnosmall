import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dataReady, renderAt } from '../../test/renderApp';
import { readCore } from '../../test/fixtures';
import { ALERT_STATUSES } from '../../types/contract';
import { canTransition, nextStatuses, transitionError } from './caseMachine';

const core = readCore();
const newAlert = core.alerts.find((a) => a.status === 'NEW')!;
const closedAlert = core.alerts.find((a) => a.status === 'CLOSED')!;

describe('caseMachine', () => {
  it('allows the full happy path NEW → CLOSED', () => {
    const path = ['NEW', 'UNDER_REVIEW', 'ASSIGNED', 'INVESTIGATING', 'DECIDED', 'CLOSED'] as const;
    for (let i = 0; i < path.length - 1; i += 1) expect(canTransition(path[i], path[i + 1])).toBe(true);
  });
  it('blocks skipping steps with a helpful message', () => {
    expect(canTransition('NEW', 'DECIDED')).toBe(false);
    expect(transitionError('NEW', 'DECIDED')).toMatch(/cannot move from new to decided/);
    expect(transitionError('CLOSED', 'NEW')).toMatch(/closed/);
  });
  it('allows the INVESTIGATING ⇄ PENDING_EVIDENCE loop', () => {
    expect(canTransition('INVESTIGATING', 'PENDING_EVIDENCE')).toBe(true);
    expect(canTransition('PENDING_EVIDENCE', 'INVESTIGATING')).toBe(true);
  });
  it('closed is terminal and every status is defined', () => {
    expect(nextStatuses('CLOSED')).toEqual([]);
    for (const s of ALERT_STATUSES) expect(Array.isArray(nextStatuses(s))).toBe(true);
  });
});

async function assignFlow(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Assign / Reassign' }));
  await user.click(await screen.findByRole('button', { name: 'Assign' }));
}

describe('assign / reassign', () => {
  it('assigning an unassigned alert auto-creates exactly one case in ASSIGNED', async () => {
    const user = userEvent.setup();
    renderAt(`/alerts/${newAlert.id}/overview`);
    await dataReady();
    expect(screen.getByTestId('assigned-to')).toHaveTextContent('Unassigned');
    await assignFlow(user);
    await waitFor(() => expect(screen.getByTestId('assigned-to')).toHaveTextContent('Priya Sharma'));
    await user.click(screen.getByRole('tab', { name: 'Notes' }));
    const log = await screen.findByRole('list', { name: 'Activity log' });
    expect(log).toHaveTextContent(/CASE-\d{3} created and assigned to Priya Sharma/);
    expect(within(log).getAllByRole('listitem')).toHaveLength(1);
  });

  it('reassigning updates the assignee and logs it', async () => {
    const user = userEvent.setup();
    renderAt('/alerts/ALT-2024-001/overview');
    await dataReady();
    await user.click(await screen.findByRole('button', { name: 'Assign / Reassign' }));
    await user.selectOptions(await screen.findByLabelText('Investigator'), 'Raj Mehta');
    await user.click(screen.getByRole('button', { name: 'Reassign' }));
    await waitFor(() => expect(screen.getByTestId('assigned-to')).toHaveTextContent('Raj Mehta'));
    await user.click(screen.getByRole('tab', { name: 'Notes' }));
    expect(await screen.findByText(/Reassigned from Priya Sharma to Raj Mehta/)).toBeInTheDocument();
  });

  it('disables assignment for closed alerts', async () => {
    renderAt(`/alerts/${closedAlert.id}/overview`);
    await dataReady();
    expect(await screen.findByRole('button', { name: 'Assign / Reassign' })).toBeDisabled();
  });
});

describe('status and decisions', () => {
  it('walks the allowed transitions, blocking invalid ones', async () => {
    const user = userEvent.setup();
    renderAt('/alerts/ALT-2024-001/overview');
    await dataReady();
    const menu = await screen.findByLabelText('Change status');
    // INVESTIGATING → PENDING_EVIDENCE → INVESTIGATING (loop)
    await user.selectOptions(menu, 'PENDING_EVIDENCE');
    await waitFor(() => expect(screen.getAllByText('Pending Evidence').length).toBeGreaterThan(0));
    await user.selectOptions(screen.getByLabelText('Change status'), 'INVESTIGATING');
    await waitFor(() => expect(screen.getAllByText('Investigating').length).toBeGreaterThan(0));
    // only allowed moves are offered
    const options = within(screen.getByLabelText('Change status')).getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['Move to…', 'Pending Evidence', 'Record decision…']);
  });

  it('a decision requires a rationale', async () => {
    const user = userEvent.setup();
    renderAt('/alerts/ALT-2024-001/overview');
    await dataReady();
    await user.selectOptions(await screen.findByLabelText('Change status'), 'DECIDED');
    await user.click(await screen.findByRole('button', { name: 'Record decision' }));
    expect(await screen.findByText('A rationale is required.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Rationale'), 'Independent evidence found');
    await user.click(screen.getByRole('button', { name: 'Record decision' }));
    await waitFor(() => expect(screen.getAllByText('Decided').length).toBeGreaterThan(0));
    // decided → only CLOSED remains
    expect(within(screen.getByLabelText('Change status')).getAllByRole('option').map((o) => o.textContent)).toEqual(['Move to…', 'Closed']);
  });
});

describe('notes', () => {
  it('rejects empty notes, trims, and shows markup literally', async () => {
    const user = userEvent.setup();
    const { container } = renderAt('/alerts/ALT-2024-001/notes');
    await dataReady();
    await user.click(await screen.findByRole('button', { name: 'Add note' }));
    expect(await screen.findByText('A note cannot be empty.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Add a note'), '  <script>alert(1)</script> check  ');
    await user.click(screen.getByRole('button', { name: 'Add note' }));
    const list = await screen.findByRole('list', { name: 'Notes' });
    expect(list).toHaveTextContent('<script>alert(1)</script> check');
    expect(container.querySelector('script')).toBeNull();
  });

  it('caps the note length at 5000 characters', async () => {
    renderAt('/alerts/ALT-2024-001/notes');
    await dataReady();
    expect((await screen.findByLabelText('Add a note')).getAttribute('maxlength')).toBe('5000');
  });

  it('a page reload resets in-memory workflow state (documented prototype behaviour)', async () => {
    const user = userEvent.setup();
    const { unmount } = renderAt('/alerts/ALT-2024-001/notes');
    await dataReady();
    await user.type(await screen.findByLabelText('Add a note'), 'temporary');
    await user.click(screen.getByRole('button', { name: 'Add note' }));
    unmount();
    renderAt('/alerts/ALT-2024-001/notes');
    await dataReady();
    expect(await screen.findByText('No notes yet')).toBeInTheDocument();
  });
});

describe('Cases page', () => {
  it('shows computed KPI cards and 92 cases across pages', async () => {
    renderAt('/cases');
    await dataReady();
    const val = (label: string) => within(screen.getByTestId(`kpi-${label}`)).getByText(/^\d+$/).textContent;
    expect(val('Assigned')).toBe('12');
    expect(val('Investigating')).toBe('38');
    expect(val('Pending Evidence')).toBe('8');
    expect(val('Closed')).toBe('34');
    expect(screen.getByTestId('cases-showing')).toHaveTextContent('of 92 cases');
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeInTheDocument();
  });

  it('assigning updates the dashboard KPIs live (workflow ↔ dashboard link)', async () => {
    const user = userEvent.setup();
    const { router } = renderAt(`/alerts/${newAlert.id}/overview`);
    await dataReady();
    await assignFlow(user);
    await waitFor(() => expect(screen.getByTestId('assigned-to')).toHaveTextContent('Priya Sharma'));
    await router.navigate('/cases');
    await waitFor(() => expect(within(screen.getByTestId('kpi-Assigned')).getByText(/^\d+$/)).toHaveTextContent('13'));
  });

  it('Create Case opens a case for a chosen alert', async () => {
    const user = userEvent.setup();
    renderAt('/cases');
    await dataReady();
    await user.click(await screen.findByRole('button', { name: /Create Case/ }));
    await user.click(await screen.findByRole('button', { name: 'Create case' }));
    await waitFor(() => expect(screen.getByTestId('cases-showing')).toHaveTextContent('of 93 cases'));
  });
});
