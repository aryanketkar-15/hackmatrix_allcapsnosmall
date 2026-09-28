import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dataReady, renderAt } from '../test/renderApp';
import { readCore, readScenario } from '../test/fixtures';

const scenarioIds = ['S1', 'S1T', 'S2', 'S2T', 'S3', 'S3T', 'S4', 'S5', 'S6'];
const total = scenarioIds.reduce((n, id) => n + readScenario(id).transactions.length, 0);

describe('Transactions', () => {
  it('lists every scenario transaction, newest first', async () => {
    renderAt('/transactions');
    await dataReady();
    await waitFor(() => expect(screen.getByTestId('txn-showing')).toHaveTextContent(`of ${total} transactions`));
    const rows = within(screen.getByRole('table', { name: 'Transactions' })).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(10);
  });
  it('filters by account', async () => {
    const user = userEvent.setup();
    renderAt('/transactions');
    await dataReady();
    await waitFor(() => expect(screen.getByTestId('txn-showing')).toHaveTextContent(`of ${total}`));
    await user.type(screen.getByLabelText('Filter by account'), 'B-207');
    await waitFor(() => expect(screen.getByTestId('txn-showing')).toHaveTextContent('of 3 transactions'));
    const rows = within(screen.getByRole('table', { name: 'Transactions' })).getAllByRole('row').slice(1);
    expect(rows.every((r) => r.textContent!.includes('B-207'))).toBe(true);
  });
  it('shows an empty state when nothing matches', async () => {
    renderAt('/transactions?q=zzzz');
    await dataReady();
    expect(await screen.findByText('No transactions match')).toBeInTheDocument();
  });
});

describe('Settings', () => {
  it('shows the prototype disclosure and never exposes secrets or env values', async () => {
    renderAt('/settings');
    await dataReady();
    expect(await screen.findByText('Prototype disclosure')).toBeInTheDocument();
    expect(screen.getByTestId('data-source')).toHaveTextContent('Bundled fixtures');
    const text = document.body.textContent ?? '';
    expect(text).not.toContain('demo-only-123');
    expect(text).not.toMatch(/VITE_|password|token|secret/i);
    expect(text).toContain(String(readCore().alerts.length));
  });
});
